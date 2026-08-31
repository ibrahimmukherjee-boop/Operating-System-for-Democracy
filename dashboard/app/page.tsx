import Link from "next/link";
import { ScoreBars } from "@/components/ScoreBars";
import { DomainMatrix } from "@/components/DomainMatrix";
import { ExpenditureFlow } from "@/components/ExpenditureFlow";
import { api } from "@/lib/api";

export const dynamic = "force-static";

export default async function HomePage() {
  const [rankings, meta, policies, scores] = await Promise.all([
    api.rankings(),
    api.meta(),
    api.policies(),
    api.countryScores(),
  ]);

  const scored = rankings.rankings.filter((r) => r.overall_score != null);
  const policy = policies[0];
  const allocation = Object.entries(
    (policy?.budget?.maqasid_allocation as Record<string, number>) || {}
  ).map(([maqasid, share]) => ({ maqasid, share }));

  const matrixCountries = Object.values(scores)
    .filter((c) => c.status === "scored" || c.domain_scores.some((d) => d.score != null))
    .map((c) => ({
      name: c.country_name || c.country_iso3,
      iso3: c.country_iso3,
      domains: c.domain_scores.map((d) => ({ id: d.domain_id, score: d.score })),
    }));

  return (
    <main className="shell pt-10">
      <section className="mb-10 max-w-3xl">
        <div className="module-label">Public operating system</div>
        <h1 className="text-4xl md:text-5xl mb-3">Operating System for a Democracy</h1>
        <p className="text-[var(--muted)] text-lg">
          Rank countries on Maqasid objectives. Map every public expenditure to those objectives.
          Compare targets with observed outcomes. No score without provenance — and no fabricated
          data.
        </p>
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Registry</div>
          <div className="text-3xl font-semibold mono">{String(meta.total_countries ?? 195)}</div>
          <div className="text-sm text-[var(--muted)]">sovereign states</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Scored now</div>
          <div className="text-3xl font-semibold mono">
            {String(rankings.scored_countries ?? scored.length)}
          </div>
          <div className="text-sm text-[var(--muted)]">pilot ingest complete</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Awaiting data</div>
          <div className="text-3xl font-semibold mono">
            {String(rankings.unavailable_countries ?? 195 - scored.length)}
          </div>
          <div className="text-sm text-[var(--muted)]">explicitly unavailable</div>
        </div>
        <div className="panel" style={{ gridColumn: "span 3" }}>
          <div className="module-label">Framework</div>
          <div className="text-3xl font-semibold">Maqasid</div>
          <div className="text-sm text-[var(--muted)]">ʿurf = local custom only</div>
        </div>
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 7" }}>
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <div>
              <div className="module-label">Module · scored countries</div>
              <h2 className="text-xl">OSD scores</h2>
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
          <p className="text-xs text-[var(--muted)] mt-3">
            Weighted geometric mean of Maqasid domains. Chart rendered from ranking data.
          </p>
        </div>

        <div className="panel" style={{ gridColumn: "span 5" }}>
          <div className="module-label">Module · domain matrix</div>
          <h2 className="text-xl mb-4">Ten Maqasid domains</h2>
          <DomainMatrix countries={matrixCountries} />
          <p className="text-xs text-[var(--muted)] mt-3">
            Darker blue = higher score. Grey = unavailable.
          </p>
        </div>
      </section>

      <section className="panel mb-8">
        <div className="module-label">Module · expenditure audit</div>
        <h2 className="text-xl mb-2">Where did the money go?</h2>
        <p className="text-sm text-[var(--muted)] mb-4 max-w-2xl">
          Every pound must declare a Maqasid objective before it can claim success.
        </p>
        {policy && allocation.length > 0 && (
          <ExpenditureFlow
            amountLabel={`£${((policy.budget?.amount as number) / 1e9).toFixed(1)}bn · ${policy.title}`}
            allocation={allocation}
          />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/policies/${policy?.policy_id}/`} className="btn">
            Open policy record
          </Link>
          <Link href="/os/" className="btn-ghost">
            Policy OS pipeline
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="module-label">System layers</div>
        <ol className="text-sm text-[var(--muted)] space-y-2 list-decimal list-inside">
          <li>
            <strong className="text-[var(--fg)]">Country state</strong> — Maqasid domain scores with
            confidence and provenance.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Policy engine</strong> — programmes mapped to
            Maqasid; ʿurf may tune locally only if non-contradictory.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Outcome evaluation</strong> — targets vs observed
            results; continue, modify, or stop.
          </li>
        </ol>
      </section>
    </main>
  );
}
