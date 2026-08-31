# Scoring Methodology — Maqasid-primary

## Global objective function

OSD scores countries and policies **only against Maqasid domains**. Local customs (ʿurf), including Halacha, do not supply an alternate score; they annotate local expression under Maqasid.

## Indicator normalisation

Raw indicators → 0–100. Unavailable values stay `null` with `unavailable_reason`.

## Domain scores

```
D_d = Σ(v_i × w_i × r_i) / Σ(w_i × r_i)
```

Each domain `D_d` is a Maqasid objective (D1–D10).

## Overall OSD score

Weighted geometric mean (non-compensatory):

```
OSD = (Π D_i^w_i)^(1/Σw_i)
```

## Government expenditure

Every expenditure must declare Maqasid objective(s). Evaluation:

```
spend → Maqasid aim → target → observed outcome → audit
```

## ʿUrf

Country-tunable. Validated by `osd.urf.validator`. Contradiction with Maqasid → rejected.

## Uncertainty & red lines

Bootstrap CIs. Verified red-line violations cap overall score (Maqasid non-compensatory constraints).
