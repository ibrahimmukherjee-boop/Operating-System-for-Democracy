"""Pydantic schemas for API request/response."""

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class CountryResponse(BaseModel):
    iso2: str
    iso3: str
    un_m49: int | None = None
    country_name: str
    region: str
    income_group: str = "unknown"
    population: int | None = None
    government_type: str | None = None
    constitution_url: str | None = None
    sovereign_status: str = "un_member"
    pilot: bool = False

    model_config = {"from_attributes": True}


class DomainResponse(BaseModel):
    id: str
    name: str
    sort_order: int

    model_config = {"from_attributes": True}


class ProvenanceResponse(BaseModel):
    source_id: str | None = None
    source_url: str | None = None
    dataset: str | None = None
    observation_date: str | None = None
    transformation: str | None = None
    normalisation_method: str | None = None
    weight: float | None = None
    model_version: str
    retrieved_at: str | None = None
    indicators: list[dict[str, Any]] | None = None


class DomainScoreResponse(BaseModel):
    domain_id: str
    domain_name: str | None = None
    score: float | None
    ci_lower: float | None = None
    ci_upper: float | None = None
    indicator_count: int = 0
    available_indicator_count: int = 0
    is_complete: bool = False
    provenance: dict[str, Any] | None = None


class CountryScoreResponse(BaseModel):
    country_iso3: str
    country_name: str | None = None
    overall_score: float | None
    raw_geometric_score: float | None = None
    red_line_cap_applied: float | None = None
    ci_lower: float | None = None
    ci_upper: float | None = None
    global_rank: int | None = None
    ranking_robustness: float | None = None
    domain_scores: list[DomainScoreResponse] = Field(default_factory=list)
    red_line_events: list[dict[str, Any]] = Field(default_factory=list)
    provenance: dict[str, Any] | None = None
    model_version: str


class RankingEntry(BaseModel):
    rank: int
    country_iso3: str
    country_name: str
    overall_score: float | None
    ci_lower: float | None = None
    ci_upper: float | None = None
    trend: str | None = None
    red_flags: int = 0


class RankingsResponse(BaseModel):
    rankings: list[RankingEntry]
    model_version: str
    weight_profile: str
    computed_at: datetime | None = None
    total_countries: int


class PolicyResponse(BaseModel):
    policy_id: str
    country_iso3: str
    country_name: str | None = None
    title: str
    status: str
    start_date: date | None = None
    end_date: date | None = None
    government_department: str | None = None
    policy_area: str | None = None
    stated_objectives: list[str] = Field(default_factory=list)
    public_value_domains: list[str] = Field(default_factory=list)
    maqasid_domains: list[str] = Field(default_factory=list)
    budget: dict[str, Any] | None = None
    baseline: dict[str, Any] | None = None
    targets: dict[str, Any] | None = None
    observed_outcomes: dict[str, Any] | None = None
    review_status: str
    ai_generated: bool = False
    score_components: dict[str, float | None] | None = None
    effectiveness_score: float | None = None
    sources: list[dict[str, Any]] = Field(default_factory=list)
    provenance: dict[str, Any] | None = None

    model_config = {"from_attributes": True}


class WeightProfileRequest(BaseModel):
    weights: dict[str, float] = Field(
        description="Domain weights keyed by D1-D10",
        examples=[{"D1": 1.0, "D2": 1.5, "D3": 1.0}],
    )


class SensitivityResponse(BaseModel):
    country_iso3: str
    base_rank: int | None
    ranking_robustness: float
    recomputed_score: float | None
    weight_profile: dict[str, float]


class SourceResponse(BaseModel):
    source_id: str
    name: str
    url: str | None = None
    dataset: str | None = None
    adapter: str | None = None

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str
    model_version: str
    pilot_countries: list[str]
