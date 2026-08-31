# Operating System for a Democracy

**Maqasid in. Evidence out. Power audited.**

An open-source public-policy intelligence platform that scores governments, policies, and **every public expenditure** against **Maqasid** — the global objective function.

Local customs (**ʿurf**), including **Halacha**, can be tuned per country **only where they serve Maqasid and do not contradict it**. Halacha is not a co-equal scoring system.

## Live site (GitHub Pages)

After you click **Create repo** on this project and enable GitHub Pages (Settings → Pages → Source: GitHub Actions), the site deploys automatically from `.github/workflows/pages.yml`.

Expected URL pattern:

`https://<your-github-username>.github.io/<repo-name>/`

## Framework hierarchy

```
Maqasid (global objective function)
        ↓
ʿUrf — local customs (Halacha, constitutional practice, …)
        ↓
must not contradict Maqasid
        ↓
Government expenditure → Maqasid aim → targets → observed outcomes → audit
```

### Ten Maqasid domains

| ID | Domain | Maqasid |
|----|--------|---------|
| D1 | Freedom of Religion & Conscience | hifz_al_din |
| D2 | Life & Physical Security | hifz_al_nafs |
| D3 | Intellect, Education & Information | hifz_al_aql |
| D4 | Family & Child Welfare | hifz_al_nasl |
| D5 | Property & Economic Security | hifz_al_mal |
| D6 | Justice & Rule of Law | adl |
| D7 | Human Dignity | karamah |
| D8 | Democratic Consultation | shura |
| D9 | Institutional Trust | amanah |
| D10 | Environmental / Intergenerational Harm | la_darar |

## Pilot countries

United Kingdom · United States · Denmark · India · Singapore

## What this looks like in practice

Take **homelessness**.

A government announces a five-year programme costing £4 billion. Under the present system, political debate quickly becomes ideological: one side calls it compassionate; another calls it wasteful.

Under a Maqasid audit, the policy begins with an explicit objective:

**Reduce involuntary homelessness while preserving safety, dignity, fiscal sustainability and local community stability.**

Mapped to Maqasid:

* **Life (ḥifẓ al-nafs):** reduce deaths, rough sleeping and exposure-related illness.
* **Property (ḥifẓ al-māl):** increase access to stable housing without arbitrarily infringing property rights.
* **Intellect (ḥifẓ al-ʿaql):** improve access to addiction and mental-health services.
* **Family (ḥifẓ al-nasl):** reduce children living in temporary accommodation.
* **Dignity (karāmah):** minimise degrading or unsafe living conditions.
* **Justice (ʿadl):** ensure eligibility is applied consistently.

Local customs (ʿurf) — e.g. Halachic parallels such as *pikuach nefesh* or *kavod habriyot* — may annotate the policy **under** these Maqasid aims. They do not replace them.

Before implementation, government publishes measurable targets, baseline, cost, assumptions and confidence intervals. Every year, outcomes are compared with predictions.

If £2 billion has been spent but homelessness has increased, ministers cannot announce that the programme was “successful in other ways.” The objective function was declared in advance.

Change the programme. Explain the failure. Or stop funding it.

**That is what the handcuffs look like: not less democracy, but democracy that has to show its working.**

---

## Open-source project

**Operating System for a Democracy**

Three layers: **Country State → Policy Engine → Outcome Evaluation**

> Given Maqasid objectives, what policies is a country implementing, and does the evidence show those policies are improving what society is supposed to preserve?

## Static site (no local server required)

The public GitHub Pages site is fully static:

```bash
pip install -e .
python -m osd.cli export-static   # writes dashboard/public/data/*.json
cd dashboard && npm ci && npm run build   # outputs dashboard/out
```

Optional API/Postgres stack remains for research workflows — not required to browse rankings.

## Scoring

1. Normalise indicators 0–100
2. Domain scores = Maqasid objectives
3. Overall OSD = weighted geometric mean
4. Confidence intervals + red-line caps
5. Every score carries provenance
6. **Every expenditure must declare Maqasid mapping**

## Licence

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Philosophy: [docs/philosophy/maqasid.md](docs/philosophy/maqasid.md), [docs/philosophy/urf.md](docs/philosophy/urf.md).
