"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountryScore } from "@/lib/api";

const DEFAULT_WEIGHTS: Record<string, number> = {
  D1: 1, D2: 1, D3: 1, D4: 1, D5: 1,
  D6: 1, D7: 1, D8: 1, D9: 1, D10: 1,
};

const DOMAIN_LABELS: Record<string, string> = {
  D1: "Religion & Conscience (ḥifẓ al-dīn)",
  D2: "Life & Security (ḥifẓ al-nafs)",
  D3: "Education (ḥifẓ al-ʿaql)",
  D4: "Family (ḥifẓ al-nasl)",
  D5: "Economy (ḥifẓ al-māl)",
  D6: "Justice (ʿadl)",
  D7: "Dignity (karāmah)",
  D8: "Consultation (shūrā)",
  D9: "Trust (amānah)",
  D10: "Non-harm (lā ḍarar)",
};

function weightedGeometricMean(
  domainScores: { domain_id: string; score: number | null }[],
  weights: Record<string, number>
): number | null {
  const valid = domainScores.filter((d) => d.score !== null && d.score! > 0);
  if (!valid.length) return null;
  const weightSum = valid.reduce((s, d) => s + (weights[d.domain_id] ?? 1), 0);
  if (weightSum === 0) return null;
  const logSum = valid.reduce(
    (s, d) => s + (weights[d.domain_id] ?? 1) * Math.log(d.score!),
    0
  );
  return Math.round(Math.exp(logSum / weightSum) * 100) / 100;
}

export default function WeightingLabPage() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [scores, setScores] = useState<Record<string, CountryScore> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/data/country_scores.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load country scores");
        return r.json();
      })
      .then(setScores)
      .catch((e) => setError(e.message));
  }, []);

  const rankings = useMemo(() => {
    if (!scores) return null;
    const rows = Object.values(scores).map((c) => ({
      country_iso3: c.country_iso3,
      country_name: c.country_name || c.country_iso3,
      overall_score: weightedGeometricMean(c.domain_scores, weights),
    }));
    rows.sort((a, b) => (b.overall_score ?? -1) - (a.overall_score ?? -1));
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [scores, weights]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="display text-4xl font-bold mb-2">Weighting Laboratory</h2>
      <p className="text-[var(--muted)] mb-2 max-w-2xl">
        Adjust Maqasid domain weights and recompute rankings instantly in the browser.
        Ideology becomes visible — the global objective function stays Maqasid.
      </p>
      <p className="text-sm text-[var(--ember-soft)] mb-8 max-w-2xl">
        ʿUrf (local customs, including Halacha) does not change these weights. Urf is
        country-tunable only where it serves Maqasid and does not contradict it.
      </p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="font-semibold mb-4">Maqasid domain weights</h3>
          <div className="space-y-4">
            {Object.entries(weights).map(([id, w]) => (
              <div key={id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{DOMAIN_LABELS[id]}</span>
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
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Live rankings (Maqasid geometric mean)</h3>
          {!rankings ? (
            <p className="text-gray-400 text-sm">Loading…</p>
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
                {rankings.map((r) => (
                  <tr key={r.country_iso3} className="border-b border-gray-800">
                    <td className="py-2 font-mono">#{r.rank}</td>
                    <td className="py-2">{r.country_name}</td>
                    <td className="py-2 text-right font-mono">
                      {r.overall_score?.toFixed(1) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
