"""Indicator normalisation to 0-100 scale."""

from dataclasses import dataclass


@dataclass
class NormalisationResult:
    value: float | None
    method: str
    is_available: bool
    reason: str | None = None


def min_max_normalise(
    raw: float | None,
    min_val: float,
    max_val: float,
    direction: str = "higher_better",
) -> NormalisationResult:
    if raw is None:
        return NormalisationResult(None, "min_max", False, "raw value missing")
    if max_val == min_val:
        return NormalisationResult(None, "min_max", False, "degenerate range")
    norm = (raw - min_val) / (max_val - min_val) * 100.0
    if direction == "lower_better":
        norm = 100.0 - norm
    return NormalisationResult(max(0.0, min(100.0, norm)), "min_max", True)


def percentile_normalise(
    raw: float | None,
    values: list[float],
    direction: str = "higher_better",
) -> NormalisationResult:
    if raw is None:
        return NormalisationResult(None, "percentile", False, "raw value missing")
    if not values:
        return NormalisationResult(None, "percentile", False, "reference distribution empty")
    below = sum(1 for v in values if v < raw)
    norm = (below / len(values)) * 100.0
    if direction == "lower_better":
        norm = 100.0 - norm
    return NormalisationResult(norm, "percentile", True)


def z_score_normalise(
    raw: float | None,
    mean: float,
    std: float,
    direction: str = "higher_better",
) -> NormalisationResult:
    if raw is None:
        return NormalisationResult(None, "z_score", False, "raw value missing")
    if std == 0:
        return NormalisationResult(None, "z_score", False, "zero standard deviation")
    z = (raw - mean) / std
    norm = 50.0 + z * 15.0
    if direction == "lower_better":
        norm = 100.0 - norm
    return NormalisationResult(max(0.0, min(100.0, norm)), "z_score", True)
