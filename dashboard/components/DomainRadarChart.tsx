"use client";

import dynamic from "next/dynamic";
import type { DomainScore } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
  domainScores: DomainScore[];
}

export function DomainRadarChart({ domainScores }: Props) {
  const labels = domainScores.map((d) => d.domain_id);
  const values = domainScores.map((d) => d.score ?? 0);

  return (
    <Plot
      data={[
        {
          type: "scatterpolar",
          r: values,
          theta: labels,
          fill: "toself",
          name: "Domain scores",
          line: { color: "#3b82f6" },
          fillcolor: "rgba(59, 130, 246, 0.2)",
        },
      ]}
      layout={{
        polar: {
          radialaxis: { visible: true, range: [0, 100], gridcolor: "#374151" },
          bgcolor: "transparent",
        },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: "#e8edf5", size: 11 },
        margin: { t: 30, b: 30, l: 80, r: 80 },
        height: 400,
        showlegend: false,
      }}
      config={{ displayModeBar: false }}
      style={{ width: "100%" }}
    />
  );
}
