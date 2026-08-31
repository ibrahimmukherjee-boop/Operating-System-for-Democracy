# Data Dictionary

## Core entities

### countries
ISO-identified sovereign states with metadata: region, income group, population, government type, constitution URL.

### policies
Structured policy objects with lifecycle fields, Maqāṣid/Halakha mappings, baselines, targets, outcomes, review status.

### indicators
Measurable variables assigned to one of ten domains with direction and normalisation method.

### observations
Country-indicator values with full provenance chain.

### sources
External data providers with URL, licence, and adapter identifier.

## Review statuses

| Status | Meaning |
|--------|---------|
| unverified | AI candidate or pending human review |
| pending_review | Submitted for review |
| verified | Confirmed against source evidence |
| rejected | Failed verification |

## Missing data

Observations with `is_available=false` include `unavailable_reason`. UI displays "Unavailable" — never interpolated values.
