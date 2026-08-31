import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const policies = await api.policies();
  return policies.map((p) => ({ id: p.policy_id }));
}

const COMPONENT_LABELS: Record<string, string> = {
  need: "Need",
  evidence_quality: "Evidence Quality",
  expected_impact: "Expected Impact",
  cost_effectiveness: "Cost Effectiveness",
  maqasid_compatibility: "Maqasid Compatibility",
  distributional_fairness: "Distributional Fairness",
  observed_impact: "Observed Impact",
  uncertainty: "Uncertainty",
  implementation_quality: "Implementation Quality",
  long_term_sustainability: "Long-Term Sustainability",
};

export default async function PolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let policy;
  try {
    policy = await api.policy(id);
  } catch {
    notFound();
  }

  const allocation = (policy.budget?.maqasid_allocation || {}) as Record<string, number>;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/countries/${policy.country_iso3}/`} className="text-sm text-gray-400">
          ← {policy.country_name}
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold">{policy.title}</h2>
        <p className="text-gray-400 font-mono text-sm">{policy.policy_id}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="badge badge-unverified">{policy.review_status}</span>
          {policy.ai_generated && (
            <span className="badge badge-missing">AI-generated — pending verification</span>
          )}
          <span className="badge bg-blue-950 text-blue-200">Maqasid expenditure</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-3">Stated objectives (Maqasid)</h3>
          <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
            {policy.stated_objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Budget</h3>
          {policy.budget ? (
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-gray-400">Amount</dt>
                <dd className="font-mono">
                  {policy.budget.amount
                    ? `${((policy.budget.amount as number) / 1e9).toFixed(1)}bn ${policy.budget.currency}`
                    : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Rule</dt>
                <dd className="text-xs text-gray-400">
                  Every unit of spend must map to Maqasid
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-400 text-sm">No budget data</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-3">Maqasid domains</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {policy.maqasid_domains.map((m) => (
              <span key={m} className="badge bg-blue-900 text-blue-200">
                {m}
              </span>
            ))}
          </div>
          {Object.keys(allocation).length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Expenditure allocation</h4>
              <ul className="text-sm space-y-1">
                {Object.entries(allocation).map(([k, v]) => (
                  <li key={k} className="flex justify-between font-mono">
                    <span>{k}</span>
                    <span>{(v * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">ʿUrf (local customs)</h3>
          <p className="text-xs text-gray-500 mb-3">
            Tunable locally; must not contradict Maqasid. Halacha appears here as urf.
          </p>
          {(policy.urf || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No urf annotations</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {policy.urf!.map((u, i) => (
                <li key={i} className="flex gap-2 items-center">
                  <span className="badge bg-gray-800 text-gray-300">{u.tradition}</span>
                  <span className="font-mono text-gray-300">{u.principle}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-semibold mb-3">Targets vs outcomes</h3>
        <div className="space-y-3 text-sm">
          {policy.targets &&
            Object.entries(policy.targets).map(([key, val]) => {
              const target = val as Record<string, unknown>;
              const outcome = policy.observed_outcomes?.[key];
              return (
                <div key={key} className="border-b border-gray-800 pb-2">
                  <div className="font-mono text-gray-400">{key}</div>
                  {target.maqasid != null && (
                    <div className="text-xs text-blue-300">Maqasid: {String(target.maqasid)}</div>
                  )}
                  <div>Target: {target.value !== undefined ? JSON.stringify(target.value) : "—"}</div>
                  <div>
                    Observed:{" "}
                    {outcome !== undefined ? (
                      JSON.stringify(outcome)
                    ) : (
                      <span className="badge badge-missing">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-semibold mb-4">Policy score components</h3>
        {policy.score_components ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(policy.score_components).map(([key, val]) => (
              <div key={key} className="flex justify-between bg-gray-900/50 px-3 py-2 rounded">
                <span className="text-sm">{COMPONENT_LABELS[key] || key}</span>
                <span className="font-mono text-sm">{val !== null ? val.toFixed(1) : "—"}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No score components</p>
        )}
      </div>
    </div>
  );
}
