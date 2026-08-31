import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

const COMPONENT_LABELS: Record<string, string> = {
  need: "Need",
  evidence_quality: "Evidence Quality",
  expected_impact: "Expected Impact",
  cost_effectiveness: "Cost Effectiveness",
  rights_compatibility: "Rights Compatibility",
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

  return (
    <div>
      <div className="mb-6">
        <Link href={`/countries/${policy.country_iso3}`} className="text-sm text-gray-400">
          ← {policy.country_name}
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold">{policy.title}</h2>
        <p className="text-gray-400 font-mono text-sm">{policy.policy_id}</p>
        <div className="flex gap-2 mt-3">
          <span className="badge badge-unverified">{policy.review_status}</span>
          {policy.ai_generated && (
            <span className="badge badge-missing">AI-generated — pending verification</span>
          )}
          <span className="badge bg-gray-800 text-gray-300">{policy.status}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-3">Stated objectives</h3>
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
                <dt className="text-gray-400">Period</dt>
                <dd>{policy.budget.period_years ? `${policy.budget.period_years} years` : "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-400 text-sm">No budget data</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-3">Public-value domains</h3>
          <div className="flex flex-wrap gap-2">
            {policy.public_value_domains.map((d) => (
              <span key={d} className="badge bg-blue-900 text-blue-200">
                {d}
              </span>
            ))}
          </div>
          <h3 className="font-semibold mt-4 mb-3">Maqāṣid mapping</h3>
          <div className="flex flex-wrap gap-2">
            {policy.maqasid_domains.map((m) => (
              <span key={m} className="badge bg-purple-900 text-purple-200">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Targets vs outcomes</h3>
          <div className="space-y-3 text-sm">
            {policy.targets &&
              Object.entries(policy.targets).map(([key, val]) => {
                const target = val as Record<string, unknown>;
                const outcome = policy.observed_outcomes?.[key];
                return (
                  <div key={key} className="border-b border-gray-800 pb-2">
                    <div className="font-mono text-gray-400">{key}</div>
                    <div>
                      Target:{" "}
                      {target.value !== undefined ? JSON.stringify(target.value) : "—"}
                    </div>
                    <div>
                      Observed:{" "}
                      {outcome !== undefined ? JSON.stringify(outcome) : (
                        <span className="badge badge-missing">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-semibold mb-4">Policy score components</h3>
        <p className="text-sm text-gray-400 mb-4">
          Components are shown separately — never collapsed without inspection. Scores require
          verified review status.
        </p>
        {policy.score_components ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(policy.score_components).map(([key, val]) => (
              <div key={key} className="flex justify-between bg-gray-900/50 px-3 py-2 rounded">
                <span className="text-sm">{COMPONENT_LABELS[key] || key}</span>
                <span className="font-mono text-sm">
                  {val !== null ? val.toFixed(1) : "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No score components computed</p>
        )}
        {policy.effectiveness_score !== null && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <span className="text-gray-400">Policy Effectiveness Score: </span>
            <span className="text-xl font-bold">{policy.effectiveness_score.toFixed(1)}</span>
            <span className="text-gray-400"> / 100</span>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Sources</h3>
        {policy.sources.length === 0 ? (
          <p className="text-gray-400 text-sm">No sources linked</p>
        ) : (
          <ul className="space-y-2">
            {policy.sources.map((s) => (
              <li key={s.source_id}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
