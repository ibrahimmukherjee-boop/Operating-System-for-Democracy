"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExpenditureFlow } from "@/components/ExpenditureFlow";

type Policy = {
  policy_id: string;
  title: string;
  country_name: string | null;
  country_iso3: string;
  stated_objectives: string[];
  maqasid_domains: string[];
  urf?: { tradition: string; principle: string }[];
  budget: Record<string, unknown> | null;
  baseline: Record<string, unknown> | null;
  targets: Record<string, unknown> | null;
  observed_outcomes: Record<string, unknown> | null;
  review_status: string;
  constitutional_constraints?: string[];
  legal_basis?: string[];
  effectiveness_score?: number | null;
};

const STEPS = [
  { id: "problem", title: "Problem", hint: "Name the measurable harm." },
  { id: "objective", title: "Objective", hint: "Bind spend to Maqasid." },
  { id: "constraints", title: "Constraints", hint: "Constitution + ʿurf." },
  { id: "budget", title: "Budget", hint: "Allocate every unit of spend." },
  { id: "targets", title: "Targets", hint: "Publish numbers in advance." },
  { id: "observe", title: "Observe", hint: "Compare outcomes yearly." },
  { id: "decide", title: "Decide", hint: "Continue, modify, or stop." },
];

function usdLabel(amount: number | null | undefined, currency?: string) {
  if (amount == null) return "—";
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}bn ${currency || ""}`.trim();
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(0)}m ${currency || ""}`.trim();
  return `${amount.toLocaleString()} ${currency || ""}`.trim();
}

export function PolicyWalkthrough({ policy }: { policy: Policy }) {
  const [step, setStep] = useState(0);
  const allocation = useMemo(() => {
    const alloc = (policy.budget?.maqasid_allocation || {}) as Record<string, number>;
    return Object.entries(alloc).map(([maqasid, share]) => ({ maqasid, share }));
  }, [policy]);

  const amount = policy.budget?.amount as number | undefined;
  const currency = (policy.budget?.currency as string) || "";

  const body = (() => {
    switch (STEPS[step].id) {
      case "problem":
        return (
          <div>
            <p className="text-[var(--muted)] mb-3">
              Political debate often skips measurement. The OS requires an explicit problem statement.
            </p>
            <div className="panel bg-[var(--bg)]">
              <div className="module-label">Declared problem space</div>
              <p className="font-medium">{policy.stated_objectives[0]}</p>
              <p className="text-sm text-[var(--muted)] mt-2">
                Country: {policy.country_name} · Area: housing / social policy
              </p>
            </div>
          </div>
        );
      case "objective":
        return (
          <div>
            <p className="text-[var(--muted)] mb-3">Map the programme to Maqasid — the global objective function.</p>
            <div className="flex flex-wrap gap-2">
              {policy.maqasid_domains.map((m) => (
                <span key={m} className="badge">
                  {m}
                </span>
              ))}
            </div>
          </div>
        );
      case "constraints":
        return (
          <div className="space-y-3">
            <div>
              <div className="module-label">Legal / constitutional</div>
              <ul className="text-sm list-disc list-inside text-[var(--muted)]">
                {(policy.legal_basis || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
                {(policy.constitutional_constraints || []).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="module-label">ʿUrf (local custom)</div>
              <ul className="text-sm space-y-1">
                {(policy.urf || []).map((u, i) => (
                  <li key={i}>
                    <span className="badge mr-2">{u.tradition}</span>
                    <span className="mono">{u.principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "budget":
        return (
          <div>
            <div className="text-3xl font-semibold mono mb-3">
              {usdLabel(amount, currency)}
            </div>
            {allocation.length > 0 && (
              <ExpenditureFlow amountLabel="Required Maqasid allocation" allocation={allocation} />
            )}
          </div>
        );
      case "targets":
        return (
          <table className="rank-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Maqasid</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(policy.targets || {}).map(([k, v]) => {
                const t = v as { value?: number; maqasid?: string };
                return (
                  <tr key={k}>
                    <td className="mono text-xs">{k}</td>
                    <td className="mono text-xs">{t.maqasid}</td>
                    <td>{t.value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case "observe":
        return (
          <div>
            <p className="text-[var(--muted)] mb-3">
              Each year, outcomes are compared to the declared targets. Missing data stays missing.
            </p>
            <div className="panel bg-[var(--bg)]">
              <span className="badge badge-missing">Observed outcomes: unavailable</span>
              <p className="text-sm text-[var(--muted)] mt-2">
                Review status: <span className="badge badge-unverified">{policy.review_status}</span>
              </p>
            </div>
          </div>
        );
      case "decide":
        return (
          <div>
            <p className="text-[var(--muted)] mb-3">
              If spend rises and outcomes worsen, success cannot be redefined after the fact.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge">Continue</span>
              <span className="badge">Modify</span>
              <span className="badge">Stop funding</span>
            </div>
            <p className="text-sm">
              Declaration score (not observed impact):{" "}
              <span className="mono font-semibold">
                {policy.effectiveness_score?.toFixed(1) ?? "—"} / 100
              </span>
            </p>
            <Link href={`/policies/${policy.policy_id}/`} className="btn mt-4">
              Open full policy record
            </Link>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="panel">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div>
          <div className="module-label">Policy walkthrough</div>
          <h2 className="text-xl">{policy.title}</h2>
          <p className="text-sm text-[var(--muted)]">
            {policy.country_name} · guided audit of one social policy
          </p>
        </div>
        <div className="mono text-xs text-[var(--muted)]">
          Step {step + 1} / {STEPS.length}
        </div>
      </div>

      <div className="flex gap-1 mb-5 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className="px-2 py-1 text-xs border border-[var(--line)] whitespace-nowrap"
            style={{
              background: i === step ? "var(--fg)" : "var(--bg)",
              color: i === step ? "#fff" : "var(--muted)",
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="mb-2">
        <div className="font-semibold">{STEPS[step].title}</div>
        <div className="text-sm text-[var(--muted)] mb-3">{STEPS[step].hint}</div>
        {body}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="btn"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
