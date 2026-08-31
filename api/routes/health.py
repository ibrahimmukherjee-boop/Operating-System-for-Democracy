from fastapi import APIRouter

from api.schemas import HealthResponse
from osd import MODEL_VERSION
from osd.constants import PILOT_COUNTRIES

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
@router.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        model_version=MODEL_VERSION,
        pilot_countries=PILOT_COUNTRIES,
    )
