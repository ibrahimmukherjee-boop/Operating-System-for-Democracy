const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8742";

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
}

export interface DomainScore {
  domain_id: string;
  domain_name: string | null;
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
  budget: Record<string, unknown> | null;
  baseline: Record<string, unknown> | null;
  targets: Record<string, unknown> | null;
  observed_outcomes: Record<string, unknown> | null;
  review_status: string;
  ai_generated: boolean;
  score_components: Record<string, number | null> | null;
  effectiveness_score: number | null;
  sources: { source_id: string; name: string; url: string | null }[];
  provenance: Record<string, unknown> | null;
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  rankings: () => fetchApi<RankingsResponse>("/api/v1/rankings"),
  countryScore: (iso3: string) => fetchApi<CountryScore>(`/api/v1/countries/${iso3}/score`),
  policies: (country?: string) =>
    fetchApi<Policy[]>(`/api/v1/policies${country ? `?country=${country}` : ""}`),
  policy: (id: string) => fetchApi<Policy>(`/api/v1/policies/${id}`),
  domains: () => fetchApi<{ id: string; name: string; sort_order: number }[]>("/api/v1/domains"),
};
