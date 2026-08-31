from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.schemas import SourceResponse
from osd.db import get_db
from osd.models import Source

router = APIRouter()


@router.get("", response_model=list[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    return db.query(Source).order_by(Source.name).all()
