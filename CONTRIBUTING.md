# Contributing to Operating System for a Democracy

Thank you for helping build transparent, auditable public-policy intelligence.

## Principles

1. **Maqasid is the global objective function.** All scores and expenditures map to Maqasid.
2. **ʿUrf is local.** Halacha and other customs are country-tunable under Maqasid; contradictions are rejected.
3. **Never fabricate data.** Represent unavailable values explicitly.
4. **Every score needs provenance.**
5. **AI extractions are candidates only** (`review_status: unverified`).

## Public site (GitHub Pages)

```bash
pip install -e .
python -m osd.cli export-static
cd dashboard && npm ci && npm run build
```

Push to `main` — `.github/workflows/pages.yml` deploys the static site. No local server is required for the public rankings.

## Pull requests

- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Include tests for scoring, urf validation, and export changes
- Update `docs/` when the Maqasid/urf model changes

## Adding countries

Pilot countries (GBR, USA, DNK, IND, SGP) are fully wired. Extend `data/countries/` and re-run `export-static` for GitHub Pages.
