"""Tests for urf-under-Maqasid validation."""

import pytest

from osd.urf.validator import (
    UrfValidationError,
    expenditure_must_map_to_maqasid,
    validate_urf_mapping,
)


class TestUrfValidation:
    def test_halakha_as_urf_accepted(self):
        result = validate_urf_mapping("halakha", "pikuach_nefesh", "hifz_al_nafs")
        assert result["status"] == "accepted"
        assert result["urf_tradition"] == "halakha"

    def test_contradiction_rejected(self):
        with pytest.raises(UrfValidationError):
            validate_urf_mapping("halakha", "pikuach_nefesh", "hifz_al_nafs", contradicts_maqasid=True)

    def test_wrong_maqasid_for_halakha(self):
        with pytest.raises(UrfValidationError):
            validate_urf_mapping("halakha", "pikuach_nefesh", "hifz_al_mal")

    def test_unknown_tradition(self):
        with pytest.raises(UrfValidationError):
            validate_urf_mapping("not_a_tradition", "x", "adl")


class TestExpenditureRule:
    def test_spend_requires_maqasid(self):
        assert not expenditure_must_map_to_maqasid({"amount": 1e9}, [])
        assert expenditure_must_map_to_maqasid({"amount": 1e9}, ["hifz_al_nafs"])

    def test_no_budget_ok(self):
        assert expenditure_must_map_to_maqasid(None, [])
