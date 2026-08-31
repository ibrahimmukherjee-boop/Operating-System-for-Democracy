import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-static";

export default async function RankingsPage() {
  let data;
  let error = null;
  try {
    data = await api.rankings();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load rankings";
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--ember-soft)] mb-3">
        Maqasid geometric mean
      </p>
      <h1 className="display text-4xl md:text-5xl font-bold mb-3">Global rankings</h1>
      <p className="text-[var(--muted)] max-w-2xl mb-10">
        Pilot countries scored on ten Maqasid domains. Missing data is shown explicitly — never
        fabricated. Adjust normative weights in the{" "}
        <Link href="/weighting/">Weighting Lab</Link>.
      </p>

      {error && (
        <div className="card border-[var(--ember)] mb-8 text-[var(--ember-soft)]">{error}</div>
      )}

      {data && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--line)] text-sm text-[var(--muted)]">
                <th className="py-3 pr-4">Rank</th>
                <th className="py-3 pr-4">Country</th>
                <th className="py-3 pr-4">OSD Score</th>
                <th className="py-3 pr-4">95% CI</th>
                <th className="py-3">Explore</th>
              </tr>
            </thead>
            <tbody>
              {data.rankings.map((r) => (
                <tr key={r.country_iso3} className="border-b border-[var(--line)]/60 hover:bg-white/[0.02]">
                  <td className="py-4 pr-4 font-mono">#{r.rank}</td>
                  <td className="py-4 pr-4">
                    <Link href={`/countries/${r.country_iso3}/`} className="font-semibold text-white">
                      {r.country_name}
                    </Link>
                    <span className="text-[var(--muted)] text-sm ml-2">{r.country_iso3}</span>
                  </td>
                  <td className="py-4 pr-4 text-2xl font-bold">
                    {r.overall_score?.toFixed(1) ?? "—"}
                  </td>
                  <td className="py-4 pr-4 text-sm font-mono text-[var(--muted)]">
                    {r.ci_lower != null && r.ci_upper != null
                      ? `[${r.ci_lower.toFixed(1)}, ${r.ci_upper.toFixed(1)}]`
                      : "—"}
                  </td>
                  <td className="py-4">
                    <Link href={`/countries/${r.country_iso3}/`} className="text-sm">
                      Country →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-[var(--muted)] mt-4">
            Model {data.model_version} · framework: Maqasid · computed{" "}
            {data.computed_at ? new Date(data.computed_at).toLocaleDateString() : "—"}
          </p>
        </div>
      )}
    </main>
  );
}
