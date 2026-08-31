"""Weighting and sensitivity analysis for ranking robustness."""

from copy import deepcopy

from osd.constants import DEFAULT_DOMAIN_WEIGHTS, DOMAINS
from osd.scoring.engine import CountryScoreResult, DomainScoreResult, compute_country_score


def perturb_weights(
    base_weights: dict[str, float],
    domain_id: str,
    delta: float = 0.1,
) -> dict[str, float]:
    weights = deepcopy(base_weights)
    weights[domain_id] = max(0.01, weights.get(domain_id, 1.0) + delta)
    total = sum(weights.values())
    return {k: v / total * len(weights) for k, v in weights.items()}


def compute_ranking_robustness(
    country_iso3: str,
    all_domain_results: dict[str, list[DomainScoreResult]],
    base_weights: dict[str, float] | None = None,
    perturbations: int = 20,
) -> float:
    """Fraction of weight perturbations where country rank stays within ±3 positions."""
    weights = base_weights or DEFAULT_DOMAIN_WEIGHTS
    countries = list(all_domain_results.keys())
    if country_iso3 not in countries:
        return 0.0

    def rank_with_weights(w: dict[str, float]) -> dict[str, int]:
        scores: list[tuple[str, float]] = []
        for iso, domains in all_domain_results.items():
            result = compute_country_score(domains, w)
            if result.overall_score is not None:
                scores.append((iso, result.overall_score))
        scores.sort(key=lambda x: x[1], reverse=True)
        return {iso: i + 1 for i, (iso, _) in enumerate(scores)}

    base_rank = rank_with_weights(weights).get(country_iso3)
    if base_rank is None:
        return 0.0

    stable = 0
    domain_ids = [d["id"] for d in DOMAINS]
    for i in range(perturbations):
        domain = domain_ids[i % len(domain_ids)]
        delta = 0.1 if i % 2 == 0 else -0.1
        w = perturb_weights(weights, domain, delta)
        new_rank = rank_with_weights(w).get(country_iso3)
        if new_rank is not None and abs(new_rank - base_rank) <= 3:
            stable += 1

    return round(stable / perturbations * 100, 1) if perturbations else 0.0


def recompute_rankings(
    all_results: dict[str, CountryScoreResult],
) -> dict[str, int]:
    scored = [(iso, r.overall_score) for iso, r in all_results.items() if r.overall_score is not None]
    scored.sort(key=lambda x: x[1], reverse=True)
    return {iso: rank + 1 for rank, (iso, _) in enumerate(scored)}
