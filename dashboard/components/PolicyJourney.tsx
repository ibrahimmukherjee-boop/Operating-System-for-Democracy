"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    id: "problem",
    title: "Problem",
    body: "Name the harm in measurable terms — rough sleeping, preventable deaths, children in temporary housing.",
  },
  {
    id: "objective",
    title: "Objective",
    body: "Declare the Maqasid aim up front: life, dignity, property, family, justice — not vibes.",
  },
  {
    id: "constraints",
    title: "Constraints",
    body: "Constitutional limits and ʿurf (local custom) may tune delivery — they cannot contradict Maqasid.",
  },
  {
    id: "intervention",
    title: "Intervention",
    body: "Design the policy, budget every pound to a Maqasid objective, publish baseline and confidence intervals.",
  },
  {
    id: "targets",
    title: "Targets",
    body: "Rough sleeping −60%. Families in temp accommodation −40%. Preventable deaths −50%. Set the numbers.",
  },
  {
    id: "observe",
    title: "Observe",
    body: "Each year, compare outcomes to predictions. Provenance on every figure — source, date, method, model.",
  },
  {
    id: "decide",
    title: "Decide",
    body: "Continue, modify, or stop. If spend rises and outcomes worsen, success cannot be redefined after the fact.",
  },
];

export function PolicyJourney() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--ember-soft)] mb-3">
          Guided decision loop
        </p>
        <h2 className="display text-4xl md:text-5xl font-bold mb-4">
          How a social policy earns the right to spend public money
        </h2>
        <p className="text-[var(--muted)] mb-8 max-w-xl">
          This is the operating system: problem → Maqasid objective → constraints → intervention →
          targets → observed outcomes → continue / modify / stop.
        </p>
        <div>
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActive(i)}
              className={`journey-step w-full text-left ${i === active ? "active" : "opacity-55"}`}
            >
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
                Step {i + 1}
              </div>
              <div className="display text-xl font-semibold">{step.title}</div>
              {i === active && (
                <p className="text-sm text-[var(--muted)] mt-2 animate-fade-up">{step.body}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="card relative overflow-hidden min-h-[520px] flex flex-col justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="glow-orb"
            style={{
              right: "-10%",
              top: "-10%",
              background: "rgba(91,140,255,0.25)",
            }}
          />
          <div
            className="glow-orb delay-2"
            style={{
              left: "-20%",
              bottom: "-20%",
              background: "rgba(255,106,42,0.2)",
            }}
          />
        </div>
        <div className="relative">
          <div className="text-sm text-[var(--muted)] mb-2">Live stage</div>
          <div className="display text-3xl font-bold mb-3">{STEPS[active].title}</div>
          <p className="text-lg text-[var(--fg)]/90 leading-relaxed">{STEPS[active].body}</p>
        </div>
        <div className="relative mt-10">
          <div className="flex gap-2 mb-4">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{
                  background:
                    i <= active
                      ? "linear-gradient(90deg, var(--ember), var(--ice))"
                      : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
          <div className="font-mono text-xs text-[var(--muted)]">
            {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} · Maqasid
            expenditure gate
          </div>
        </div>
      </div>
    </div>
  );
}
