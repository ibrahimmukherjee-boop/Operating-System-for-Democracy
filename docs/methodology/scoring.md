# Scoring Methodology

## Indicator normalisation

Raw indicators are transformed to a 0–100 scale using methods declared per indicator:

- `min_max`: linear scaling with direction adjustment
- `percentile`: rank within reference distribution
- `z_score`: standardised distance from mean
- `binary`: 0 or 100 for presence/absence

Unavailable values remain `null` with explicit `unavailable_reason`.

## Domain scores

For each domain *d*, with available indicators *i*:

```
D_d = Σ(v_i × w_i × r_i) / Σ(w_i × r_i)
```

Where:
- `v_i` = normalised indicator value
- `w_i` = indicator weight
- `r_i` = source reliability weight

## Overall OSD score

Weighted geometric mean across domains:

```
OSD = (Π D_i^w_i)^(1/Σw_i)
```

This prevents compensating catastrophic failures in one domain with excellence in another.

## Uncertainty

Bootstrap resampling (default 500 iterations) produces 95% confidence intervals per domain.

## Red-line caps

Verified constitutional violations cap overall score regardless of other performance. Unverified allegations do not trigger caps.

## Policy scoring

Ten components computed separately before optional effectiveness aggregation. Unverified policies return null components.
