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
    """Build rankings for all 195 states; only pilots receive computed scores."""
    target = out_dir or OUT
    target.mkdir(parents=True, exist_ok=True)

    registry = _load_json(DATA / "countries" / "sovereign_states.json")
    countries: list[dict] = registry["countries"]
    # Overlay richer pilot metadata when available
    pilot_meta = {c["iso3"]: c for c in _load_json(DATA / "countries" / "pilot.json")}
    for c in countries:
        if c["iso3"] in pilot_meta:
            c.update({k: v for k, v in pilot_meta[c["iso3"]].items() if v is not None})

    indicators = _load_json(DATA / "processed" / "indicators.json")
    obs_file = _load_json(DATA / "processed" / "observations_seed.json")
    policies = _load_json(DATA / "processed" / "policies_seed.json")
    observations = obs_file["observations"]

    indicators_by_domain: dict[str, list] = {}
    for ind in indicators:
        indicators_by_domain.setdefault(ind["domain_id"], []).append(ind)

    obs_index: dict[tuple[str, str], dict] = {}
    for o in observations:
        obs_index[(o["country_iso3"], o["indicator_id"])] = o

    all_domain_results: dict[str, list] = {}
    country_payloads: dict[str, Any] = {}

    for country in countries:
        iso3 = country["iso3"]
        domain_results = []
        domain_scores_out = []
        has_any = False

        for domain in DOMAINS:
            inputs: list[IndicatorInput] = []
            for ind in indicators_by_domain.get(domain["id"], []):
                obs = obs_index.get((iso3, ind["indicator_id"]))
                if obs:
                    has_any = has_any or bool(obs.get("is_available"))
                    inputs.append(
                        IndicatorInput(
                            indicator_id=ind["indicator_id"],
                            normalised_value=obs.get("normalised_value")
                            if obs.get("is_available")
                            else None,
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
                            provenance={
                                "status": "no_observation",
                                "unavailable_reason": "No ingested observation for this country/indicator",
                            },
                        )
                    )

            result = compute_domain_score(domain["id"], inputs)
            # Skip expensive bootstrap for unscored countries
            if has_any and result.score is not None:
                uncertainty = bootstrap_domain_ci(inputs, domain["id"], n_bootstrap=80)
                ci_l, ci_u = uncertainty.ci_lower, uncertainty.ci_upper
            else:
                ci_l = ci_u = None

            domain_results.append(result)
            domain_scores_out.append(
                {
                    "domain_id": domain["id"],
                    "domain_name": domain["name"],
                    "maqasid": domain["maqasid"],
                    "score": result.score if has_any else None,
                    "ci_lower": ci_l if has_any else None,
                    "ci_upper": ci_u if has_any else None,
                    "indicator_count": result.indicator_count,
                    "available_indicator_count": result.available_indicator_count if has_any else 0,
                    "is_complete": result.is_complete if has_any else False,
                    "provenance": result.provenance
                    if has_any
                    else {
                        "status": "unavailable",
                        "reason": "Awaiting verified indicator ingestion",
                        "model_version": MODEL_VERSION,
                    },
                }
            )

        if has_any:
            country_result = compute_country_score(domain_results, DEFAULT_DOMAIN_WEIGHTS, [])
            all_domain_results[iso3] = domain_results
        else:
            country_result = type(
                "R",
                (),
                {
                    "overall_score": None,
                    "raw_geometric_score": None,
                    "red_line_cap_applied": None,
                    "ci_lower": None,
                    "ci_upper": None,
                    "provenance": {
                        "status": "unavailable",
                        "reason": "No verified observations yet — score not fabricated",
                        "model_version": MODEL_VERSION,
                        "method": "weighted_geometric_mean",
                    },
                },
            )()

        country_payloads[iso3] = {
            "country": country,
            "score": country_result,
            "domain_scores": domain_scores_out,
            "has_score": has_any,
        }

    scored = {
        iso: p["score"]
        for iso, p in country_payloads.items()
        if p["has_score"] and p["score"].overall_score is not None
    }
    ranks = recompute_rankings(scored)

    rankings = []
    for country in countries:
        iso3 = country["iso3"]
        payload = country_payloads[iso3]
        result = payload["score"]
        rankings.append(
            {
                "rank": ranks.get(iso3),
                "country_iso3": iso3,
                "country_name": country["country_name"],
                "region": country.get("region"),
                "overall_score": result.overall_score if payload["has_score"] else None,
                "ci_lower": getattr(result, "ci_lower", None) if payload["has_score"] else None,
                "ci_upper": getattr(result, "ci_upper", None) if payload["has_score"] else None,
                "status": "scored" if payload["has_score"] else "unavailable",
                "unavailable_reason": None
                if payload["has_score"]
                else "Awaiting verified indicator ingestion — not fabricated",
                "pilot": bool(country.get("pilot")),
                "red_flags": 0,
            }
        )

    # Sort: scored by rank, then unavailable alphabetically
    rankings.sort(
        key=lambda r: (
            0 if r["status"] == "scored" else 1,
            r["rank"] if r["rank"] is not None else 9999,
            r["country_name"],
        )
    )

    country_scores = {}
    for iso3, payload in country_payloads.items():
        result = payload["score"]
        robustness = (
            compute_ranking_robustness(iso3, all_domain_results) if payload["has_score"] else None
        )
        country_scores[iso3] = {
            "country_iso3": iso3,
            "country_name": payload["country"]["country_name"],
            "region": payload["country"].get("region"),
            "overall_score": result.overall_score if payload["has_score"] else None,
            "raw_geometric_score": getattr(result, "raw_geometric_score", None)
            if payload["has_score"]
            else None,
            "red_line_cap_applied": getattr(result, "red_line_cap_applied", None)
            if payload["has_score"]
            else None,
            "ci_lower": getattr(result, "ci_lower", None) if payload["has_score"] else None,
            "ci_upper": getattr(result, "ci_upper", None) if payload["has_score"] else None,
            "global_rank": ranks.get(iso3),
            "ranking_robustness": robustness,
            "domain_scores": payload["domain_scores"],
            "red_line_events": [],
            "provenance": result.provenance
            if hasattr(result, "provenance")
            else {"status": "unavailable", "model_version": MODEL_VERSION},
            "model_version": MODEL_VERSION,
            "framework": "maqasid",
            "status": "scored" if payload["has_score"] else "unavailable",
            "urf_note": "Local customs (including Halacha) are urf under Maqasid — not co-equal scores.",
        }

    policy_out = []
    for p in policies:
        urf = []
        for item in p.get("urf") or []:
            urf.append(item)
        for code in p.get("halakha_parallels") or []:
            urf.append({"tradition": "halakha", "principle": code, "layer": "urf"})
        components = compute_policy_components(p)
        policy_out.append(
            {
                **{k: v for k, v in p.items() if k not in ("halakha_parallels",)},
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

    scored_n = sum(1 for r in rankings if r["status"] == "scored")
    meta = {
        "model_version": MODEL_VERSION,
        "framework": "maqasid",
        "tagline": "Policy in. Evidence out. Power audited.",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_countries": len(countries),
        "scored_countries": scored_n,
        "unavailable_countries": len(countries) - scored_n,
        "pilot_countries": PILOT_COUNTRIES,
        "domains": DOMAINS,
        "maqasid_principles": MAQASID_PRINCIPLES,
        "default_weights": DEFAULT_DOMAIN_WEIGHTS,
        "urf": {
            "definition": "Local customs tunable per country under Maqasid; must not contradict Maqasid.",
            "halakha": "Treated as urf, not a co-equal global scoring system.",
        },
        "expenditure_rule": "Every government expenditure must map to one or more Maqasid objectives.",
        "data_integrity": "Unavailable scores are explicit. No fabricated observations.",
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
                "scored_countries": scored_n,
                "unavailable_countries": len(rankings) - scored_n,
            },
            indent=2,
        )
    )
    (target / "countries.json").write_text(json.dumps(countries, indent=2))
    (target / "country_scores.json").write_text(json.dumps(country_scores, indent=2))
    (target / "policies.json").write_text(json.dumps(policy_out, indent=2))

    results = ROOT / "results"
    results.mkdir(exist_ok=True)
    lines = ["rank,iso3,country_name,region,overall_score,status,model_version,framework"]
    for r in rankings:
        lines.append(
            f"{r['rank'] or ''},{r['country_iso3']},{r['country_name']},{r.get('region') or ''},"
            f"{r['overall_score'] if r['overall_score'] is not None else ''},{r['status']},{MODEL_VERSION},maqasid"
        )
    (results / "global_rankings.csv").write_text("\n".join(lines) + "\n")
    (results / "methodology.json").write_text(
        json.dumps(
            {
                "framework": "maqasid",
                "overall_method": "weighted_geometric_mean",
                "urf": "local customs under Maqasid (Halacha is urf)",
                "model_version": MODEL_VERSION,
                "countries": len(countries),
                "scored": scored_n,
            },
            indent=2,
        )
    )

    return target
