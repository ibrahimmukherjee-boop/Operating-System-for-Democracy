"""Tests for uncertainty engine."""

from osd.scoring.engine import IndicatorInput
from osd.uncertainty.engine import bootstrap_domain_ci, missing_data_penalty


class TestBootstrapCI:
    def test_insufficient_data(self):
        indicators = [IndicatorInput("x", 80.0, is_available=True)]
        result = bootstrap_domain_ci(indicators, "D1", n_bootstrap=100)
        assert result.point_estimate == 80.0

    def test_bootstrap_with_multiple_indicators(self):
        indicators = [
            IndicatorInput("a", 70.0, is_available=True, source_reliability=1.0),
            IndicatorInput("b", 90.0, is_available=True, source_reliability=1.0),
            IndicatorInput("c", 80.0, is_available=True, source_reliability=1.0),
        ]
        result = bootstrap_domain_ci(indicators, "D1", n_bootstrap=200, seed=42)
        assert result.ci_lower is not None
        assert result.ci_upper is not None
        assert result.ci_lower <= result.point_estimate <= result.ci_upper


class TestMissingDataPenalty:
    def test_full_coverage(self):
        assert missing_data_penalty(10, 10) == 100.0

    def test_partial_coverage(self):
        assert missing_data_penalty(5, 10) == 50.0
