from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from api.schemas import CountryResponse, CountryScoreResponse, DomainScoreResponse, SensitivityResponse
from osd.db import get_db
from osd.models import Country, CountryScore, Domain, DomainScore, RedLineEvent
from osd.weighting.sensitivity import compute_ranking_robustness, perturb_weights
from osd.constants import DEFAULT_DOMAIN_WEIGHTS

router = APIRouter()


@router.get("", response_model=list[CountryResponse])
def list_countries(pilot_only: bool = False, db: Session = Depends(get_db)):
    q = db.query(Country)
    if pilot_only:
        q = q.filter(Country.pilot.is_(True))
    return q.order_by(Country.country_name).all()


@router.get("/{iso3}", response_model=CountryResponse)
def get_country(iso3: str, db: Session = Depends(get_db)):
    country = db.query(Country).filter(Country.iso3 == iso3.upper()).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country


@router.get("/{iso3}/score", response_model=CountryScoreResponse)
def get_country_score(iso3: str, db: Session = Depends(get_db)):
    iso3 = iso3.upper()
    country = db.query(Country).filter(Country.iso3 == iso3).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    score = (
        db.query(CountryScore)
        .filter(CountryScore.country_iso3 == iso3)
        .order_by(CountryScore.computed_at.desc())
        .first()
    )
    if not score:
        raise HTTPException(status_code=404, detail="No score computed for this country")

    domain_scores = (
        db.query(DomainScore)
        .filter(
            DomainScore.country_iso3 == iso3,
            DomainScore.model_version == score.model_version,
        )
        .all()
    )
    domains = {d.id: d.name for d in db.query(Domain).all()}
    red_lines = db.query(RedLineEvent).filter(RedLineEvent.country_iso3 == iso3).all()

    return CountryScoreResponse(
        country_iso3=iso3,
        country_name=country.country_name,
        overall_score=score.overall_score,
        raw_geometric_score=score.raw_geometric_score,
        red_line_cap_applied=score.red_line_cap_applied,
        ci_lower=score.ci_lower,
        ci_upper=score.ci_upper,
        global_rank=score.global_rank,
        ranking_robustness=score.ranking_robustness,
        domain_scores=[
            DomainScoreResponse(
                domain_id=ds.domain_id,
                domain_name=domains.get(ds.domain_id),
                score=ds.score,
                ci_lower=ds.ci_lower,
                ci_upper=ds.ci_upper,
                indicator_count=ds.indicator_count,
                available_indicator_count=ds.available_indicator_count,
                is_complete=ds.is_complete,
                provenance=ds.provenance_json,
            )
            for ds in domain_scores
        ],
        red_line_events=[
            {
                "violation_code": r.violation_code,
                "severity": r.severity,
                "cap_score": r.cap_score,
                "verified": r.verified,
                "review_status": r.review_status,
            }
            for r in red_lines
        ],
        provenance=score.provenance_json,
        model_version=score.model_version,
    )


@router.post("/{iso3}/sensitivity", response_model=SensitivityResponse)
def sensitivity_analysis(iso3: str, weights: dict[str, float] | None = None, db: Session = Depends(get_db)):
    iso3 = iso3.upper()
    all_domain_results: dict[str, list] = {}
    countries = db.query(Country).filter(Country.pilot.is_(True)).all()
    for c in countries:
        ds_list = (
            db.query(DomainScore)
            .filter(DomainScore.country_iso3 == c.iso3)
            .order_by(DomainScore.computed_at.desc())
            .limit(10)
            .all()
        )
        from osd.scoring.engine import DomainScoreResult

        all_domain_results[c.iso3] = [
            DomainScoreResult(
                domain_id=ds.domain_id,
                score=ds.score,
                ci_lower=ds.ci_lower,
                ci_upper=ds.ci_upper,
                indicator_count=ds.indicator_count,
                available_indicator_count=ds.available_indicator_count,
                is_complete=ds.is_complete,
                provenance=ds.provenance_json or {},
            )
            for ds in ds_list
        ]

    w = weights or DEFAULT_DOMAIN_WEIGHTS
    robustness = compute_ranking_robustness(iso3, all_domain_results, w)
    score = db.query(CountryScore).filter(CountryScore.country_iso3 == iso3).order_by(CountryScore.computed_at.desc()).first()

    return SensitivityResponse(
        country_iso3=iso3,
        base_rank=score.global_rank if score else None,
        ranking_robustness=robustness,
        recomputed_score=score.overall_score if score else None,
        weight_profile=w,
    )
