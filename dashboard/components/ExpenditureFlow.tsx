/** Expenditure → Maqasid allocation chart from policy budget data. */
export function ExpenditureFlow({
  amountLabel,
  allocation,
}: {
  amountLabel: string;
  allocation: { maqasid: string; share: number }[];
}) {
  const total = allocation.reduce((s, a) => s + a.share, 0) || 1;
  let x = 0;
  const W = 640;
  const H = 88;

  return (
    <div>
      <div className="mono text-xs text-[var(--muted)] mb-2">{amountLabel} → Maqasid allocation</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Budget allocation by Maqasid">
        {allocation.map((a, i) => {
          const w = (a.share / total) * W;
          const el = (
            <g key={a.maqasid}>
              <rect x={x} y={0} width={w} height={36} fill={i % 2 === 0 ? "#0b5fff" : "#0a3d91"} />
              <title>{`${a.maqasid}: ${(a.share * 100).toFixed(0)}%`}</title>
            </g>
          );
          x += w;
          return el;
        })}
        {allocation.map((a, i) => {
          const prev = allocation.slice(0, i).reduce((s, x) => s + x.share, 0);
          const cx = (prev + a.share / 2) / total * W;
          return (
            <text
              key={`l-${a.maqasid}`}
              x={cx}
              y={58}
              textAnchor="middle"
              style={{ fontSize: 9, fontFamily: "IBM Plex Mono, monospace", fill: "#5c574f" }}
            >
              {a.maqasid.replace("hifz_al_", "")} {(a.share * 100).toFixed(0)}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}
