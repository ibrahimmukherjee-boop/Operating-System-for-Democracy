"""Data ingestion adapters and pipeline."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any


@dataclass
class IngestionRecord:
    country_iso3: str
    indicator_id: str
    raw_value: float | None
    observation_date: date
    source_id: str
    is_available: bool = True
    unavailable_reason: str | None = None
    metadata: dict[str, Any] | None = None


class DataAdapter(ABC):
    """Base adapter for external data sources."""

    adapter_id: str
    name: str
    base_url: str

    @abstractmethod
    def fetch_indicator(
        self, country_iso3: str, indicator_code: str
    ) -> IngestionRecord | None:
        pass


class WorldBankAdapter(DataAdapter):
    adapter_id = "world_bank"
    name = "World Bank Open Data"
    base_url = "https://data.worldbank.org"

    def fetch_indicator(self, country_iso3: str, indicator_code: str) -> IngestionRecord | None:
        return IngestionRecord(
            country_iso3=country_iso3,
            indicator_id=indicator_code,
            raw_value=None,
            observation_date=date.today(),
            source_id="world_bank",
            is_available=False,
            unavailable_reason="Adapter stub — run ingestion job to fetch live data",
        )


class VDemAdapter(DataAdapter):
    adapter_id = "v_dem"
    name = "V-Dem Institute"
    base_url = "https://www.v-dem.net"

    def fetch_indicator(self, country_iso3: str, indicator_code: str) -> IngestionRecord | None:
        return IngestionRecord(
            country_iso3=country_iso3,
            indicator_id=indicator_code,
            raw_value=None,
            observation_date=date.today(),
            source_id="v_dem",
            is_available=False,
            unavailable_reason="Adapter stub — run ingestion job to fetch live data",
        )


ADAPTERS: dict[str, DataAdapter] = {
    "world_bank": WorldBankAdapter(),
    "v_dem": VDemAdapter(),
}


def discover_policies_from_url(url: str) -> dict[str, Any]:
    """Candidate policy extraction — always returns unverified status."""
    return {
        "source_url": url,
        "review_status": "unverified",
        "ai_generated": True,
        "extraction_method": "llm_candidate",
        "note": "LLM extractions require human review before canonical database insertion",
    }


def generalise_to_all_countries(country_registry_path: str) -> list[str]:
    """Load full 195 sovereign state registry for generalised ingestion."""
    import json
    from pathlib import Path

    path = Path(country_registry_path)
    if not path.exists():
        return []
    data = json.loads(path.read_text())
    return [c["iso3"] for c in data.get("countries", [])]
