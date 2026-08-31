"""Tests for provenance tracker."""

from osd.provenance.tracker import build_provenance, validate_score_has_provenance


class TestProvenance:
    def test_build_provenance(self):
        p = build_provenance(
            source_id="world_bank",
            source_url="https://data.worldbank.org",
            model_version="0.1.0",
        )
        assert p["source_id"] == "world_bank"
        assert p["model_version"] == "0.1.0"
        assert "retrieved_at" in p

    def test_validate_requires_model_version(self):
        assert validate_score_has_provenance({"model_version": "0.1.0"})
        assert not validate_score_has_provenance(None)
        assert not validate_score_has_provenance({})
