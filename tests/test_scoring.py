"""Tests for scoring engine."""

import pytest

from osd.scoring.engine import (
    IndicatorInput,
    apply_red_line_cap,
    compute_country_score,
    compute_domain_score,
    compute_policy_components,
    compute_policy_effectiveness,
    weighted_geometric_mean,
)


class TestWeightedGeometricMean:
    def test_equal_scores(self):
        scores = {"D1": 80.0, "D2": 80.0, "D3": 80.0}
        result = weighted_geometric_mean(scores)
        assert result == 80.0

    def test_low_score_not_compensated(self):
        arithmetic = (90 + 90 + 10) / 3
        geometric = weighted_geometric_mean({"D1": 90.0, "D2": 90.0, "D3": 10.0})
        assert geometric is not None
        assert geometric < arithmetic

    def test_missing_domains_excluded(self):
        scores = {"D1": 80.0, "D2": None, "D3": 60.0}
        result = weighted_geometric_mean(scores)
        assert result is not None
        assert 60 < result < 80

    def test_all_missing_returns_none(self):
        assert weighted_geometric_mean({"D1": None, "D2": None}) is None


class TestRedLineCap:
    def test_no_violations(self):
        score, cap = apply_red_line_cap(85.0, [])
        assert score == 85.0
        assert cap is None

    def test_verified_violation_caps_score(self):
        violations = [{"code": "genocide", "cap_score": 10.0, "verified": True}]
        score, cap = apply_red_line_cap(85.0, violations)
        assert score == 10.0
        assert cap == 10.0

    def test_unverified_violation_no_cap(self):
        violations = [{"code": "genocide", "cap_score": 10.0, "verified": False}]
        score, cap = apply_red_line_cap(85.0, violations)
        assert score == 85.0
        assert cap is None


class TestDomainScore:
    def test_insufficient_data(self):
        indicators = [
            IndicatorInput("ind1", None, is_available=False),
            IndicatorInput("ind2", None, is_available=False),
        ]
        result = compute_domain_score("D1", indicators)
        assert result.score is None
        assert result.available_indicator_count == 0

    def test_weighted_mean(self):
        indicators = [
            IndicatorInput("ind1", 80.0, weight=1.0, source_reliability=1.0, is_available=True),
            IndicatorInput("ind2", 60.0, weight=1.0, source_reliability=1.0, is_available=True),
        ]
        result = compute_domain_score("D1", indicators)
        assert result.score == 70.0
        assert result.available_indicator_count == 2


class TestCountryScore:
    def test_full_pipeline(self):
        domain_results = []
        for domain_id, score in [("D1", 80.0), ("D2", 70.0), ("D3", 90.0)]:
            domain_results.append(
                compute_domain_score(
                    domain_id,
                    [IndicatorInput("x", score, is_available=True, source_reliability=1.0)],
                )
            )
        result = compute_country_score(domain_results)
        assert result.overall_score is not None
        assert result.provenance["method"] == "weighted_geometric_mean"


class TestPolicyScoring:
    def test_unverified_policy_no_scores(self):
        components = compute_policy_components({"review_status": "unverified"})
        assert all(v is None for v in components.values())

    def test_effectiveness_none_when_empty(self):
        assert compute_policy_effectiveness({}) is None
