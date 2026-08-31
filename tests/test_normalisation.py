"""Tests for normalisation."""

from osd.normalisation import min_max_normalise, percentile_normalise, z_score_normalise


class TestMinMaxNormalise:
    def test_higher_better(self):
        result = min_max_normalise(50, 0, 100, "higher_better")
        assert result.is_available
        assert result.value == 50.0

    def test_lower_better(self):
        result = min_max_normalise(25, 0, 100, "lower_better")
        assert result.value == 75.0

    def test_missing_value(self):
        result = min_max_normalise(None, 0, 100)
        assert not result.is_available
        assert result.value is None

    def test_degenerate_range(self):
        result = min_max_normalise(5, 5, 5)
        assert not result.is_available


class TestPercentileNormalise:
    def test_median(self):
        values = list(range(0, 101))
        result = percentile_normalise(50, values, "higher_better")
        assert result.is_available
        assert 45 <= result.value <= 55


class TestZScoreNormalise:
    def test_at_mean(self):
        result = z_score_normalise(100, 100, 10, "higher_better")
        assert result.value == 50.0
