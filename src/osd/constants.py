"""Domain constants — Maqasid-primary framework with urf (local customs)."""

# Ten Maqāṣid domains form the global objective function.
# All country scoring and government expenditure must map to these.
DOMAINS = [
    {
        "id": "D1",
        "name": "Freedom of Religion & Conscience",
        "maqasid": "hifz_al_din",
        "order": 1,
    },
    {
        "id": "D2",
        "name": "Life & Physical Security",
        "maqasid": "hifz_al_nafs",
        "order": 2,
    },
    {
        "id": "D3",
        "name": "Intellect, Education & Information",
        "maqasid": "hifz_al_aql",
        "order": 3,
    },
    {
        "id": "D4",
        "name": "Family & Child Welfare",
        "maqasid": "hifz_al_nasl",
        "order": 4,
    },
    {
        "id": "D5",
        "name": "Property & Economic Security",
        "maqasid": "hifz_al_mal",
        "order": 5,
    },
    {
        "id": "D6",
        "name": "Justice & Rule of Law",
        "maqasid": "adl",
        "order": 6,
    },
    {
        "id": "D7",
        "name": "Human Dignity",
        "maqasid": "karamah",
        "order": 7,
    },
    {
        "id": "D8",
        "name": "Democratic Consultation (Shūrā)",
        "maqasid": "shura",
        "order": 8,
    },
    {
        "id": "D9",
        "name": "Institutional Trust (Amānah)",
        "maqasid": "amanah",
        "order": 9,
    },
    {
        "id": "D10",
        "name": "Environmental / Intergenerational Harm",
        "maqasid": "la_darar",
        "order": 10,
    },
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

# ʿUrf (عرف) — local customs, tunable per country.
# Must map under Maqasid and must not contradict them.
# Halacha is one urf tradition, not a co-equal global scoring system.
URF_TRADITIONS = [
    {
        "code": "halakha",
        "name": "Halakhic local custom",
        "description": (
            "Jewish legal-ethical customs treated as ʿurf (local custom). "
            "Valid only where they serve Maqasid objectives and do not contradict them."
        ),
    },
    {
        "code": "liberal_constitutional",
        "name": "Liberal constitutional custom",
        "description": (
            "Local constitutional practice as ʿurf. Tunable per country under Maqasid."
        ),
    },
    {
        "code": "human_rights_instruments",
        "name": "Human-rights instruments (local uptake)",
        "description": (
            "Treaty and rights practice as local custom where consistent with Maqasid."
        ),
    },
    {
        "code": "development_practice",
        "name": "Development-economics practice",
        "description": (
            "Local development policy norms as ʿurf under Maqasid economic and social aims."
        ),
    },
]

# Halacha principles as urf mappings → Maqasid domains (not independent scores).
URF_HALAKHA_MAPPINGS = [
    {
        "code": "pikuach_nefesh",
        "name": "Preservation of life",
        "urf_tradition": "halakha",
        "maqasid": "hifz_al_nafs",
        "domain_id": "D2",
    },
    {
        "code": "tzedek",
        "name": "Justice",
        "urf_tradition": "halakha",
        "maqasid": "adl",
        "domain_id": "D6",
    },
    {
        "code": "tzedakah",
        "name": "Welfare / redistribution",
        "urf_tradition": "halakha",
        "maqasid": "hifz_al_mal",
        "domain_id": "D5",
    },
    {
        "code": "kavod_habriyot",
        "name": "Human dignity",
        "urf_tradition": "halakha",
        "maqasid": "karamah",
        "domain_id": "D7",
    },
    {
        "code": "dina_demalkhuta_dina",
        "name": "Legitimate civil authority",
        "urf_tradition": "halakha",
        "maqasid": "shura",
        "domain_id": "D8",
    },
    {
        "code": "bal_tashchit",
        "name": "Preventing needless destruction",
        "urf_tradition": "halakha",
        "maqasid": "la_darar",
        "domain_id": "D10",
    },
]

# Backward-compatible alias used by older seed/docs during migration.
HALAKHA_PRINCIPLES = [
    {
        "code": m["code"],
        "name": m["name"],
        "domain_id": m["domain_id"],
    }
    for m in URF_HALAKHA_MAPPINGS
]

# Global scoring tradition is Maqasid alone.
INTELLECTUAL_TRADITIONS = [
    "Maqasid al-Sharia (global objective function)",
    "ʿUrf — local customs (including Halacha), country-tunable under Maqasid",
]

RED_LINE_VIOLATIONS = [
    {"code": "genocide", "name": "Genocide", "cap_score": 10.0, "severity": "critical", "maqasid": "hifz_al_nafs"},
    {"code": "slavery", "name": "Slavery", "cap_score": 5.0, "severity": "critical", "maqasid": "karamah"},
    {"code": "systematic_torture", "name": "Systematic torture", "cap_score": 15.0, "severity": "critical", "maqasid": "hifz_al_nafs"},
    {"code": "religious_persecution", "name": "Religious persecution", "cap_score": 20.0, "severity": "severe", "maqasid": "hifz_al_din"},
    {"code": "mass_arbitrary_detention", "name": "Mass arbitrary detention", "cap_score": 20.0, "severity": "severe", "maqasid": "adl"},
    {"code": "abolition_elections", "name": "Abolition of meaningful elections", "cap_score": 15.0, "severity": "critical", "maqasid": "shura"},
    {"code": "systematic_ethnic_discrimination", "name": "Systematic ethnic discrimination", "cap_score": 25.0, "severity": "severe", "maqasid": "adl"},
    {"code": "no_judicial_independence", "name": "Absence of judicial independence", "cap_score": 25.0, "severity": "severe", "maqasid": "adl"},
    {"code": "state_disappearance", "name": "State-sponsored disappearance", "cap_score": 15.0, "severity": "critical", "maqasid": "hifz_al_nafs"},
]

POLICY_SCORE_COMPONENTS = [
    "need",
    "evidence_quality",
    "expected_impact",
    "cost_effectiveness",
    "maqasid_compatibility",
    "distributional_fairness",
    "observed_impact",
    "uncertainty",
    "implementation_quality",
    "long_term_sustainability",
]

PILOT_COUNTRIES = ["GBR", "USA", "DNK", "IND", "SGP"]
