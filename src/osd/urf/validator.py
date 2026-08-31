"""ʿUrf (local customs) validation under Maqasid.

Local customs — including Halacha — may be tuned per country only when they:
1. Map to one or more Maqasid principles / domains
2. Do not contradict Maqasid objectives or red-line constraints
"""

from typing import Any

from osd.constants import MAQASID_PRINCIPLES, URF_HALAKHA_MAPPINGS, URF_TRADITIONS

VALID_MAQASID = {m["code"] for m in MAQASID_PRINCIPLES}
VALID_URF = {u["code"] for u in URF_TRADITIONS}
HALAKHA_TO_MAQASID = {m["code"]: m["maqasid"] for m in URF_HALAKHA_MAPPINGS}


class UrfValidationError(ValueError):
    pass


def validate_urf_mapping(
    urf_tradition: str,
    local_principle: str,
    maqasid_code: str,
    contradicts_maqasid: bool = False,
) -> dict[str, Any]:
    """Validate that a local-custom mapping sits under Maqasid without contradiction."""
    if urf_tradition not in VALID_URF:
        raise UrfValidationError(
            f"Unknown urf tradition '{urf_tradition}'. Known: {sorted(VALID_URF)}"
        )
    if maqasid_code not in VALID_MAQASID:
        raise UrfValidationError(
            f"Urf mapping must target a Maqasid principle. Got '{maqasid_code}'."
        )
    if contradicts_maqasid:
        raise UrfValidationError(
            f"Local custom '{local_principle}' contradicts Maqasid '{maqasid_code}' — rejected."
        )

    if urf_tradition == "halakha":
        expected = HALAKHA_TO_MAQASID.get(local_principle)
        if expected and expected != maqasid_code:
            raise UrfValidationError(
                f"Halacha '{local_principle}' maps to Maqasid '{expected}', not '{maqasid_code}'."
            )

    return {
        "urf_tradition": urf_tradition,
        "local_principle": local_principle,
        "maqasid": maqasid_code,
        "status": "accepted",
        "rule": "urf_under_maqasid_non_contradiction",
    }


def expenditure_must_map_to_maqasid(budget: dict[str, Any] | None, maqasid_domains: list[str]) -> bool:
    """Every government expenditure line must declare at least one Maqasid objective."""
    if not budget or budget.get("amount") is None:
        return True  # no spend to map
    return bool(maqasid_domains) and all(m in VALID_MAQASID or m.startswith("hifz_") or m in {
        "adl", "karamah", "shura", "amanah", "la_darar"
    } for m in maqasid_domains)
