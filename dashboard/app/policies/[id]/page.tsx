import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpenditureFlow } from "@/components/ExpenditureFlow";
import { api } from "@/lib/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const policies = await api.policies();
  return policies.map((p) => ({ id: p.policy_id }));
}

const LABELS: Record<string, string> = {
  need: "Need",
  evidence_quality: "Evidence quality",
  expected_impact: "Expected impact",
  cost_effectiveness: "Cost effectiveness",
  maqasid_compatibility: "Maqasid compatibility",
  distributional_fairness: "Distributional fairness",
  observed_impact: "Observed impact",
  uncertainty: "Uncertainty",
  implementation_quality: "Implementation quality",
  long_term_sustainability: "Long-term sustainability",
};

export default async function PolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let policy;
  try {
    policy = await api.policy(id);
  } catch {
    notFound();
  }

  const allocation = Object.entries(
    (policy.budget?.maqasid_allocation as Record<string, number>) || {}
  ).map(([maqasid, share]) => ({ maqasid, share }));

  return (
    <main className="shell pt-10">
      <Link href={`/countries/${policy.country_iso3}/`} className="text-sm text-[var(--muted)]">
        ← {policy.country_name}
      </Link>

      <div className="mt-4 mb-6">
        <div className="module-label">Policy record</div>
        <h1 className="text-3xl mb-2">{policy.title}</h1>
        <p className="mono text-sm text-[var(--muted)]">{policy.policy_id}</p>
        <div className="flex gap-2 mt-3">
          <span className="badge badge-unverified">{policy.review_status}</span>
          {policy.ai_generated && <span className="badge badge-missing">AI candidate</span>}
        </div>
      </div>

      <div className="os-grid mb-6">
        <div className="panel" style={{ gridColumn: "span 7" }}>
          <div className="module-label">Objectives</div>
          <ul className="text-sm space-y-2 list-disc list-inside text-[var(--muted)]">
            {policy.stated_objectives.map((o, i) => (
              <li key={i}>
                <span className="text-[var(--fg)]">{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel" style={{ gridColumn: "span 5" }}>
          <div className="module-label">Budget</div>
          <div className="text-3xl font-semibold mono mb-2">
            {policy.budget?.amount
              ? `£${((policy.budget.amount as number) / 1e9).toFixed(1)}bn`
              : "—"}
          </div>
          {allocation.length > 0 && (
            <ExpenditureFlow amountLabel="Maqasid allocation" allocation={allocation} />
          )}
        </div>
      </div>

      <div className="os-grid mb-6">
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="module-label">Maqasid</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {policy.maqasid_domains.map((m) => (
              <span key={m} className="badge">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="module-label">ʿUrf (local custom)</div>
          <p className="text-xs text-[var(--muted)] mb-2">Under Maqasid only — not a peer score.</p>
          <ul className="text-sm space-y-1">
            {(policy.urf || []).map((u, i) => (
              <li key={i}>
                <span className="badge mr-2">{u.tradition}</span>
                <span className="mono">{u.principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel mb-6">
        <div className="module-label">Targets vs outcomes</div>
        <table className="rank-table mt-2">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>Maqasid</th>
              <th>Target</th>
              <th>Observed</th>
            </tr>
          </thead>
          <tbody>
            {policy.targets &&
              Object.entries(policy.targets).map(([key, val]) => {
                const t = val as { value?: number; maqasid?: string };
                const obs = policy.observed_outcomes?.[key];
                return (
                  <tr key={key}>
                    <td className="mono text-xs">{key}</td>
                    <td className="mono text-xs">{t.maqasid || "—"}</td>
                    <td>{t.value ?? "—"}</td>
                    <td>
                      {obs !== undefined ? (
                        JSON.stringify(obs)
                      ) : (
                        <span className="badge badge-missing">Unavailable</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="module-label">Score components</div>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          {policy.score_components &&
            Object.entries(policy.score_components).map(([k, v]) => (
              <div key={k} className="flex justify-between border border-[var(--line)] px-3 py-2 text-sm">
                <span>{LABELS[k] || k}</span>
                <span className="mono">{v != null ? v.toFixed(1) : "—"}</span>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
