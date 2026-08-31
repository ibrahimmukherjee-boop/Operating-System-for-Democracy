"""Domain constants and framework mappings."""

DOMAINS = [
    {"id": "D1", "name": "Freedom of Religion & Conscience", "order": 1},
    {"id": "D2", "name": "Life & Physical Security", "order": 2},
    {"id": "D3", "name": "Intellect, Education & Information", "order": 3},
    {"id": "D4", "name": "Family & Child Welfare", "order": 4},
    {"id": "D5", "name": "Property & Economic Security", "order": 5},
    {"id": "D6", "name": "Justice & Rule of Law", "order": 6},
    {"id": "D7", "name": "Human Dignity", "order": 7},
    {"id": "D8", "name": "Democratic Consultation", "order": 8},
    {"id": "D9", "name": "Institutional Trust", "order": 9},
    {"id": "D10", "name": "Environmental / Intergenerational Harm", "order": 10},
]

DEFAULT_DOMAIN_WEIGHTS = {d["id"]: 1.0 for d in DOMAINS}

MAQASID_PRINCIPLES = [
    {"code": "hifz_al_din", "name": "Preservation of religion/conscience", "domain_id": "D1"},
    {"code": "hifz_al_nafs", "name": "Preservation of life", "domain_id": "D2"},
    {"code": "hifz_al_aql", "name": "Preservation of intellect", "domain_id": "D3"},
    {"code": "hifz_al_nasl", "name": "Preservation of lineage/family", "domain_id": "D4"},
    {"code": "hifz_al_mal", "name": "Preservation of property", "domain_id": "D5"},
    {"code": "adl", "name": "Justice", "domain_id": "D6"},
    {"code": "karamah", "name": "Human dignity", "domain_id": "D7"},
    {"code": "shura", "name": "Consultation/participation", "domain_id": "D8"},
    {"code": "amanah", "name": "Trustworthiness/integrity", "domain_id": "D9"},
    {"code": "la_darar", "name": "Non-harm constraint", "domain_id": "D10"},
]

HALAKHA_PRINCIPLES = [
    {"code": "pikuach_nefesh", "name": "Preservation of life", "domain_id": "D2"},
    {"code": "tzedek", "name": "Justice", "domain_id": "D6"},
    {"code": "tzedakah", "name": "Welfare / redistribution", "domain_id": "D5"},
    {"code": "kavod_habriyot", "name": "Human dignity", "domain_id": "D7"},
    {"code": "dina_demalkhuta_dina", "name": "Legitimate civil authority", "domain_id": "D8"},
    {"code": "bal_tashchit", "name": "Preventing needless destruction", "domain_id": "D10"},
]

INTELLECTUAL_TRADITIONS = [
    "Maqasid al-Sharia",
    "Halakhic principles",
    "Liberal constitutionalism",
    "Human-rights law",
    "Development economics",
]

RED_LINE_VIOLATIONS = [
    {"code": "genocide", "name": "Genocide", "cap_score": 10.0, "severity": "critical"},
    {"code": "slavery", "name": "Slavery", "cap_score": 5.0, "severity": "critical"},
    {"code": "systematic_torture", "name": "Systematic torture", "cap_score": 15.0, "severity": "critical"},
    {"code": "religious_persecution", "name": "Religious persecution", "cap_score": 20.0, "severity": "severe"},
    {"code": "mass_arbitrary_detention", "name": "Mass arbitrary detention", "cap_score": 20.0, "severity": "severe"},
    {"code": "abolition_elections", "name": "Abolition of meaningful elections", "cap_score": 15.0, "severity": "critical"},
    {"code": "systematic_ethnic_discrimination", "name": "Systematic ethnic discrimination", "cap_score": 25.0, "severity": "severe"},
    {"code": "no_judicial_independence", "name": "Absence of judicial independence", "cap_score": 25.0, "severity": "severe"},
    {"code": "state_disappearance", "name": "State-sponsored disappearance", "cap_score": 15.0, "severity": "critical"},
]

POLICY_SCORE_COMPONENTS = [
    "need",
    "evidence_quality",
    "expected_impact",
    "cost_effectiveness",
    "rights_compatibility",
    "distributional_fairness",
    "observed_impact",
    "uncertainty",
    "implementation_quality",
    "long_term_sustainability",
]

PILOT_COUNTRIES = ["GBR", "USA", "DNK", "IND", "SGP"]
