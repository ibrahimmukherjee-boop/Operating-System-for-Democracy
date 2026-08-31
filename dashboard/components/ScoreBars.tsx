/** Data-driven bar chart of scored countries — no stock imagery. */
export function ScoreBars({
  rows,
}: {
  rows: { label: string; score: number | null; rank: number | null }[];
}) {
  const scored = rows.filter((r) => r.score != null);
  const max = Math.max(...scored.map((r) => r.score!), 100);

  return (
    <svg viewBox={`0 0 640 ${Math.max(scored.length * 36 + 16, 80)}`} className="w-full h-auto" role="img" aria-label="Pilot country OSD scores">
      {scored.map((r, i) => {
        const y = 8 + i * 36;
        const w = ((r.score ?? 0) / max) * 420;
        return (
          <g key={r.label}>
            <text x="0" y={y + 14} className="fill-[var(--muted)]" style={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}>
              #{r.rank}
            </text>
            <text x="42" y={y + 14} className="fill-[var(--fg)]" style={{ fontSize: 13, fontFamily: "IBM Plex Sans, sans-serif" }}>
              {r.label}
            </text>
            <rect x="180" y={y + 2} width="420" height="16" fill="#e8e2d8" />
            <rect x="180" y={y + 2} width={w} height="16" fill="#0b5fff" />
            <text x="610" y={y + 14} textAnchor="end" className="fill-[var(--fg)]" style={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}>
              {r.score?.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
