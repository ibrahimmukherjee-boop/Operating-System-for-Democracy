import Link from "next/link";

export default function FrameworkPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-bold mb-4">Framework</h2>

      <section className="card mb-6">
        <h3 className="text-xl font-semibold mb-3">Maqasid is the operating system</h3>
        <p className="text-gray-300 mb-3">
          Operating System for a Democracy scores governments, policies, and{" "}
          <strong>every expenditure</strong> against Maqasid objectives — life, intellect,
          family, property, religion/conscience, justice, dignity, consultation, trust, and
          non-harm.
        </p>
        <p className="text-gray-400 text-sm">
          This is not a comparative league table of religions. It is a public-policy audit
          where the objective function is explicit.
        </p>
      </section>

      <section className="card mb-6">
        <h3 className="text-xl font-semibold mb-3">ʿUrf — local customs</h3>
        <p className="text-gray-300 mb-3">
          Local customs (ʿurf) can be tuned to every country — including Halacha, constitutional
          practice, and development norms — <em>as long as they fall under Maqasid and do not
          contradict it</em>.
        </p>
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
          <li>Halacha → ʿurf (not a co-equal global score)</li>
          <li>Liberal constitutional practice → ʿurf</li>
          <li>Human-rights uptake → ʿurf</li>
          <li>Contradiction with Maqasid → rejected</li>
        </ul>
      </section>

      <section className="card mb-6">
        <h3 className="text-xl font-semibold mb-3">Hierarchy</h3>
        <pre className="text-sm bg-gray-900/60 p-4 rounded-lg overflow-x-auto">{`Maqasid (global)
    ↓
ʿUrf (local, country-tunable)
    ↓
must not contradict Maqasid
    ↓
Government expenditure → Maqasid aim → evidence`}</pre>
      </section>

      <p className="text-sm text-gray-500">
        Docs in the repository: <code>docs/philosophy/maqasid.md</code>,{" "}
        <code>docs/philosophy/urf.md</code>.{" "}
        <Link href="/">← Rankings</Link>
      </p>
    </div>
  );
}
