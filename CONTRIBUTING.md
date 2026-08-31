# Contributing to Operating System for a Democracy

Thank you for helping build transparent, auditable public-policy intelligence.

## Principles

1. **Never fabricate data.** Represent unavailable values explicitly.
2. **Every score needs provenance.** Source URL, dataset, observation date, transformation, normalisation, weight, model version.
3. **AI extractions are candidates only.** Mark `review_status: unverified` until a human or source evidence confirms.
4. **Traditions are comparative, not equivalent.** Maqasid, Halakha, constitutionalism, human rights, and development economics inform the framework separately.

## Development setup

```bash
docker compose up -d postgres
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
python -m osd.cli seed
uvicorn api.main:app --reload --port 8742
cd dashboard && npm install && npm run dev
```

## Pull requests

- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Include tests for scoring, uncertainty, and API changes
- Update `docs/data_dictionary/` when schemas change

## Adding countries

Pilot countries (GBR, USA, DNK, IND, SGP) are fully wired. To add the remaining 195 sovereign states, extend `data/countries/` and run the generalised ingestion pipeline in `src/osd/ingestion/`.
