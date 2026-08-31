"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  rank: number | null;
  country_iso3: string;
  country_name: string;
  region?: string | null;
  overall_score: number | null;
  status?: string;
  unavailable_reason?: string | null;
  pilot?: boolean;
};

export default function RankingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<{ scored_countries?: number; total_countries?: number }>({});
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "scored" | "unavailable">("all");
  const [region, setRegion] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    Promise.all([
      fetch(`${base}/data/rankings.json`).then((r) => r.json()),
    ])
      .then(([data]) => {
        setRows(data.rankings);
        setMeta(data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const regions = useMemo(() => {
    const s = new Set(rows.map((r) => r.region).filter(Boolean) as string[]);
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "scored" && r.status !== "scored" && r.overall_score == null) return false;
      if (filter === "unavailable" && !(r.status === "unavailable" || r.overall_score == null))
        return false;
      if (region !== "all" && r.region !== region) return false;
      if (q && !`${r.country_name} ${r.country_iso3}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [rows, filter, region, q]);

  return (
    <main className="shell pt-10">
      <div className="mb-6 max-w-3xl">
        <div className="module-label">Global registry</div>
        <h1 className="text-3xl md:text-4xl mb-2">Country rankings</h1>
        <p className="text-[var(--muted)]">
          All {meta.total_countries ?? 195} sovereign states.{" "}
          {meta.scored_countries ?? "—"} currently scored from verified pilot ingestion. Remaining
          countries are listed as <em>unavailable</em> — scores are never invented.
        </p>
      </div>

      {error && <div className="panel mb-4 text-[var(--warn)]">{error}</div>}

      <div className="panel mb-4 flex flex-col md:flex-row gap-3 md:items-end">
        <label className="flex-1 text-sm">
          <span className="module-label">Search</span>
          <input
            className="w-full border border-[var(--line)] rounded-sm px-3 py-2 bg-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Country or ISO3"
          />
        </label>
        <label className="text-sm">
          <span className="module-label">Status</span>
          <select
            className="block border border-[var(--line)] rounded-sm px-3 py-2 bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All</option>
            <option value="scored">Scored</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="module-label">Region</span>
          <select
            className="block border border-[var(--line)] rounded-sm px-3 py-2 bg-white"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All regions" : r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel overflow-x-auto">
        <table className="rank-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Country</th>
              <th>Region</th>
              <th>OSD score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.country_iso3}>
                <td className="mono">{r.rank != null ? `#${r.rank}` : "—"}</td>
                <td>
                  {r.overall_score != null ? (
                    <Link href={`/countries/${r.country_iso3}/`} className="font-medium">
                      {r.country_name}
                    </Link>
                  ) : (
                    <span className="font-medium">{r.country_name}</span>
                  )}
                  <span className="mono text-xs text-[var(--muted)] ml-2">{r.country_iso3}</span>
                </td>
                <td className="text-[var(--muted)]">{r.region || "—"}</td>
                <td className="mono">
                  {r.overall_score != null ? r.overall_score.toFixed(1) : "—"}
                </td>
                <td>
                  {r.overall_score != null ? (
                    <span className="badge">Scored</span>
                  ) : (
                    <span className="badge badge-missing" title={r.unavailable_reason || ""}>
                      Unavailable
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-[var(--muted)] mt-3">
          Showing {filtered.length} of {rows.length} states
        </p>
      </div>
    </main>
  );
}
