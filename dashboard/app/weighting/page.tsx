"use client";

import { useState } from "react";

const DEFAULT_WEIGHTS: Record<string, number> = {
  D1: 1, D2: 1, D3: 1, D4: 1, D5: 1,
  D6: 1, D7: 1, D8: 1, D9: 1, D10: 1,
};

const DOMAIN_LABELS: Record<string, string> = {
  D1: "Religion & Conscience",
  D2: "Life & Security",
  D3: "Education",
  D4: "Family",
  D5: "Economy",
  D6: "Justice",
  D7: "Dignity",
  D8: "Democracy",
  D9: "Trust",
  D10: "Environment",
};

export default function WeightingLabPage() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [rankings, setRankings] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recompute() {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8742";
      const res = await fetch(`${apiUrl}/api/v1/scoring/recompute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setRankings(data.rankings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to recompute");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Weighting Laboratory</h2>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Change normative assumptions and immediately recompute world rankings. Ideology becomes
        visible rather than hidden inside the algorithm.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="font-semibold mb-4">Domain weights</h3>
          <div className="space-y-4">
            {Object.entries(weights).map(([id, w]) => (
              <div key={id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>
                    {id}: {DOMAIN_LABELS[id]}
                  </span>
                  <span className="font-mono">{w.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={w}
                  onChange={(e) =>
                    setWeights({ ...weights, [id]: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <button
            onClick={recompute}
            disabled={loading}
            className="mt-6 w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium"
          >
            {loading ? "Recomputing…" : "Recompute rankings"}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Recomputed rankings</h3>
          {!rankings ? (
            <p className="text-gray-400 text-sm">Adjust weights and click recompute.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2 text-left">Rank</th>
                  <th className="py-2 text-left">Country</th>
                  <th className="py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {(rankings as { rank: number; country_name: string; overall_score: number | null }[]).map(
                  (r) => (
                    <tr key={r.rank} className="border-b border-gray-800">
                      <td className="py-2 font-mono">#{r.rank}</td>
                      <td className="py-2">{r.country_name}</td>
                      <td className="py-2 text-right font-mono">
                        {r.overall_score?.toFixed(1) ?? "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
