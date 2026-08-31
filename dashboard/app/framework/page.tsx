import Link from "next/link";

export default function FrameworkPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--ember-soft)] mb-3">Philosophy</p>
      <h1 className="display text-4xl md:text-5xl font-bold mb-8">Framework</h1>

      <section className="card mb-6">
        <h2 className="display text-2xl font-bold mb-3">Maqasid is the operating system</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          Governments, policies, and every expenditure are scored against Maqasid objectives —
          life, intellect, family, property, conscience, justice, dignity, consultation, trust,
          and non-harm. The objective function is explicit.
        </p>
      </section>

      <section className="card mb-6">
        <h2 className="display text-2xl font-bold mb-3">ʿUrf — local customs</h2>
        <p className="text-[var(--muted)] mb-4 leading-relaxed">
          Local customs can be tuned to every country — including Halacha — as long as they fall
          under Maqasid and do not contradict it.
        </p>
        <ul className="text-sm text-[var(--muted)] space-y-2">
          <li>· Halacha → ʿurf (not a co-equal global score)</li>
          <li>· Liberal constitutional practice → ʿurf</li>
          <li>· Contradiction with Maqasid → rejected</li>
        </ul>
      </section>

      <section className="card mb-8">
        <h2 className="display text-2xl font-bold mb-3">Hierarchy</h2>
        <pre className="text-sm bg-black/40 p-4 rounded-xl overflow-x-auto text-[var(--ice-soft)]">{`Maqasid (global)
    ↓
ʿUrf (local, country-tunable)
    ↓
must not contradict Maqasid
    ↓
Expenditure → Maqasid aim → evidence`}</pre>
      </section>

      <Link href="/#journey" className="btn-primary">
        Walk the policy loop
      </Link>
    </main>
  );
}
