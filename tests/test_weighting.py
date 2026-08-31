"""Tests for weighting sensitivity."""

from osd.scoring.engine import DomainScoreResult
from osd.weighting.sensitivity import compute_ranking_robustness, recompute_rankings


def _domain_result(domain_id: str, score: float) -> DomainScoreResult:
    return DomainScoreResult(
        domain_id=domain_id,
        score=score,
        ci_lower=score - 5,
        ci_upper=score + 5,
        indicator_count=1,
        available_indicator_count=1,
        is_complete=True,
        provenance={},
    )


class TestRankingRobustness:
    def test_single_country(self):
        results = {"GBR": [_domain_result("D1", 80.0), _domain_result("D2", 70.0)]}
        robustness = compute_ranking_robustness("GBR", results, perturbations=10)
        assert 0 <= robustness <= 100


class TestRecomputeRankings:
    def test_orders_by_score(self):
        from osd.scoring.engine import CountryScoreResult

        results = {
            "GBR": CountryScoreResult(85.0, 85.0, None, None, None, [], {}),
            "USA": CountryScoreResult(75.0, 75.0, None, None, None, [], {}),
            "DNK": CountryScoreResult(90.0, 90.0, None, None, None, [], {}),
        }
        ranks = recompute_rankings(results)
        assert ranks["DNK"] == 1
        assert ranks["GBR"] == 2
        assert ranks["USA"] == 3
