from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.schemas import RankingEntry, RankingsResponse
from osd import MODEL_VERSION
from osd.db import get_db
from osd.models import Country, CountryScore, RedLineEvent

router = APIRouter()


@router.get("", response_model=RankingsResponse)
def global_rankings(pilot_only: bool = True, db: Session = Depends(get_db)):
    latest_per_country = (
        db.query(
            CountryScore.country_iso3,
            func.max(CountryScore.computed_at).label("max_computed_at"),
        )
        .group_by(CountryScore.country_iso3)
        .subquery()
    )

    latest_scores = (
        db.query(CountryScore)
        .join(
            latest_per_country,
            (CountryScore.country_iso3 == latest_per_country.c.country_iso3)
            & (CountryScore.computed_at == latest_per_country.c.max_computed_at),
        )
        .order_by(CountryScore.global_rank.asc().nullslast())
    )

    if pilot_only:
        pilot_iso = [c.iso3 for c in db.query(Country).filter(Country.pilot.is_(True)).all()]
        latest_scores = latest_scores.filter(CountryScore.country_iso3.in_(pilot_iso))

    scores = latest_scores.all()
    countries = {c.iso3: c for c in db.query(Country).all()}

    rankings = []
    for s in scores:
        c = countries.get(s.country_iso3)
        if not c:
            continue
        red_count = (
            db.query(RedLineEvent)
            .filter(RedLineEvent.country_iso3 == s.country_iso3, RedLineEvent.verified.is_(True))
            .count()
        )
        rankings.append(
            RankingEntry(
                rank=s.global_rank or 0,
                country_iso3=s.country_iso3,
                country_name=c.country_name,
                overall_score=s.overall_score,
                ci_lower=s.ci_lower,
                ci_upper=s.ci_upper,
                trend=None,
                red_flags=red_count,
            )
        )

    rankings.sort(key=lambda r: r.rank if r.rank else 999)

    return RankingsResponse(
        rankings=rankings,
        model_version=MODEL_VERSION,
        weight_profile="default",
        computed_at=scores[0].computed_at if scores else None,
        total_countries=len(rankings),
    )
