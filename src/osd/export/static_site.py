"""Export static JSON for GitHub Pages — no runtime API or local server required."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from osd import MODEL_VERSION
from osd.constants import DEFAULT_DOMAIN_WEIGHTS, DOMAINS, MAQASID_PRINCIPLES, PILOT_COUNTRIES
from osd.scoring.engine import (
    IndicatorInput,
    compute_country_score,
    compute_domain_score,
    compute_policy_components,
    compute_policy_effectiveness,
)
from osd.uncertainty.engine import bootstrap_domain_ci
from osd.weighting.sensitivity import compute_ranking_robustness, recompute_rankings

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data"
OUT = ROOT / "dashboard" / "public" / "data"


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text())


def export_static(out_dir: Path | None = None) -> Path:
    """Build rankings, countries, policies, and meta JSON for the static site."""
    target = out_dir or OUT
    target.mkdir(parents=True, exist_ok=True)

    countries = _load_json(DATA / "countries" / "pilot.json")
    indicators = _load_json(DATA / "processed" / "indicators.json")
    obs_file = _load_json(DATA / "processed" / "observations_seed.json")
    policies = _load_json(DATA / "processed" / "policies_seed.json")
    observations = obs_file["observations"]

    indicators_by_domain: dict[str, list] = {}
    for ind in indicators:
        indicators_by_domain.setdefault(ind["domain_id"], []).append(ind)

    obs_index: dict[tuple[str, str], dict] = {}
    for o in observations:
        key = (o["country_iso3"], o["indicator_id"])
        obs_index[key] = o

    all_domain_results: dict[str, list] = {}
    country_payloads: dict[str, Any] = {}

    for country in countries:
        iso3 = country["iso3"]
        domain_results = []
        domain_scores_out = []
        for domain in DOMAINS:
            inputs: list[IndicatorInput] = []
            for ind in indicators_by_domain.get(domain["id"], []):
                obs = obs_index.get((iso3, ind["indicator_id"]))
                if obs:
                    inputs.append(
                        IndicatorInput(
                            indicator_id=ind["indicator_id"],
                            normalised_value=obs.get("normalised_value") if obs.get("is_available") else None,
                            is_available=bool(obs.get("is_available")),
                            provenance={
                                "source_id": obs.get("source_id"),
                                "observation_date": obs.get("observation_date"),
                                "verified": obs.get("verified", False),
                                "unavailable_reason": obs.get("unavailable_reason"),
                            },
                        )
                    )
                else:
                    inputs.append(
                        IndicatorInput(
                            indicator_id=ind["indicator_id"],
                            normalised_value=None,
                            is_available=False,
                            provenance={"status": "no_observation"},
                        )
                    )
            result = compute_domain_score(domain["id"], inputs)
            uncertainty = bootstrap_domain_ci(inputs, domain["id"], n_bootstrap=100)
            domain_results.append(result)
            domain_scores_out.append(
                {
                    "domain_id": domain["id"],
                    "domain_name": domain["name"],
                    "maqasid": domain["maqasid"],
                    "score": result.score,
                    "ci_lower": uncertainty.ci_lower,
                    "ci_upper": uncertainty.ci_upper,
                    "indicator_count": result.indicator_count,
                    "available_indicator_count": result.available_indicator_count,
                    "is_complete": result.is_complete,
                    "provenance": result.provenance,
                }
            )
        all_domain_results[iso3] = domain_results
        country_result = compute_country_score(domain_results, DEFAULT_DOMAIN_WEIGHTS, [])
        country_payloads[iso3] = {
            "country": country,
            "score": country_result,
            "domain_scores": domain_scores_out,
        }

    country_results = {iso: p["score"] for iso, p in country_payloads.items()}
    ranks = recompute_rankings(country_results)

    rankings = []
    for country in countries:
        iso3 = country["iso3"]
        result = country_payloads[iso3]["score"]
        rankings.append(
            {
                "rank": ranks.get(iso3, 0),
                "country_iso3": iso3,
                "country_name": country["country_name"],
                "overall_score": result.overall_score,
                "ci_lower": result.ci_lower,
                "ci_upper": result.ci_upper,
                "trend": None,
                "red_flags": 0,
            }
        )
    rankings.sort(key=lambda r: r["rank"] or 999)

    country_scores = {}
    for iso3, payload in country_payloads.items():
        result = payload["score"]
        robustness = compute_ranking_robustness(iso3, all_domain_results)
        country_scores[iso3] = {
            "country_iso3": iso3,
            "country_name": payload["country"]["country_name"],
            "overall_score": result.overall_score,
            "raw_geometric_score": result.raw_geometric_score,
            "red_line_cap_applied": result.red_line_cap_applied,
            "ci_lower": result.ci_lower,
            "ci_upper": result.ci_upper,
            "global_rank": ranks.get(iso3),
            "ranking_robustness": robustness,
            "domain_scores": payload["domain_scores"],
            "red_line_events": [],
            "provenance": result.provenance,
            "model_version": MODEL_VERSION,
            "framework": "maqasid",
            "urf_note": "Local customs (including Halacha) are urf under Maqasid — not co-equal scores.",
        }

    policy_out = []
    for p in policies:
        # Migrate halakha_parallels → urf under Maqasid
        urf = []
        for code in p.get("halakha_parallels") or p.get("urf_halakha") or []:
            urf.append({"tradition": "halakha", "principle": code, "layer": "urf"})
        components = compute_policy_components(p)
        policy_out.append(
            {
                **{k: v for k, v in p.items() if k != "halakha_parallels"},
                "urf": urf,
                "framework": "maqasid",
                "score_components": components,
                "effectiveness_score": compute_policy_effectiveness(components),
                "country_name": next(
                    (c["country_name"] for c in countries if c["iso3"] == p["country"]),
                    p["country"],
                ),
                "country_iso3": p["country"],
            }
        )

    meta = {
        "model_version": MODEL_VERSION,
        "framework": "maqasid",
        "tagline": "Policy in. Evidence out. Power audited.",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pilot_countries": PILOT_COUNTRIES,
        "domains": DOMAINS,
        "maqasid_principles": MAQASID_PRINCIPLES,
        "default_weights": DEFAULT_DOMAIN_WEIGHTS,
        "urf": {
            "definition": "Local customs tunable per country under Maqasid; must not contradict Maqasid.",
            "halakha": "Treated as urf, not a co-equal global scoring system.",
        },
        "expenditure_rule": "Every government expenditure must map to one or more Maqasid objectives.",
    }

    (target / "meta.json").write_text(json.dumps(meta, indent=2))
    (target / "rankings.json").write_text(
        json.dumps(
            {
                "rankings": rankings,
                "model_version": MODEL_VERSION,
                "weight_profile": "default",
                "framework": "maqasid",
                "computed_at": meta["generated_at"],
                "total_countries": len(rankings),
            },
            indent=2,
        )
    )
    (target / "countries.json").write_text(json.dumps(countries, indent=2))
    (target / "country_scores.json").write_text(json.dumps(country_scores, indent=2))
    (target / "policies.json").write_text(json.dumps(policy_out, indent=2))

    # Also write results/ for the repo
    results = ROOT / "results"
    results.mkdir(exist_ok=True)
    lines = ["rank,iso3,country_name,overall_score,model_version,framework"]
    for r in rankings:
        lines.append(
            f"{r['rank']},{r['country_iso3']},{r['country_name']},{r['overall_score']},{MODEL_VERSION},maqasid"
        )
    (results / "global_rankings.csv").write_text("\n".join(lines) + "\n")
    (results / "methodology.json").write_text(
        json.dumps(
            {
                "framework": "maqasid",
                "overall_method": "weighted_geometric_mean",
                "urf": "local customs under Maqasid (Halacha is urf)",
                "model_version": MODEL_VERSION,
            },
            indent=2,
        )
    )

    return target
