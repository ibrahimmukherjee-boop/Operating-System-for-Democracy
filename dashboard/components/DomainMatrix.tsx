/** Domain score matrix for scored countries — generated from live data. */
export function DomainMatrix({
  countries,
}: {
  countries: {
    name: string;
    iso3: string;
    domains: { id: string; score: number | null }[];
  }[];
}) {
  const domainIds = countries[0]?.domains.map((d) => d.id) ?? [];
  const cell = 28;
  const left = 72;
  const top = 28;
  const width = left + domainIds.length * cell + 8;
  const height = top + countries.length * cell + 8;

  function color(score: number | null): string {
    if (score == null) return "#e8e2d8";
    // blue scale by score
    const t = Math.max(0, Math.min(1, score / 100));
    const r = Math.round(232 - t * 180);
    const g = Math.round(226 - t * 100);
    const b = Math.round(216 + t * 39);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Maqasid domain score matrix">
      {domainIds.map((id, j) => (
        <text
          key={id}
          x={left + j * cell + cell / 2}
          y={18}
          textAnchor="middle"
          style={{ fontSize: 10, fontFamily: "IBM Plex Mono, monospace", fill: "#5c574f" }}
        >
          {id}
        </text>
      ))}
      {countries.map((c, i) => (
        <g key={c.iso3}>
          <text
            x={0}
            y={top + i * cell + cell / 2 + 4}
            style={{ fontSize: 11, fontFamily: "IBM Plex Sans, sans-serif", fill: "#141210" }}
          >
            {c.iso3}
          </text>
          {c.domains.map((d, j) => (
            <g key={d.id}>
              <rect
                x={left + j * cell + 2}
                y={top + i * cell + 2}
                width={cell - 4}
                height={cell - 4}
                fill={color(d.score)}
                stroke="#d9d3c8"
              />
              <title>{`${c.name} ${d.id}: ${d.score ?? "unavailable"}`}</title>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
