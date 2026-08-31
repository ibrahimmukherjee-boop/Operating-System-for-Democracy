# Operating System for a Democracy

**Policy in. Evidence out. Power audited.**

Operating System for a Democracy (OSD) is an open-source public-policy intelligence platform that models countries using a common hierarchy of societal objectives, maps government policies to those objectives, measures observed outcomes, compares promises with results, and ranks countries transparently—with a complete audit trail for every score.

## Mission

Create a transparent, auditable data-science framework for evaluating governments, countries, and public policies against explicit societal objectives.

## Three layers

```
Country State → Policy Engine → Outcome Evaluation
```

> Given what a country claims to value constitutionally, what policies is it implementing, and does the evidence show those policies are improving the things society is supposed to preserve?

## Ten domains

| ID | Domain |
|----|--------|
| D1 | Freedom of Religion & Conscience |
| D2 | Life & Physical Security |
| D3 | Intellect, Education & Information |
| D4 | Family & Child Welfare |
| D5 | Property & Economic Security |
| D6 | Justice & Rule of Law |
| D7 | Human Dignity |
| D8 | Democratic Consultation |
| D9 | Institutional Trust |
| D10 | Environmental / Intergenerational Harm |

The framework draws comparatively on Maqasid al-Sharia, Halakhic value hierarchies, liberal constitutionalism, human rights, and development economics—**without treating these traditions as identical**.

## Pilot countries

- United Kingdom (GBR)
- United States (USA)
- Denmark (DNK)
- India (IND)
- Singapore (SGP)

After the pipeline works for these five, it generalises to all 195 sovereign states.

## Quick start

### With Docker

```bash
docker compose up --build
```

- API: http://localhost:8742
- Dashboard: http://localhost:4317
- API docs: http://localhost:8742/docs

### Local development

```bash
# Backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
docker compose up -d postgres
python -m osd.cli seed
uvicorn api.main:app --reload --port 8742

# Frontend
cd dashboard && npm install && npm run dev
```

### Run tests

```bash
pytest
```

## Scoring methodology

1. Normalise indicators to 0–100
2. Calculate domain scores (weighted by source reliability)
3. Overall OSD = weighted geometric mean of domain scores
4. Confidence intervals via bootstrap / uncertainty engine
5. Red-line caps for catastrophic rights violations (non-compensatory)

Every number traces to: source URL, dataset, observation date, transformation, normalisation method, weight, model version.

## What would this look like in practice?

Take **homelessness**.

A government announces a five-year programme costing £4 billion. Under the present system, political debate quickly becomes ideological: one side calls it compassionate; another calls it wasteful.

Under a data-science democracy, the policy begins with an explicit objective:

**Reduce involuntary homelessness while preserving safety, dignity, fiscal sustainability and local community stability.**

The policy is then mapped against the constitutional and Maqāṣid framework:

**Life:** reduce deaths, rough sleeping and exposure-related illness.
**Property:** increase access to stable housing without arbitrarily infringing property rights.
**Intellect:** improve access to addiction and mental-health services.
**Family:** reduce children living in temporary accommodation.
**Dignity:** minimise degrading or unsafe living conditions.
**Justice:** ensure eligibility is applied consistently.

Before implementation, government publishes measurable targets:

* rough sleeping: −60% within five years;
* families in temporary accommodation: −40%;
* repeat homelessness within 24 months: below 15%;
* cost per sustainably housed person: published annually;
* preventable deaths among homeless people: −50%.

It also publishes the baseline, projected cost, assumptions and confidence intervals.

Every year, actual outcomes are compared with predictions.

If £2 billion has been spent but homelessness has increased, ministers cannot simply announce that the programme was “successful in other ways.” The objective function was declared in advance.

Change the programme. Explain the failure. Or stop funding it.

**That is what the handcuffs look like: not less democracy, but democracy that has to show its working.**

---

## Repository structure

```
operating-system-for-democracy/
├── docs/           Philosophy, methodology, data dictionary
├── schemas/        JSON schemas (country, policy, indicator, source)
├── src/osd/        Core engines (scoring, uncertainty, ingestion)
├── api/            FastAPI REST API
├── dashboard/      Next.js frontend
├── data/           Raw, staging, processed, country seeds
├── tests/          Pytest suite
└── results/        Rankings and methodology outputs
```

## Data integrity

- **No fabricated data.** Unavailable values are explicit (`null` with reason).
- **AI classifications** are marked `unverified` until source evidence or human review.
- **Provenance required** for every displayed score.

## Licence

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
