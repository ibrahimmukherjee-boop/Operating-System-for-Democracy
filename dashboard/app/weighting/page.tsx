"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountryScore } from "@/lib/api";

const DEFAULT_WEIGHTS: Record<string, number> = {
  D1: 1, D2: 1, D3: 1, D4: 1, D5: 1,
  D6: 1, D7: 1, D8: 1, D9: 1, D10: 1,
};

const LABELS: Record<string, string> = {
  D1: "Conscience",
  D2: "Life",
  D3: "Intellect",
  D4: "Family",
  D5: "Property",
  D6: "Justice",
  D7: "Dignity",
  D8: "Consultation",
  D9: "Trust",
  D10: "Non-harm",
};

function wgm(
  domains: { domain_id: string; score: number | null }[],
  weights: Record<string, number>
): number | null {
  const valid = domains.filter((d) => d.score != null && d.score! > 0);
  if (!valid.length) return null;
  const ws = valid.reduce((s, d) => s + (weights[d.domain_id] ?? 1), 0);
  if (!ws) return null;
  const logSum = valid.reduce((s, d) => s + (weights[d.domain_id] ?? 1) * Math.log(d.score!), 0);
  return Math.round(Math.exp(logSum / ws) * 100) / 100;
}

export default function WeightingLabPage() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [scores, setScores] = useState<Record<string, CountryScore> | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(`${base}/data/country_scores.json`)
      .then((r) => r.json())
      .then(setScores);
  }, []);

  const rankings = useMemo(() => {
    if (!scores) return null;
    const rows = Object.values(scores)
      .filter((c) => c.status === "scored" || c.overall_score != null)
      .map((c) => ({
        iso3: c.country_iso3,
        name: c.country_name || c.country_iso3,
        score: wgm(c.domain_scores, weights),
      }))
      .filter((r) => r.score != null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((r, i) => ({ ...r, rank: i + 1 }));
    return rows;
  }, [scores, weights]);

  return (
    <main className="shell pt-10">
      <div className="mb-6 max-w-2xl">
        <div className="module-label">Weighting laboratory</div>
        <h1 className="text-3xl mb-2">Change Maqasid weights</h1>
        <p className="text-[var(--muted)] text-sm">
          Recompute scored-country rankings in the browser. ʿUrf does not change these weights.
        </p>
      </div>

      <div className="os-grid">
        <div className="panel" style={{ gridColumn: "span 6" }}>
          {Object.entries(weights).map(([id, w]) => (
            <div key={id} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  <span className="mono text-[var(--muted)] mr-2">{id}</span>
                  {LABELS[id]}
                </span>
                <span className="mono">{w.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={w}
                onChange={(e) => setWeights({ ...weights, [id]: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="module-label">Live ranking</div>
          {!rankings ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : (
            <table className="rank-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Country</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.iso3}>
                    <td className="mono">#{r.rank}</td>
                    <td>{r.name}</td>
                    <td className="mono">{r.score?.toFixed(1)}</td>
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
