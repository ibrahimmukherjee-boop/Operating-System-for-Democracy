import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data;
  let error = null;

  try {
    data = await api.rankings();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load rankings";
  }

  return (
    <div>
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-2">How well is your country actually working?</h2>
        <p className="text-gray-400 max-w-2xl">
          Global rankings based on ten societal objective domains. Every score traces to source
          data, normalisation method, and model version. Missing data is shown explicitly — never
          fabricated.
        </p>
      </section>

      {error && (
        <div className="card border-red-800 bg-red-950/30 mb-8">
          <p className="text-red-300">Unable to connect to API: {error}</p>
          <p className="text-sm text-gray-400 mt-2">
            Start the API with{" "}
            <code className="bg-gray-800 px-1 rounded">uvicorn api.main:app --port 8742</code>
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.total_countries}</div>
              <div className="text-sm text-gray-400">Pilot countries</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold">10</div>
              <div className="text-sm text-gray-400">Objective domains</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.model_version}</div>
              <div className="text-sm text-gray-400">Model version</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-gray-400">Computed</div>
              <div className="text-sm font-mono">
                {data.computed_at ? new Date(data.computed_at).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-sm text-gray-400">
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 pr-4">Country</th>
                  <th className="py-3 pr-4">OSD Score</th>
                  <th className="py-3 pr-4">95% CI</th>
                  <th className="py-3 pr-4">Red flags</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rankings.map((r) => (
                  <tr key={r.country_iso3} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-4 pr-4 font-mono">#{r.rank}</td>
                    <td className="py-4 pr-4">
                      <Link href={`/countries/${r.country_iso3}`} className="font-medium">
                        {r.country_name}
                      </Link>
                      <span className="text-gray-500 text-sm ml-2">{r.country_iso3}</span>
                    </td>
                    <td className="py-4 pr-4">
                      {r.overall_score !== null ? (
                        <span className="text-xl font-bold">{r.overall_score.toFixed(1)}</span>
                      ) : (
                        <span className="badge badge-missing">Unavailable</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-400 font-mono">
                      {r.ci_lower !== null && r.ci_upper !== null
                        ? `[${r.ci_lower.toFixed(1)}, ${r.ci_upper.toFixed(1)}]`
                        : "—"}
                    </td>
                    <td className="py-4 pr-4">
                      {r.red_flags > 0 ? (
                        <span className="badge bg-red-900 text-red-300">{r.red_flags}</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </td>
                    <td className="py-4">
                      <Link href={`/countries/${r.country_iso3}`} className="text-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mt-12 card">
            <h3 className="text-xl font-semibold mb-4">Where did the money go?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Example audit trail — government expenditure mapped to declared objectives, domains,
              targets, and observed results.
            </p>
            <div className="font-mono text-sm space-y-2 bg-gray-900/50 p-4 rounded-lg">
              <div>£4.0bn</div>
              <div className="pl-4 border-l border-gray-700">↓ Homelessness programme</div>
              <div className="pl-8 border-l border-gray-700">↓ Reduce rough sleeping 60%</div>
              <div className="pl-12 border-l border-gray-700">↓ Life / Dignity / Property</div>
              <div className="pl-16 border-l border-gray-700">↓ Actual reduction: unavailable (pending data)</div>
              <div className="pl-20 border-l border-gray-700">
                ↓{" "}
                <Link href="/policies/GBR-HOUSING-2026-001">Policy score: pending verification</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
