"""Uncertainty estimation and confidence intervals."""

import random
from dataclasses import dataclass

from osd.scoring.engine import IndicatorInput, compute_domain_score


@dataclass
class UncertaintyResult:
    point_estimate: float | None
    ci_lower: float | None
    ci_upper: float | None
    std_error: float | None
    method: str
    n_bootstrap: int


def bootstrap_domain_ci(
    indicators: list[IndicatorInput],
    domain_id: str,
    n_bootstrap: int = 500,
    confidence: float = 0.95,
    seed: int = 42,
) -> UncertaintyResult:
    available = [i for i in indicators if i.is_available and i.normalised_value is not None]
    if len(available) < 2:
        base = compute_domain_score(domain_id, indicators)
        return UncertaintyResult(
            point_estimate=base.score,
            ci_lower=base.score,
            ci_upper=base.score,
            std_error=None,
            method="insufficient_data_single_estimate",
            n_bootstrap=0,
        )

    rng = random.Random(seed)
    scores: list[float] = []
    for _ in range(n_bootstrap):
        sample = [rng.choice(available) for _ in range(len(available))]
        result = compute_domain_score(domain_id, sample)
        if result.score is not None:
            scores.append(result.score)

    if not scores:
        return UncertaintyResult(None, None, None, None, "bootstrap_failed", n_bootstrap)

    scores.sort()
    alpha = (1 - confidence) / 2
    lower_idx = int(alpha * len(scores))
    upper_idx = int((1 - alpha) * len(scores)) - 1
    mean = sum(scores) / len(scores)
    variance = sum((s - mean) ** 2 for s in scores) / len(scores)

    return UncertaintyResult(
        point_estimate=round(mean, 2),
        ci_lower=round(scores[lower_idx], 2),
        ci_upper=round(scores[upper_idx], 2),
        std_error=round(variance**0.5, 2),
        method="bootstrap",
        n_bootstrap=n_bootstrap,
    )


def missing_data_penalty(available: int, total: int) -> float:
    if total == 0:
        return 0.0
    coverage = available / total
    return round(coverage * 100, 2)
