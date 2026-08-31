import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const scores = await api.countryScores();
  // Only generate pages for scored countries (others have no detail yet)
  return Object.values(scores)
    .filter((c) => c.status === "scored" || c.overall_score != null)
    .map((c) => ({ iso3: c.country_iso3 }));
}

export default async function CountryPage({ params }: { params: Promise<{ iso3: string }> }) {
  const { iso3 } = await params;
  const code = iso3.toUpperCase();

  let score;
  let policies;
  try {
    [score, policies] = await Promise.all([api.countryScore(code), api.policies(code)]);
  } catch {
    notFound();
  }

  return (
    <main className="shell pt-10">
      <Link href="/rankings/" className="text-sm text-[var(--muted)]">
        ← Rankings
      </Link>

      <div className="flex flex-col md:flex-row md:justify-between gap-6 mt-4 mb-8">
        <div>
          <div className="module-label">Country state</div>
          <h1 className="text-3xl md:text-4xl">{score.country_name}</h1>
          <p className="mono text-sm text-[var(--muted)]">{code}</p>
        </div>
        <div className="panel min-w-[200px]">
          <div className="module-label">OSD score</div>
          <div className="text-4xl font-semibold mono">
            {score.overall_score?.toFixed(1) ?? "—"}
          </div>
          <div className="text-sm text-[var(--muted)]">
            Rank {score.global_rank != null ? `#${score.global_rank}` : "unavailable"}
          </div>
        </div>
      </div>

      <section className="panel mb-6">
        <div className="module-label">Maqasid domains</div>
        <div className="space-y-3 mt-3">
          {score.domain_scores.map((d) => (
            <div key={d.domain_id}>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  <span className="mono text-[var(--muted)] mr-2">{d.domain_id}</span>
                  {d.domain_name}
                  {d.maqasid && (
                    <span className="mono text-xs text-[var(--muted)] ml-2">{d.maqasid}</span>
                  )}
                </span>
                <span className="mono">{d.score?.toFixed(0) ?? "—"}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${d.score ?? 0}%` }} />
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">
                {d.available_indicator_count}/{d.indicator_count} indicators available
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mb-6">
        <div className="module-label">Policies</div>
        {policies.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No policies recorded.</p>
        ) : (
          <ul className="space-y-3 mt-2">
            {policies.map((p) => (
              <li key={p.policy_id}>
                <Link href={`/policies/${p.policy_id}/`} className="font-medium">
                  {p.title}
                </Link>
                <div className="mt-1">
                  <span className="badge badge-unverified">{p.review_status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <div className="module-label">Provenance</div>
        <pre className="text-xs mono overflow-x-auto mt-2 bg-[var(--bg-2)] p-3 border border-[var(--line)]">
          {JSON.stringify(score.provenance, null, 2)}
        </pre>
      </section>
    </main>
  );
}
