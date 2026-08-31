"""Scoring engine: domain scores and weighted geometric mean."""

from dataclasses import dataclass, field
from datetime import datetime
from math import exp, log
from typing import Any

from osd.constants import DEFAULT_DOMAIN_WEIGHTS, DOMAINS, RED_LINE_VIOLATIONS
from osd.config import settings


@dataclass
class IndicatorInput:
    indicator_id: str
    normalised_value: float | None
    weight: float = 1.0
    source_reliability: float = 0.8
    is_available: bool = True
    provenance: dict[str, Any] = field(default_factory=dict)


@dataclass
class DomainScoreResult:
    domain_id: str
    score: float | None
    ci_lower: float | None
    ci_upper: float | None
    indicator_count: int
    available_indicator_count: int
    is_complete: bool
    provenance: dict[str, Any]


@dataclass
class CountryScoreResult:
    overall_score: float | None
    raw_geometric_score: float | None
    red_line_cap_applied: float | None
    ci_lower: float | None
    ci_upper: float | None
    domain_scores: list[DomainScoreResult]
    provenance: dict[str, Any]


def compute_domain_score(
    domain_id: str,
    indicators: list[IndicatorInput],
) -> DomainScoreResult:
    available = [i for i in indicators if i.is_available and i.normalised_value is not None]
    if not available:
        return DomainScoreResult(
            domain_id=domain_id,
            score=None,
            ci_lower=None,
            ci_upper=None,
            indicator_count=len(indicators),
            available_indicator_count=0,
            is_complete=False,
            provenance={
                "model_version": settings.osd_model_version,
                "method": "reliability_weighted_mean",
                "status": "insufficient_data",
                "indicators": [i.indicator_id for i in indicators],
            },
        )

    total_weight = sum(i.weight * i.source_reliability for i in available)
    if total_weight == 0:
        return DomainScoreResult(
            domain_id=domain_id,
            score=None,
            ci_lower=None,
            ci_upper=None,
            indicator_count=len(indicators),
            available_indicator_count=len(available),
            is_complete=False,
            provenance={"model_version": settings.osd_model_version, "status": "zero_weight"},
        )

    score = sum(i.normalised_value * i.weight * i.source_reliability for i in available) / total_weight
    provenance_indicators = [
        {
            "indicator_id": i.indicator_id,
            "value": i.normalised_value,
            "weight": i.weight,
            "source_reliability": i.source_reliability,
            **i.provenance,
        }
        for i in available
    ]

    return DomainScoreResult(
        domain_id=domain_id,
        score=round(score, 2),
        ci_lower=None,
        ci_upper=None,
        indicator_count=len(indicators),
        available_indicator_count=len(available),
        is_complete=len(available) == len(indicators) and len(indicators) > 0,
        provenance={
            "model_version": settings.osd_model_version,
            "method": "reliability_weighted_mean",
            "computed_at": datetime.utcnow().isoformat(),
            "indicators": provenance_indicators,
        },
    )


def weighted_geometric_mean(
    domain_scores: dict[str, float | None],
    weights: dict[str, float] | None = None,
) -> float | None:
    w = weights or DEFAULT_DOMAIN_WEIGHTS
    valid = {d: s for d, s in domain_scores.items() if s is not None and s > 0}
    if not valid:
        return None

    weight_sum = sum(w.get(d, 1.0) for d in valid)
    if weight_sum == 0:
        return None

    log_sum = sum(w.get(d, 1.0) * log(s) for d, s in valid.items())
    return round(exp(log_sum / weight_sum), 2)


def apply_red_line_cap(
    score: float | None,
    violations: list[dict[str, Any]],
) -> tuple[float | None, float | None]:
    if score is None:
        return None, None
    if not violations:
        return score, None

    verified = [v for v in violations if v.get("verified", False)]
    if not verified:
        return score, None

    min_cap = min(v["cap_score"] for v in verified)
    if score > min_cap:
        return min_cap, min_cap
    return score, None


def compute_country_score(
    domain_results: list[DomainScoreResult],
    weights: dict[str, float] | None = None,
    red_line_violations: list[dict[str, Any]] | None = None,
) -> CountryScoreResult:
    domain_map = {r.domain_id: r.score for r in domain_results}
    raw = weighted_geometric_mean(domain_map, weights)
    final, cap = apply_red_line_cap(raw, red_line_violations or [])

    return CountryScoreResult(
        overall_score=final,
        raw_geometric_score=raw,
        red_line_cap_applied=cap,
        ci_lower=None,
        ci_upper=None,
        domain_scores=domain_results,
        provenance={
            "model_version": settings.osd_model_version,
            "method": "weighted_geometric_mean",
            "formula": "(prod(D_i^w_i))^(1/sum(w_i))",
            "weights": weights or DEFAULT_DOMAIN_WEIGHTS,
            "computed_at": datetime.utcnow().isoformat(),
            "red_line_violations": red_line_violations or [],
            "red_line_cap_applied": cap,
        },
    )


def compute_policy_components(
    policy_data: dict[str, Any],
) -> dict[str, float | None]:
    """Compute policy score components without collapsing prematurely."""
    components: dict[str, float | None] = {
        "need": None,
        "evidence_quality": None,
        "expected_impact": None,
        "cost_effectiveness": None,
        "maqasid_compatibility": None,
        "distributional_fairness": None,
        "observed_impact": None,
        "uncertainty": None,
        "implementation_quality": None,
        "long_term_sustainability": None,
    }

    review = policy_data.get("review_status", "unverified")
    maqasid = policy_data.get("maqasid_domains") or []

    # Expenditure without Maqasid mapping is incomplete — no silent pass.
    budget = policy_data.get("budget") or {}
    if budget.get("amount") and not maqasid:
        components["maqasid_compatibility"] = 0.0
    elif maqasid:
        components["maqasid_compatibility"] = 100.0 if review == "verified" else None

    if review != "verified":
        return components

    targets = policy_data.get("targets") or {}
    outcomes = policy_data.get("observed_outcomes") or policy_data.get("actual_outcomes") or {}

    if targets and outcomes:
        achieved = []
        for key, target in targets.items():
            if key.startswith("_"):
                continue
            actual = outcomes.get(key)
            if actual is None or target is None:
                continue
            if isinstance(target, dict):
                target_val = target.get("value")
                direction = target.get("direction", "decrease")
            else:
                target_val = target
                direction = "decrease"
            if target_val is None:
                continue
            if direction == "decrease" and target_val != 0:
                pct = (target_val - actual) / abs(target_val) * 100
                achieved.append(min(100, max(0, pct)))
            elif direction == "increase" and target_val != 0:
                pct = actual / target_val * 100
                achieved.append(min(100, max(0, pct)))

        if achieved:
            components["observed_impact"] = round(sum(achieved) / len(achieved), 2)

    sources = policy_data.get("sources") or []
    if sources:
        components["evidence_quality"] = 70.0 if len(sources) >= 2 else 50.0

    if budget.get("amount") and components["observed_impact"] is not None:
        components["cost_effectiveness"] = components["observed_impact"]

    return components


def compute_policy_effectiveness(components: dict[str, float | None]) -> float | None:
    values = [v for v in components.values() if v is not None]
    if not values:
        return None
    return round(sum(values) / len(values), 2)
