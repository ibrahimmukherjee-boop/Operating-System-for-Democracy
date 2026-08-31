"""CLI for database seeding and score computation."""

import json
from datetime import date, datetime
from pathlib import Path

import click

from osd.config import settings
from osd.constants import (
    DEFAULT_DOMAIN_WEIGHTS,
    DOMAINS,
    HALAKHA_PRINCIPLES,
    MAQASID_PRINCIPLES,
    RED_LINE_VIOLATIONS,
)
from osd.db import Base, SessionLocal, engine
from osd.models import (
    Country,
    Domain,
    DomainScore,
    CountryScore,
    HalakhaPrinciple,
    Indicator,
    MaqasidPrinciple,
    ModelVersion,
    Observation,
    Policy,
    PolicyScore,
    PolicySource,
    Source,
)
from osd.scoring.engine import (
    IndicatorInput,
    compute_country_score,
    compute_domain_score,
    compute_policy_components,
    compute_policy_effectiveness,
)
from osd.uncertainty.engine import bootstrap_domain_ci
from osd.weighting.sensitivity import compute_ranking_robustness, recompute_rankings

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

SOURCES = [
    {"source_id": "world_bank", "name": "World Bank Open Data", "url": "https://data.worldbank.org", "adapter": "world_bank", "licence": "CC BY 4.0"},
    {"source_id": "who", "name": "World Health Organization", "url": "https://www.who.int/data", "adapter": "who", "licence": "Various"},
    {"source_id": "v_dem", "name": "V-Dem Institute", "url": "https://www.v-dem.net", "adapter": "v_dem", "licence": "CC BY-SA 4.0"},
    {"source_id": "wjp", "name": "World Justice Project", "url": "https://worldjusticeproject.org", "adapter": "wjp", "licence": "WJP Terms"},
    {"source_id": "transparency_intl", "name": "Transparency International", "url": "https://www.transparency.org", "adapter": "transparency_intl", "licence": "CC BY-ND 4.0"},
    {"source_id": "unodc", "name": "UNODC", "url": "https://www.unodc.org", "adapter": "unodc", "licence": "UN Terms of Use"},
    {"source_id": "unesco", "name": "UNESCO Institute for Statistics", "url": "https://uis.unesco.org", "adapter": "unesco", "licence": "UN Terms of Use"},
    {"source_id": "unicef", "name": "UNICEF Data", "url": "https://data.unicef.org", "adapter": "unicef", "licence": "UNICEF Terms"},
    {"source_id": "owid", "name": "Our World in Data", "url": "https://ourworldindata.org", "adapter": "owid", "licence": "CC BY"},
    {"source_id": "freedom_house", "name": "Freedom House", "url": "https://freedomhouse.org", "adapter": "freedom_house", "licence": "Freedom House Terms"},
    {"source_id": "cato", "name": "Cato Institute Human Freedom Index", "url": "https://www.cato.org/human-freedom-index", "adapter": "cato", "licence": "Cato Terms"},
    {"source_id": "gov_uk_housing", "name": "GOV.UK Housing Statistics", "url": "https://www.gov.uk/government/collections/homelessness-statistics", "adapter": "gov_uk", "licence": "OGL v3.0"},
]


@click.group()
def cli():
    pass


@cli.command()
def init_db():
    """Create database tables."""
    Base.metadata.create_all(bind=engine)
    click.echo("Database tables created.")


@cli.command("export-static")
@click.option("--out", "out_dir", default=None, help="Output directory for static JSON")
def export_static_cmd(out_dir: str | None):
    """Export rankings and country data for GitHub Pages (no local server needed)."""
    from pathlib import Path

    from osd.export.static_site import export_static

    target = export_static(Path(out_dir) if out_dir else None)
    click.echo(f"Static site data written to {target}")


@cli.command()
def seed():
    """Seed pilot data, compute scores, export rankings."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_reference_data(db)
        _seed_countries(db)
        _seed_indicators(db)
        _seed_observations(db)
        _seed_policies(db)
        _compute_all_scores(db)
        _export_rankings(db)
        db.commit()
        click.echo("Seed complete.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _seed_reference_data(db):
    if not db.query(ModelVersion).filter(ModelVersion.version == settings.osd_model_version).first():
        db.add(ModelVersion(version=settings.osd_model_version, description="Initial OSD release"))

    for s in SOURCES:
        if not db.query(Source).filter(Source.source_id == s["source_id"]).first():
            db.add(Source(**s))

    for d in DOMAINS:
        if not db.query(Domain).filter(Domain.id == d["id"]).first():
            db.add(Domain(id=d["id"], name=d["name"], sort_order=d["order"]))

    for m in MAQASID_PRINCIPLES:
        if not db.query(MaqasidPrinciple).filter(MaqasidPrinciple.code == m["code"]).first():
            db.add(MaqasidPrinciple(code=m["code"], name=m["name"], domain_id=m["domain_id"]))

    for h in HALAKHA_PRINCIPLES:
        if not db.query(HalakhaPrinciple).filter(HalakhaPrinciple.code == h["code"]).first():
            db.add(HalakhaPrinciple(code=h["code"], name=h["name"], domain_id=h["domain_id"]))


def _seed_countries(db):
    pilot = json.loads((DATA_DIR / "countries" / "pilot.json").read_text())
    for c in pilot:
        if not db.query(Country).filter(Country.iso3 == c["iso3"]).first():
            db.add(Country(**c))


def _seed_indicators(db):
    indicators = json.loads((DATA_DIR / "processed" / "indicators.json").read_text())
    for ind in indicators:
        if not db.query(Indicator).filter(Indicator.indicator_id == ind["indicator_id"]).first():
            db.add(Indicator(**ind))


def _seed_observations(db):
    data = json.loads((DATA_DIR / "processed" / "observations_seed.json").read_text())
    for obs in data["observations"]:
        existing = (
            db.query(Observation)
            .filter(
                Observation.country_iso3 == obs["country_iso3"],
                Observation.indicator_id == obs["indicator_id"],
                Observation.observation_date == date.fromisoformat(obs["observation_date"]),
            )
            .first()
        )
        if existing:
            continue
        db.add(
            Observation(
                country_iso3=obs["country_iso3"],
                indicator_id=obs["indicator_id"],
                source_id=obs["source_id"],
                raw_value=obs.get("raw_value"),
                normalised_value=obs.get("normalised_value"),
                observation_date=date.fromisoformat(obs["observation_date"]),
                retrieved_at=datetime.utcnow(),
                normalisation_method="seed_pending_verification",
                source_reliability=0.8,
                weight=1.0,
                model_version=settings.osd_model_version,
                is_available=obs.get("is_available", True),
                unavailable_reason=obs.get("unavailable_reason"),
                provenance_json={
                    "verified": obs.get("verified", False),
                    "note": "Seed data pending live ingestion verification",
                    "source_id": obs["source_id"],
                },
            )
        )


def _seed_policies(db):
    policies = json.loads((DATA_DIR / "processed" / "policies_seed.json").read_text())
    for p in policies:
        if db.query(Policy).filter(Policy.policy_id == p["policy_id"]).first():
            continue
        policy = Policy(
            policy_id=p["policy_id"],
            country_iso3=p["country"],
            title=p["title"],
            status=p["status"],
            start_date=date.fromisoformat(p["start_date"]) if p.get("start_date") else None,
            end_date=date.fromisoformat(p["end_date"]) if p.get("end_date") else None,
            government_department=p.get("government_department"),
            policy_area=p.get("policy_area"),
            legal_basis=p.get("legal_basis"),
            constitutional_constraints=p.get("constitutional_constraints"),
            maqasid_domains=p.get("maqasid_domains"),
            halakha_parallels=[
                u.get("principle") for u in (p.get("urf") or []) if u.get("tradition") == "halakha"
            ] or p.get("halakha_parallels"),
            public_value_domains=p.get("public_value_domains"),
            stated_objectives=p.get("stated_objectives"),
            target_population=p.get("target_population"),
            baseline=p.get("baseline"),
            targets=p.get("targets"),
            observed_outcomes=p.get("observed_outcomes"),
            budget=p.get("budget"),
            review_status=p.get("review_status", "unverified"),
            ai_generated=p.get("ai_generated", False),
            policy_json=p,
        )
        db.add(policy)
        for src_id in p.get("sources", []):
            db.add(PolicySource(policy_id=p["policy_id"], source_id=src_id))

        components = compute_policy_components(p)
        db.add(
            PolicyScore(
                policy_id=p["policy_id"],
                components=components,
                effectiveness_score=compute_policy_effectiveness(components),
                model_version=settings.osd_model_version,
                computed_at=datetime.utcnow(),
                provenance_json={"model_version": settings.osd_model_version, "review_status": p.get("review_status")},
            )
        )


def _compute_all_scores(db):
    db.query(DomainScore).delete()
    db.query(CountryScore).delete()

    countries = db.query(Country).filter(Country.pilot.is_(True)).all()
    all_domain_results: dict[str, list] = {}
    computed_at = datetime.utcnow()

    for country in countries:
        domain_results = []
        for domain in DOMAINS:
            indicators_db = db.query(Indicator).filter(Indicator.domain_id == domain["id"]).all()
            indicator_inputs = []
            for ind in indicators_db:
                obs = (
                    db.query(Observation)
                    .filter(
                        Observation.country_iso3 == country.iso3,
                        Observation.indicator_id == ind.indicator_id,
                    )
                    .order_by(Observation.observation_date.desc())
                    .first()
                )
                if obs:
                    indicator_inputs.append(
                        IndicatorInput(
                            indicator_id=ind.indicator_id,
                            normalised_value=obs.normalised_value if obs.is_available else None,
                            weight=obs.weight,
                            source_reliability=obs.source_reliability,
                            is_available=obs.is_available,
                            provenance=obs.provenance_json or {},
                        )
                    )
                else:
                    indicator_inputs.append(
                        IndicatorInput(
                            indicator_id=ind.indicator_id,
                            normalised_value=None,
                            is_available=False,
                            provenance={"status": "no_observation"},
                        )
                    )

            result = compute_domain_score(domain["id"], indicator_inputs)
            uncertainty = bootstrap_domain_ci(indicator_inputs, domain["id"], n_bootstrap=200)

            db.add(
                DomainScore(
                    country_iso3=country.iso3,
                    domain_id=domain["id"],
                    score=result.score,
                    ci_lower=uncertainty.ci_lower,
                    ci_upper=uncertainty.ci_upper,
                    indicator_count=result.indicator_count,
                    available_indicator_count=result.available_indicator_count,
                    model_version=settings.osd_model_version,
                    computed_at=computed_at,
                    provenance_json=result.provenance,
                    is_complete=result.is_complete,
                )
            )
            domain_results.append(result)

        all_domain_results[country.iso3] = domain_results

    country_results = {}
    for country in countries:
        violations = []
        country_result = compute_country_score(all_domain_results[country.iso3], DEFAULT_DOMAIN_WEIGHTS, violations)
        country_results[country.iso3] = country_result

    ranks = recompute_rankings(country_results)

    for country in countries:
        result = country_results[country.iso3]
        robustness = compute_ranking_robustness(country.iso3, all_domain_results)
        domain_scores = all_domain_results[country.iso3]
        ci_lowers = [d.ci_lower for d in domain_scores if d.ci_lower is not None]
        ci_uppers = [d.ci_upper for d in domain_scores if d.ci_upper is not None]

        db.add(
            CountryScore(
                country_iso3=country.iso3,
                overall_score=result.overall_score,
                raw_geometric_score=result.raw_geometric_score,
                red_line_cap_applied=result.red_line_cap_applied,
                ci_lower=min(ci_lowers) if ci_lowers else None,
                ci_upper=max(ci_uppers) if ci_uppers else None,
                global_rank=ranks.get(country.iso3),
                ranking_robustness=robustness,
                weight_profile="default",
                model_version=settings.osd_model_version,
                computed_at=computed_at,
                provenance_json=result.provenance,
            )
        )


def _export_rankings(db):
    results_dir = Path(__file__).resolve().parents[2] / "results"
    results_dir.mkdir(exist_ok=True)

    scores = db.query(CountryScore).order_by(CountryScore.global_rank).all()
    countries = {c.iso3: c.country_name for c in db.query(Country).all()}

    lines = ["rank,iso3,country_name,overall_score,ci_lower,ci_upper,model_version"]
    for s in scores:
        lines.append(
            f"{s.global_rank},{s.country_iso3},{countries.get(s.country_iso3, '')},{s.overall_score},{s.ci_lower},{s.ci_upper},{s.model_version}"
        )
    (results_dir / "global_rankings.csv").write_text("\n".join(lines) + "\n")

    methodology = {
        "model_version": settings.osd_model_version,
        "overall_method": "weighted_geometric_mean",
        "domain_method": "reliability_weighted_mean",
        "uncertainty_method": "bootstrap",
        "red_line_caps": RED_LINE_VIOLATIONS,
        "default_weights": DEFAULT_DOMAIN_WEIGHTS,
    }
    (results_dir / "methodology.json").write_text(json.dumps(methodology, indent=2))


if __name__ == "__main__":
    cli()
