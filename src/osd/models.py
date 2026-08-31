"""SQLAlchemy ORM models for OSD."""

from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from osd.db import Base


class Country(Base):
    __tablename__ = "countries"

    iso3: Mapped[str] = mapped_column(String(3), primary_key=True)
    iso2: Mapped[str] = mapped_column(String(2), unique=True, nullable=False)
    un_m49: Mapped[int | None] = mapped_column(Integer, nullable=True)
    country_name: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    income_group: Mapped[str] = mapped_column(String(50), default="unknown")
    population: Mapped[int | None] = mapped_column(Integer, nullable=True)
    government_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    constitution_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    sovereign_status: Mapped[str] = mapped_column(String(50), default="un_member")
    pilot: Mapped[bool] = mapped_column(Boolean, default=False)

    policies: Mapped[list["Policy"]] = relationship(back_populates="country_ref")
    observations: Mapped[list["Observation"]] = relationship(back_populates="country_ref")
    domain_scores: Mapped[list["DomainScore"]] = relationship(back_populates="country_ref")
    country_scores: Mapped[list["CountryScore"]] = relationship(back_populates="country_ref")
    red_line_events: Mapped[list["RedLineEvent"]] = relationship(back_populates="country_ref")


class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[str] = mapped_column(String(10), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class MaqasidPrinciple(Base):
    __tablename__ = "maqasid_principles"

    code: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id"), nullable=False)
    tradition_note: Mapped[str | None] = mapped_column(Text, nullable=True)


class HalakhaPrinciple(Base):
    __tablename__ = "halakha_principles"

    code: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id"), nullable=False)
    interpretive_note: Mapped[str | None] = mapped_column(Text, nullable=True)


class Source(Base):
    __tablename__ = "sources"

    source_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    dataset: Mapped[str | None] = mapped_column(String(500), nullable=True)
    publication_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    method: Mapped[str | None] = mapped_column(Text, nullable=True)
    licence: Mapped[str | None] = mapped_column(String(255), nullable=True)
    adapter: Mapped[str | None] = mapped_column(String(100), nullable=True)


class Methodology(Base):
    __tablename__ = "methodologies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    normalisation_method: Mapped[str] = mapped_column(String(50), nullable=False)
    formula: Mapped[str | None] = mapped_column(Text, nullable=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    version: Mapped[str] = mapped_column(String(50), primary_key=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    released_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Indicator(Base):
    __tablename__ = "indicators"

    indicator_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id"), nullable=False)
    direction: Mapped[str] = mapped_column(String(20), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(100), nullable=True)
    normalisation_method: Mapped[str] = mapped_column(String(50), default="min_max")
    source_reliability_default: Mapped[float] = mapped_column(Float, default=0.8)
    red_line_eligible: Mapped[bool] = mapped_column(Boolean, default=False)

    domain: Mapped["Domain"] = relationship()
    observations: Mapped[list["Observation"]] = relationship(back_populates="indicator_ref")


class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.source_id"), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Observation(Base):
    __tablename__ = "observations"
    __table_args__ = (UniqueConstraint("country_iso3", "indicator_id", "observation_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    country_iso3: Mapped[str] = mapped_column(ForeignKey("countries.iso3"), nullable=False)
    indicator_id: Mapped[str] = mapped_column(ForeignKey("indicators.indicator_id"), nullable=False)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.source_id"), nullable=False)
    dataset_id: Mapped[str | None] = mapped_column(ForeignKey("datasets.dataset_id"), nullable=True)
    raw_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    normalised_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    observation_date: Mapped[date] = mapped_column(Date, nullable=False)
    retrieved_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    transformation: Mapped[str | None] = mapped_column(Text, nullable=True)
    normalisation_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_reliability: Mapped[float] = mapped_column(Float, default=0.8)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    unavailable_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    provenance_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    country_ref: Mapped["Country"] = relationship(back_populates="observations")
    indicator_ref: Mapped["Indicator"] = relationship(back_populates="observations")
    source_ref: Mapped["Source"] = relationship()


class Policy(Base):
    __tablename__ = "policies"

    policy_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    country_iso3: Mapped[str] = mapped_column(ForeignKey("countries.iso3"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    government_department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    policy_area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    legal_basis: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    constitutional_constraints: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    maqasid_domains: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    halakha_parallels: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    public_value_domains: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    stated_objectives: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    target_population: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    baseline: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    targets: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    observed_outcomes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    budget: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    uncertainty: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    review_status: Mapped[str] = mapped_column(String(50), default="unverified")
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    policy_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    country_ref: Mapped["Country"] = relationship(back_populates="policies")
    sources: Mapped[list["PolicySource"]] = relationship(back_populates="policy_ref")
    scores: Mapped[list["PolicyScore"]] = relationship(back_populates="policy_ref")


class PolicySource(Base):
    __tablename__ = "policy_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    policy_id: Mapped[str] = mapped_column(ForeignKey("policies.policy_id"), nullable=False)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.source_id"), nullable=False)

    policy_ref: Mapped["Policy"] = relationship(back_populates="sources")
    source_ref: Mapped["Source"] = relationship()


class DomainScore(Base):
    __tablename__ = "domain_scores"
    __table_args__ = (UniqueConstraint("country_iso3", "domain_id", "model_version", "computed_at"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    country_iso3: Mapped[str] = mapped_column(ForeignKey("countries.iso3"), nullable=False)
    domain_id: Mapped[str] = mapped_column(ForeignKey("domains.id"), nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ci_lower: Mapped[float | None] = mapped_column(Float, nullable=True)
    ci_upper: Mapped[float | None] = mapped_column(Float, nullable=True)
    indicator_count: Mapped[int] = mapped_column(Integer, default=0)
    available_indicator_count: Mapped[int] = mapped_column(Integer, default=0)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    provenance_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_complete: Mapped[bool] = mapped_column(Boolean, default=False)

    country_ref: Mapped["Country"] = relationship(back_populates="domain_scores")


class CountryScore(Base):
    __tablename__ = "country_scores"
    __table_args__ = (UniqueConstraint("country_iso3", "model_version", "computed_at", "weight_profile"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    country_iso3: Mapped[str] = mapped_column(ForeignKey("countries.iso3"), nullable=False)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_geometric_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    red_line_cap_applied: Mapped[float | None] = mapped_column(Float, nullable=True)
    ci_lower: Mapped[float | None] = mapped_column(Float, nullable=True)
    ci_upper: Mapped[float | None] = mapped_column(Float, nullable=True)
    global_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ranking_robustness: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_profile: Mapped[str] = mapped_column(String(100), default="default")
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    provenance_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    country_ref: Mapped["Country"] = relationship(back_populates="country_scores")


class PolicyScore(Base):
    __tablename__ = "policy_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    policy_id: Mapped[str] = mapped_column(ForeignKey("policies.policy_id"), nullable=False)
    components: Mapped[dict] = mapped_column(JSONB, nullable=False)
    effectiveness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    provenance_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    policy_ref: Mapped["Policy"] = relationship(back_populates="scores")


class RedLineEvent(Base):
    __tablename__ = "red_line_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    country_iso3: Mapped[str] = mapped_column(ForeignKey("countries.iso3"), nullable=False)
    violation_code: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    cap_score: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_id: Mapped[str | None] = mapped_column(ForeignKey("sources.source_id"), nullable=True)
    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    review_status: Mapped[str] = mapped_column(String(50), default="unverified")

    country_ref: Mapped["Country"] = relationship(back_populates="red_line_events")
