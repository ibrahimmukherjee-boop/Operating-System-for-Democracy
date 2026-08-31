import Link from "next/link";
import { notFound } from "next/navigation";
import { DomainRadarChart } from "@/components/DomainRadarChart";
import { api } from "@/lib/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const rankings = await api.rankings();
  return rankings.rankings.map((r) => ({ iso3: r.country_iso3 }));
}

const DOMAIN_NAMES: Record<string, string> = {
  D1: "Freedom of Religion & Conscience",
  D2: "Life & Physical Security",
  D3: "Intellect, Education & Information",
  D4: "Family & Child Welfare",
  D5: "Property & Economic Security",
  D6: "Justice & Rule of Law",
  D7: "Human Dignity",
  D8: "Democratic Consultation (Shūrā)",
  D9: "Institutional Trust (Amānah)",
  D10: "Environmental / Intergenerational Harm",
};

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
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400">
          ← Global rankings
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold">{score.country_name}</h2>
          <p className="text-gray-400">{code} · scored on Maqasid</p>
          {score.urf_note && <p className="text-xs text-gray-500 mt-2 max-w-xl">{score.urf_note}</p>}
        </div>
        <div className="card text-center min-w-[200px]">
          <div className="text-sm text-gray-400">Global rank</div>
          <div className="text-4xl font-bold">#{score.global_rank ?? "—"}</div>
          <div className="text-sm text-gray-400 mt-2">OSD Score</div>
          <div className="text-3xl font-bold text-blue-400">
            {score.overall_score?.toFixed(1) ?? "N/A"}
          </div>
          {score.ranking_robustness !== null && (
            <div className="text-xs text-gray-400 mt-2">
              Ranking robustness: {score.ranking_robustness}%
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Maqasid domain scores</h3>
          <DomainRadarChart domainScores={score.domain_scores} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Domain breakdown</h3>
          <div className="space-y-3">
            {score.domain_scores.map((d) => (
              <div key={d.domain_id} className="flex items-center gap-3">
                <span className="font-mono text-sm w-8">{d.domain_id}</span>
                <div className="flex-1">
                  <div className="text-sm">{DOMAIN_NAMES[d.domain_id] || d.domain_name}</div>
                  {d.maqasid && (
                    <div className="text-xs text-blue-300/80 font-mono">{d.maqasid}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${d.score ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono w-12 text-right">
                      {d.score?.toFixed(0) ?? "—"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {d.available_indicator_count}/{d.indicator_count} indicators
                    {!d.is_complete && " · incomplete"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Policies (expenditure → Maqasid)</h3>
        {policies.length === 0 ? (
          <p className="text-gray-400 text-sm">No policies recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {policies.map((p) => (
              <li key={p.policy_id} className="border-b border-gray-800 pb-3 last:border-0">
                <Link href={`/policies/${p.policy_id}/`} className="font-medium">
                  {p.title}
                </Link>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="badge badge-unverified">{p.review_status}</span>
                  {p.ai_generated && <span className="badge badge-missing">AI candidate</span>}
                  {(p.maqasid_domains || []).slice(0, 3).map((m) => (
                    <span key={m} className="badge bg-blue-900 text-blue-200">
                      {m}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Provenance</h3>
        <p className="text-sm text-gray-400 mb-3">Model version: {score.model_version}</p>
        <pre className="text-xs bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-gray-300">
          {JSON.stringify(score.provenance, null, 2)}
        </pre>
      </div>
    </div>
  );
}
