import Link from "next/link";
import { ExpenditureFlow } from "@/components/ExpenditureFlow";
import { api } from "@/lib/api";

export const dynamic = "force-static";

const STEPS = [
  { n: "01", t: "Problem", d: "State the harm in measurable terms." },
  { n: "02", t: "Objective", d: "Bind the programme to Maqasid aims." },
  { n: "03", t: "Constraints", d: "Constitution + ʿurf (non-contradictory)." },
  { n: "04", t: "Intervention", d: "Policy design and delivery." },
  { n: "05", t: "Budget", d: "Allocate spend to Maqasid." },
  { n: "06", t: "Targets", d: "Publish baseline and deadlines." },
  { n: "07", t: "Evaluate", d: "Compare outcomes — continue / modify / stop." },
];

export default async function OsPage() {
  const policies = await api.policies();
  const policy = policies[0];
  const allocation = Object.entries(
    (policy?.budget?.maqasid_allocation as Record<string, number>) || {}
  ).map(([maqasid, share]) => ({ maqasid, share }));

  return (
    <main className="shell pt-10">
      <div className="mb-8 max-w-3xl">
        <div className="module-label">Policy operating system</div>
        <h1 className="text-3xl md:text-4xl mb-2">How government policy is processed</h1>
        <p className="text-[var(--muted)]">
          One pipeline. Seven stages. Every expenditure line must survive Maqasid mapping and
          outcome audit.
        </p>
      </div>

      <section className="pipeline mb-8">
        {STEPS.map((s) => (
          <div key={s.n} className="pipeline-step">
            <div className="n">{s.n}</div>
            <div className="t">{s.t}</div>
            <div className="text-xs text-[var(--muted)] mt-1">{s.d}</div>
          </div>
        ))}
      </section>

      <section className="os-grid mb-8">
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="module-label">Worked example</div>
          <h2 className="text-xl mb-2">{policy?.title}</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            {policy?.stated_objectives?.[0]}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flow-row">
              <div className="mono text-[var(--muted)]">Country</div>
              <div>{policy?.country_name}</div>
            </div>
            <div className="flow-row">
              <div className="mono text-[var(--muted)]">Maqasid</div>
              <div className="flex flex-wrap gap-1">
                {(policy?.maqasid_domains || []).map((m) => (
                  <span key={m} className="badge">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="flow-row">
              <div className="mono text-[var(--muted)]">ʿUrf</div>
              <div className="text-[var(--muted)]">
                {(policy?.urf || []).map((u) => u.principle).join(", ") || "—"}
              </div>
            </div>
            <div className="flow-row">
              <div className="mono text-[var(--muted)]">Review</div>
              <div>
                <span className="badge badge-unverified">{policy?.review_status}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href={`/policies/${policy?.policy_id}/`} className="btn">
              Full policy record
            </Link>
          </div>
        </div>

        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="module-label">Budget → Maqasid</div>
          <h2 className="text-xl mb-4">Expenditure composition</h2>
          {allocation.length > 0 && (
            <ExpenditureFlow
              amountLabel={`£${(((policy?.budget?.amount as number) || 0) / 1e9).toFixed(1)}bn`}
              allocation={allocation}
            />
          )}
          <div className="mt-6">
            <div className="module-label">Targets (declared)</div>
            <ul className="text-sm space-y-2">
              {policy?.targets &&
                Object.entries(policy.targets).map(([k, v]) => {
                  const t = v as { value?: number; maqasid?: string };
                  return (
                    <li key={k} className="flex justify-between gap-3 border-b border-[var(--line)] pb-2">
                      <span className="mono text-xs text-[var(--muted)]">{k}</span>
                      <span>
                        {t.value}{" "}
                        <span className="text-[var(--muted)] text-xs">({t.maqasid})</span>
                      </span>
                    </li>
                  );
                })}
            </ul>
            <p className="text-xs text-[var(--muted)] mt-3">
              Observed outcomes: pending verified statistical releases — shown as unavailable, not
              invented.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
