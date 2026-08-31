from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.schemas import DomainResponse
from osd.db import get_db
from osd.models import Domain

router = APIRouter()


@router.get("", response_model=list[DomainResponse])
def list_domains(db: Session = Depends(get_db)):
    return db.query(Domain).order_by(Domain.sort_order).all()
