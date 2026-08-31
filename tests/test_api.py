"""API integration tests."""

import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "postgresql://osd:osd@localhost:5432/osd")


@pytest.fixture(scope="module")
def client():
    from osd.db import Base, engine
    from osd.cli import seed as seed_cmd

    Base.metadata.create_all(bind=engine)
    try:
        from click.testing import CliRunner
        from osd.cli import cli

        runner = CliRunner()
        result = runner.invoke(cli, ["seed"])
        if result.exception:
            pytest.skip(f"Database seed failed: {result.exception}")
    except Exception as e:
        pytest.skip(f"Database not available: {e}")

    from api.main import app

    with TestClient(app) as c:
        yield c


class TestHealth:
    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert len(data["pilot_countries"]) == 5


class TestRankings:
    def test_global_rankings(self, client):
        r = client.get("/api/v1/rankings")
        assert r.status_code == 200
        data = r.json()
        assert data["total_countries"] == 5
        assert len(data["rankings"]) == 5


class TestCountries:
    def test_list_pilot_countries(self, client):
        r = client.get("/api/v1/countries?pilot_only=true")
        assert r.status_code == 200
        assert len(r.json()) == 5

    def test_country_score_has_provenance(self, client):
        r = client.get("/api/v1/countries/GBR/score")
        assert r.status_code == 200
        data = r.json()
        assert "provenance" in data
        assert data["model_version"]


class TestPolicies:
    def test_homelessness_policy(self, client):
        r = client.get("/api/v1/policies/GBR-HOUSING-2026-001")
        assert r.status_code == 200
        data = r.json()
        assert data["review_status"] == "unverified"
        assert data["ai_generated"] is True
