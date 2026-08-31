from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.schemas import WeightProfileRequest, RankingsResponse, RankingEntry
from osd import MODEL_VERSION
from osd.db import get_db
from osd.models import Country, CountryScore, DomainScore
from osd.scoring.engine import DomainScoreResult, compute_country_score
from osd.weighting.sensitivity import recompute_rankings

router = APIRouter()


@router.post("/recompute", response_model=RankingsResponse)
def recompute_with_weights(body: WeightProfileRequest, db: Session = Depends(get_db)):
    countries = db.query(Country).filter(Country.pilot.is_(True)).all()
    results: dict[str, object] = {}

    for country in countries:
        domain_scores_db = (
            db.query(DomainScore)
            .filter(DomainScore.country_iso3 == country.iso3)
            .order_by(DomainScore.computed_at.desc())
            .limit(10)
            .all()
        )
        domain_results = [
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
            for ds in domain_scores_db
        ]
        results[country.iso3] = compute_country_score(domain_results, body.weights)

    ranks = recompute_rankings(results)
    rankings = []
    for iso, result in results.items():
        c = db.query(Country).filter(Country.iso3 == iso).first()
        rankings.append(
            RankingEntry(
                rank=ranks.get(iso, 0),
                country_iso3=iso,
                country_name=c.country_name if c else iso,
                overall_score=result.overall_score,
                ci_lower=result.ci_lower,
                ci_upper=result.ci_upper,
            )
        )
    rankings.sort(key=lambda r: r.rank)

    return RankingsResponse(
        rankings=rankings,
        model_version=MODEL_VERSION,
        weight_profile="custom",
        total_countries=len(rankings),
    )
