/** Static data client for GitHub Pages — no local API required. */

export interface RankingEntry {
  rank: number;
  country_iso3: string;
  country_name: string;
  overall_score: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  trend: string | null;
  red_flags: number;
}

export interface RankingsResponse {
  rankings: RankingEntry[];
  model_version: string;
  weight_profile: string;
  computed_at: string | null;
  total_countries: number;
  framework?: string;
}

export interface DomainScore {
  domain_id: string;
  domain_name: string | null;
  maqasid?: string;
  score: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  indicator_count: number;
  available_indicator_count: number;
  is_complete: boolean;
  provenance: Record<string, unknown> | null;
}

export interface CountryScore {
  country_iso3: string;
  country_name: string | null;
  overall_score: number | null;
  raw_geometric_score: number | null;
  red_line_cap_applied: number | null;
  ci_lower: number | null;
  ci_upper: number | null;
  global_rank: number | null;
  ranking_robustness: number | null;
  domain_scores: DomainScore[];
  red_line_events: Record<string, unknown>[];
  provenance: Record<string, unknown> | null;
  model_version: string;
  framework?: string;
  urf_note?: string;
}

export interface Policy {
  policy_id: string;
  country_iso3: string;
  country_name: string | null;
  title: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  stated_objectives: string[];
  public_value_domains: string[];
  maqasid_domains: string[];
  urf?: { tradition: string; principle: string; layer: string }[];
  budget: Record<string, unknown> | null;
  baseline: Record<string, unknown> | null;
  targets: Record<string, unknown> | null;
  observed_outcomes: Record<string, unknown> | null;
  review_status: string;
  ai_generated: boolean;
  score_components: Record<string, number | null> | null;
  effectiveness_score: number | null;
  sources: { source_id: string; name: string; url: string | null }[] | string[];
  provenance: Record<string, unknown> | null;
  framework?: string;
}

function dataUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}/data/${path}`;
}

async function loadJson<T>(file: string): Promise<T> {
  // Prefer relative fetch for static export; fallback for SSR build.
  if (typeof window === "undefined") {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const p = join(process.cwd(), "public", "data", file);
    return JSON.parse(await readFile(p, "utf-8")) as T;
  }
  const res = await fetch(dataUrl(file));
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.json() as Promise<T>;
}

export const api = {
  rankings: () => loadJson<RankingsResponse>("rankings.json"),
  countryScore: async (iso3: string) => {
    const all = await loadJson<Record<string, CountryScore>>("country_scores.json");
    const score = all[iso3.toUpperCase()];
    if (!score) throw new Error("Country not found");
    return score;
  },
  policies: async (country?: string) => {
    const all = await loadJson<Policy[]>("policies.json");
    if (!country) return all;
    return all.filter((p) => p.country_iso3 === country.toUpperCase() || p.country_iso3 === country);
  },
  policy: async (id: string) => {
    const all = await loadJson<Policy[]>("policies.json");
    const p = all.find((x) => x.policy_id === id);
    if (!p) throw new Error("Policy not found");
    return p;
  },
  meta: () => loadJson<Record<string, unknown>>("meta.json"),
};
