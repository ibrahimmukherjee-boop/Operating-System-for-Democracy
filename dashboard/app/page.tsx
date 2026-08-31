import Link from "next/link";
import { ScoreBars } from "@/components/ScoreBars";
import { DomainMatrix } from "@/components/DomainMatrix";
import { PolicyWalkthrough } from "@/components/PolicyWalkthrough";
import { api } from "@/lib/api";

export const dynamic = "force-static";

function fmtUsd(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}bn`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}m`;
  return `$${n.toLocaleString()}`;
}

export default async function HomePage() {
  const [rankings, meta, policies, scores] = await Promise.all([
    api.rankings(),
    api.meta(),
    api.policies(),
    api.countryScores(),
  ]);

  const scored = rankings.rankings.filter((r) => r.overall_score != null);
  const walkthrough =
    policies.find((p) => (p as { walkthrough?: boolean }).walkthrough) || policies[0];

  const matrixCountries = Object.values(scores)
    .filter((c) => c.status === "scored" || c.domain_scores.some((d) => d.score != null))
    .map((c) => ({
      name: c.country_name || c.country_iso3,
      iso3: c.country_iso3,
      domains: c.domain_scores.map((d) => ({ id: d.domain_id, score: d.score })),
    }));

  const rankedPolicies = [...policies].sort(
    (a, b) => (b.effectiveness_score ?? -1) - (a.effectiveness_score ?? -1)
  );

  return (
    <main className="shell pt-10">
      <section className="mb-8 max-w-3xl">
        <div className="module-label">Public operating system</div>
        <h1 className="text-4xl md:text-5xl mb-3">Operating System for a Democracy</h1>
        <p className="text-[var(--muted)] text-lg">
          Live ledger of government funds, ranked policies, and all 195 sovereign states — scored
          only where evidence exists.
        </p>
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Government funds</div>
          <div className="text-3xl font-semibold mono">
            {fmtUsd(Number(meta.total_government_funds_usd || 0))}
          </div>
          <div className="text-sm text-[var(--muted)]">tracked USD-equivalent</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Policies ranked</div>
          <div className="text-3xl font-semibold mono">{String(meta.total_policies ?? policies.length)}</div>
          <div className="text-sm text-[var(--muted)]">programmes in ledger</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Countries</div>
          <div className="text-3xl font-semibold mono">{String(meta.total_countries ?? 195)}</div>
          <div className="text-sm text-[var(--muted)]">
            {String(rankings.scored_countries)} scored · {String(rankings.unavailable_countries)}{" "}
            unavailable
          </div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Open live view</div>
          <Link href="/dashboard/" className="btn mt-2">
            Live dashboard
          </Link>
        </div>
      </section>

      <section className="mb-8">
        {walkthrough && <PolicyWalkthrough policy={walkthrough} />}
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 7" }}>
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <div>
              <div className="module-label">Policies ranked</div>
              <h2 className="text-xl">Programme leaderboard</h2>
            </div>
            <Link href="/dashboard/" className="btn-ghost text-sm">
              Funds + full table →
            </Link>
          </div>
          <table className="rank-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Policy</th>
                <th>Country</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rankedPolicies.map((p, i) => (
                <tr key={p.policy_id}>
                  <td className="mono">#{i + 1}</td>
                  <td>
                    <Link href={`/policies/${p.policy_id}/`}>{p.title}</Link>
                  </td>
                  <td>{p.country_name}</td>
                  <td className="mono">
                    {p.effectiveness_score != null ? p.effectiveness_score.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel" style={{ gridColumn: "span 5" }}>
          <div className="module-label">Domain matrix</div>
          <h2 className="text-xl mb-4">Maqasid by country</h2>
          <DomainMatrix countries={matrixCountries} />
        </div>
      </section>

      <section className="panel mb-8">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <div>
            <div className="module-label">195 countries</div>
            <h2 className="text-xl">Country rankings</h2>
          </div>
          <Link href="/rankings/" className="btn-ghost text-sm">
            Full registry →
          </Link>
        </div>
        <ScoreBars
          rows={scored.map((r) => ({
            label: r.country_name,
            score: r.overall_score,
            rank: r.rank,
          }))}
        />
        <p className="text-xs text-[var(--muted)] mt-3">
          Chart shows scored pilots. Open the full registry for all 195 states with unavailable
          markers.
        </p>
      </section>
    </main>
  );
}
