import Link from "next/link";

export default function FrameworkPage() {
  return (
    <main className="shell pt-10 max-w-3xl">
      <div className="module-label">Framework</div>
      <h1 className="text-3xl md:text-4xl mb-6">Maqasid first. ʿUrf second.</h1>

      <section className="panel mb-4">
        <h2 className="text-lg font-semibold mb-2">Global objective function</h2>
        <p className="text-sm text-[var(--muted)]">
          Country scores and every government expenditure are evaluated against Maqasid domains
          only. That is the operating system kernel.
        </p>
      </section>

      <section className="panel mb-4">
        <h2 className="text-lg font-semibold mb-2">ʿUrf</h2>
        <p className="text-sm text-[var(--muted)]">
          Local customs — including Halacha — can be tuned per country if they serve Maqasid and
          do not contradict it. They are annotations, not alternate rankings.
        </p>
      </section>

      <section className="panel mb-6">
        <h2 className="text-lg font-semibold mb-2">Hierarchy</h2>
        <pre className="mono text-xs bg-[var(--bg-2)] p-3 border border-[var(--line)] overflow-x-auto">{`Maqasid (global)
  → ʿurf (local, optional)
  → must not contradict Maqasid
  → expenditure → aim → evidence`}</pre>
      </section>

      <Link href="/os/" className="btn">
        Open Policy OS
      </Link>
    </main>
  );
}
