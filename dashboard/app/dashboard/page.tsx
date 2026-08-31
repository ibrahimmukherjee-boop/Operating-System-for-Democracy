import Link from "next/link";
import { ExpenditureFlow } from "@/components/ExpenditureFlow";
import { ScoreBars } from "@/components/ScoreBars";
import { api } from "@/lib/api";

export const dynamic = "force-static";

function fmtUsd(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}bn`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}m`;
  return `$${n.toLocaleString()}`;
}

export default async function LiveDashboardPage() {
  const [dashboard, rankings] = await Promise.all([api.dashboard(), api.rankings()]);

  const scored = rankings.rankings.filter((r) => r.overall_score != null);
  const dash = dashboard as {
    total_government_funds_usd: number;
    total_policies: number;
    currencies_note: string;
    funds_by_maqasid: { maqasid: string; total_usd: number; share: number }[];
    funds_by_country: { country_iso3: string; country_name: string; total_usd: number }[];
    policy_rankings: {
      policy_rank: number;
      policy_id: string;
      title: string;
      country_name: string;
      effectiveness_score: number | null;
      budget_usd: number | null;
      review_status: string;
    }[];
  };
  const maqasidAlloc = dash.funds_by_maqasid.map((m) => ({
    maqasid: m.maqasid,
    share: m.share,
  }));

  return (
    <main className="shell pt-10">
      <div className="mb-8 max-w-3xl">
        <div className="module-label">Live dashboard</div>
        <h1 className="text-3xl md:text-4xl mb-2">Government funds & rankings</h1>
        <p className="text-[var(--muted)]">
          Illustrative pilot ledger: tracked policies, USD-normalised budgets, Maqasid allocation,
          and the full 195-country registry.
        </p>
      </div>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Government funds</div>
          <div className="text-3xl font-semibold mono">
            {fmtUsd(dash.total_government_funds_usd)}
          </div>
          <div className="text-sm text-[var(--muted)]">tracked programme budget (USD eq.)</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Policies ranked</div>
          <div className="text-3xl font-semibold mono">{dash.total_policies}</div>
          <div className="text-sm text-[var(--muted)]">active programmes in ledger</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Countries ranked</div>
          <div className="text-3xl font-semibold mono">{rankings.total_countries}</div>
          <div className="text-sm text-[var(--muted)]">
            {rankings.scored_countries} scored · {rankings.unavailable_countries} unavailable
          </div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Integrity</div>
          <div className="text-lg font-semibold">No fabricated outcomes</div>
          <div className="text-sm text-[var(--muted)]">missing data stays missing</div>
        </div>
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 7" }}>
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <div className="module-label">Funds by Maqasid</div>
              <h2 className="text-xl">Where tracked money is aimed</h2>
            </div>
          </div>
          <ExpenditureFlow
            amountLabel={`${fmtUsd(dash.total_government_funds_usd)} across Maqasid`}
            allocation={maqasidAlloc}
          />
          <table className="rank-table mt-4">
            <thead>
              <tr>
                <th>Maqasid</th>
                <th>USD</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {dash.funds_by_maqasid.map(
                (m: { maqasid: string; total_usd: number; share: number }) => (
                  <tr key={m.maqasid}>
                    <td className="mono text-xs">{m.maqasid}</td>
                    <td className="mono">{fmtUsd(m.total_usd)}</td>
                    <td className="mono">{(m.share * 100).toFixed(1)}%</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <p className="text-xs text-[var(--muted)] mt-2">{dash.currencies_note}</p>
        </div>

        <div className="panel" style={{ gridColumn: "span 5" }}>
          <div className="module-label">Funds by country</div>
          <h2 className="text-xl mb-3">Pilot ledger</h2>
          <table className="rank-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>USD eq.</th>
              </tr>
            </thead>
            <tbody>
              {dash.funds_by_country.map(
                (c: { country_iso3: string; country_name: string; total_usd: number }) => (
                  <tr key={c.country_iso3}>
                    <td>
                      {c.country_name}{" "}
                      <span className="mono text-xs text-[var(--muted)]">{c.country_iso3}</span>
                    </td>
                    <td className="mono">{fmtUsd(c.total_usd)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel mb-8">
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <div className="module-label">Policies ranked</div>
            <h2 className="text-xl">Programme effectiveness (declaration score)</h2>
          </div>
          <Link href="/os/" className="btn-ghost text-sm">
            Policy OS →
          </Link>
        </div>
        <table className="rank-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Policy</th>
              <th>Country</th>
              <th>Score</th>
              <th>Budget (USD)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dash.policy_rankings.map(
              (p: {
                policy_rank: number;
                policy_id: string;
                title: string;
                country_name: string;
                effectiveness_score: number | null;
                budget_usd: number | null;
                review_status: string;
              }) => (
                <tr key={p.policy_id}>
                  <td className="mono">#{p.policy_rank}</td>
                  <td>
                    <Link href={`/policies/${p.policy_id}/`} className="font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td>{p.country_name}</td>
                  <td className="mono">
                    {p.effectiveness_score != null ? p.effectiveness_score.toFixed(1) : "—"}
                  </td>
                  <td className="mono">{p.budget_usd != null ? fmtUsd(p.budget_usd) : "—"}</td>
                  <td>
                    <span className="badge badge-unverified">{p.review_status}</span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <p className="text-xs text-[var(--muted)] mt-2">
          Rank uses declaration completeness until verified observed outcomes exist. Observed impact
          remains unavailable for these pilots.
        </p>
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <div className="module-label">Countries scored</div>
              <h2 className="text-xl">OSD leaderboard</h2>
            </div>
            <Link href="/rankings/" className="btn-ghost text-sm">
              All 195 →
            </Link>
          </div>
          <ScoreBars
            rows={scored.map((r) => ({
              label: r.country_name,
              score: r.overall_score,
              rank: r.rank,
            }))}
          />
        </div>
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="module-label">Full registry</div>
          <h2 className="text-xl mb-3">195 sovereign states</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Every UN member plus Palestine and the Holy See appears in rankings. Unscored states are
            listed as unavailable — never filled with invented numbers.
          </p>
          <div className="os-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            <div className="panel bg-[var(--bg)]" style={{ gridColumn: "span 1", padding: "0.75rem" }}>
              <div className="mono text-2xl">{rankings.total_countries}</div>
              <div className="text-xs text-[var(--muted)]">listed</div>
            </div>
            <div className="panel bg-[var(--bg)]" style={{ gridColumn: "span 1", padding: "0.75rem" }}>
              <div className="mono text-2xl">{rankings.scored_countries}</div>
              <div className="text-xs text-[var(--muted)]">scored</div>
            </div>
            <div className="panel bg-[var(--bg)]" style={{ gridColumn: "span 1", padding: "0.75rem" }}>
              <div className="mono text-2xl">{rankings.unavailable_countries}</div>
              <div className="text-xs text-[var(--muted)]">unavailable</div>
            </div>
          </div>
          <Link href="/rankings/" className="btn mt-4">
            Browse all countries
          </Link>
        </div>
      </section>
    </main>
  );
}
