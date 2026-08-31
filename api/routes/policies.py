from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.schemas import PolicyResponse
from osd.db import get_db
from osd.models import Country, Policy, PolicyScore, PolicySource, Source

router = APIRouter()


def _policy_to_response(policy: Policy, db: Session) -> PolicyResponse:
    country = db.query(Country).filter(Country.iso3 == policy.country_iso3).first()
    latest_score = (
        db.query(PolicyScore)
        .filter(PolicyScore.policy_id == policy.policy_id)
        .order_by(PolicyScore.computed_at.desc())
        .first()
    )
    sources = []
    for ps in db.query(PolicySource).filter(PolicySource.policy_id == policy.policy_id).all():
        src = db.query(Source).filter(Source.source_id == ps.source_id).first()
        if src:
            sources.append({"source_id": src.source_id, "name": src.name, "url": src.url})

    return PolicyResponse(
        policy_id=policy.policy_id,
        country_iso3=policy.country_iso3,
        country_name=country.country_name if country else None,
        title=policy.title,
        status=policy.status,
        start_date=policy.start_date,
        end_date=policy.end_date,
        government_department=policy.government_department,
        policy_area=policy.policy_area,
        stated_objectives=policy.stated_objectives or [],
        public_value_domains=policy.public_value_domains or [],
        maqasid_domains=policy.maqasid_domains or [],
        budget=policy.budget,
        baseline=policy.baseline,
        targets=policy.targets,
        observed_outcomes=policy.observed_outcomes,
        review_status=policy.review_status,
        ai_generated=policy.ai_generated,
        score_components=latest_score.components if latest_score else None,
        effectiveness_score=latest_score.effectiveness_score if latest_score else None,
        sources=sources,
        provenance=latest_score.provenance_json if latest_score else None,
    )


@router.get("", response_model=list[PolicyResponse])
def list_policies(country: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Policy)
    if country:
        q = q.filter(Policy.country_iso3 == country.upper())
    return [_policy_to_response(p, db) for p in q.all()]


@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: str, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.policy_id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return _policy_to_response(policy, db)
