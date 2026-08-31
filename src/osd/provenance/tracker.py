"""Provenance tracking — every score must trace to source evidence."""

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class ProvenanceRecord:
    source_id: str
    source_url: str | None
    dataset: str | None
    observation_date: str | None
    transformation: str | None
    normalisation_method: str | None
    weight: float | None
    model_version: str
    retrieved_at: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "source_id": self.source_id,
            "source_url": self.source_url,
            "dataset": self.dataset,
            "observation_date": self.observation_date,
            "transformation": self.transformation,
            "normalisation_method": self.normalisation_method,
            "weight": self.weight,
            "model_version": self.model_version,
            "retrieved_at": self.retrieved_at,
        }


def build_provenance(
    source_id: str,
    source_url: str | None = None,
    dataset: str | None = None,
    observation_date: str | None = None,
    transformation: str | None = None,
    normalisation_method: str | None = None,
    weight: float | None = None,
    model_version: str = "0.1.0",
) -> dict[str, Any]:
    return ProvenanceRecord(
        source_id=source_id,
        source_url=source_url,
        dataset=dataset,
        observation_date=observation_date,
        transformation=transformation,
        normalisation_method=normalisation_method,
        weight=weight,
        model_version=model_version,
        retrieved_at=datetime.utcnow().isoformat(),
    ).to_dict()


def validate_score_has_provenance(provenance: dict[str, Any] | None) -> bool:
    if not provenance:
        return False
    required = ["model_version"]
    return all(provenance.get(k) for k in required)
