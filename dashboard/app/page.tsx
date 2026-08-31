import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-static";

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
        <p className="text-sm uppercase tracking-widest text-blue-300 mb-3">
          Maqāṣid-based public audit
        </p>
        <h2 className="text-3xl font-bold mb-2">How well is your country actually working?</h2>
        <p className="text-gray-400 max-w-2xl">
          Countries and every government expenditure are scored against{" "}
          <strong className="text-gray-200">Maqasid</strong> — the global objective function.
          Local customs (ʿurf), including Halacha, may be tuned per country only where they
          serve Maqasid and do not contradict it.
        </p>
      </section>

      {error && (
        <div className="card border-red-800 bg-red-950/30 mb-8">
          <p className="text-red-300">Unable to load data: {error}</p>
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
              <div className="text-sm text-gray-400">Maqasid domains</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.model_version}</div>
              <div className="text-sm text-gray-400">Model version</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-gray-400">Framework</div>
              <div className="text-sm font-semibold text-blue-300">Maqasid + ʿurf</div>
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
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rankings.map((r) => (
                  <tr key={r.country_iso3} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-4 pr-4 font-mono">#{r.rank}</td>
                    <td className="py-4 pr-4">
                      <Link href={`/countries/${r.country_iso3}/`} className="font-medium">
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
                    <td className="py-4">
                      <Link href={`/countries/${r.country_iso3}/`} className="text-sm">
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
              Every pound of public expenditure must declare its Maqasid objective before it can
              claim success.
            </p>
            <div className="font-mono text-sm space-y-2 bg-gray-900/50 p-4 rounded-lg">
              <div>£4.0bn → mapped to ḥifẓ al-nafs / karāmah / ḥifẓ al-māl …</div>
              <div className="pl-4 border-l border-gray-700">↓ Homelessness programme</div>
              <div className="pl-8 border-l border-gray-700">↓ Reduce rough sleeping 60% (life)</div>
              <div className="pl-12 border-l border-gray-700">↓ Maqasid: life, dignity, property, family, justice</div>
              <div className="pl-16 border-l border-gray-700">↓ Observed: pending verified data</div>
              <div className="pl-20 border-l border-gray-700">
                ↓{" "}
                <Link href="/policies/GBR-HOUSING-2026-001/">
                  Policy audit trail →
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
