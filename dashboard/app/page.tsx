import Link from "next/link";
import { PolicyJourney } from "@/components/PolicyJourney";
import { api } from "@/lib/api";
import { withBase } from "@/lib/paths";

export const dynamic = "force-static";

const MAQASID = [
  { code: "hifẓ al-dīn", label: "Conscience" },
  { code: "hifẓ al-nafs", label: "Life" },
  { code: "hifẓ al-ʿaql", label: "Intellect" },
  { code: "hifẓ al-nasl", label: "Family" },
  { code: "hifẓ al-māl", label: "Property" },
  { code: "ʿadl", label: "Justice" },
  { code: "karāmah", label: "Dignity" },
  { code: "shūrā", label: "Consultation" },
  { code: "amānah", label: "Trust" },
  { code: "lā ḍarar", label: "Non-harm" },
];

export default async function HomePage() {
  let top: { country_name: string; overall_score: number | null; rank: number }[] = [];
  try {
    const data = await api.rankings();
    top = data.rankings.slice(0, 3).map((r) => ({
      country_name: r.country_name,
      overall_score: r.overall_score,
      rank: r.rank,
    }));
  } catch {
    top = [];
  }

  return (
    <div>
      {/* HERO */}
      <section className="hero-shell">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url('${withBase("/hero-network.jpg")}')` }}
          aria-hidden
        />
        <div className="hero-overlay" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20 pt-28 w-full">
          <p className="animate-fade-up text-sm uppercase tracking-[0.25em] text-[var(--ember-soft)] mb-5">
            Open-source · Maqasid-primary · Public audit
          </p>
          <h1 className="animate-fade-up delay-1 display text-5xl md:text-7xl font-extrabold max-w-4xl leading-[0.95] mb-6">
            Operating System
            <br />
            for a Democracy
          </h1>
          <p className="animate-fade-up delay-2 text-lg md:text-xl text-[var(--fg)]/80 max-w-2xl mb-10">
            Policy in. Evidence out. Power audited. Every government expenditure must declare its
            Maqasid objective — then prove it moved the needle.
          </p>
          <div className="animate-fade-up delay-3 flex flex-wrap gap-3">
            <Link href="/#journey" className="btn-primary">
              Walk the policy loop
            </Link>
            <Link href="/rankings/" className="btn-ghost">
              See global rankings
            </Link>
          </div>
        </div>
      </section>

      {/* OS LAYERS */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: "01",
              t: "Country State",
              d: "Ten Maqasid domains. Indicators normalised. Uncertainty explicit. Red-line caps for catastrophic harm.",
            },
            {
              n: "02",
              t: "Policy Engine",
              d: "Every programme maps to Maqasid. ʿUrf (including Halacha) may tune locally — never override the objective function.",
            },
            {
              n: "03",
              t: "Outcome Evaluation",
              d: "Baseline → targets → observed results → provenance. Continue, modify, or stop. No after-the-fact redefinition.",
            },
          ].map((c, i) => (
            <div key={c.n} className={`card animate-fade-up delay-${i + 1}`}>
              <div className="font-mono text-xs text-[var(--ember-soft)] mb-3">{c.n}</div>
              <h3 className="display text-2xl font-bold mb-3">{c.t}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAQASID GRID */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--ice-soft)] mb-3">
            Global objective function
          </p>
          <h2 className="display text-4xl font-bold mb-3">Ten Maqasid domains</h2>
          <p className="text-[var(--muted)]">
            Scoring is Maqasid alone. Local customs sit under ʿurf and must not contradict these aims.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MAQASID.map((m) => (
            <div key={m.code} className="maqasid-chip">
              <div className="font-mono text-[11px] text-[var(--ember-soft)] mb-1">{m.code}</div>
              <div className="display font-semibold">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section id="journey" className="max-w-6xl mx-auto px-4 py-24 border-t border-[var(--line)]">
        <PolicyJourney />
      </section>

      {/* AUDIT ZOOM */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="audit-panel animate-float" style={{ animationDuration: "10s" }}>
            <img src={withBase("/audit-zoom.jpg")} alt="Multi-scale audit visualization" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="font-mono text-xs text-[var(--ice-soft)] mb-2">ZOOM → EVIDENCE</div>
              <div className="display text-2xl font-bold">Every number drills to provenance</div>
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--ice-soft)] mb-3">
              Where did the money go?
            </p>
            <h2 className="display text-4xl font-bold mb-4">
              £4bn homelessness programme — show your working
            </h2>
            <div className="font-mono text-sm space-y-3 text-[var(--muted)] mb-8">
              <div className="text-[var(--fg)]">£4.0bn</div>
              <div className="pl-4 border-l border-[var(--line)]">↓ National Homelessness Reduction</div>
              <div className="pl-8 border-l border-[var(--line)]">↓ Maqasid: life · dignity · property · family · justice</div>
              <div className="pl-12 border-l border-[var(--line)]">↓ Target: rough sleeping −60%</div>
              <div className="pl-16 border-l border-[var(--ember)] text-[var(--ember-soft)]">
                ↓ Observed: pending verified data
              </div>
            </div>
            <Link href="/policies/GBR-HOUSING-2026-001/" className="btn-primary">
              Open policy audit trail
            </Link>
          </div>
        </div>
      </section>

      {/* RANKINGS TEASER */}
      <section className="max-w-6xl mx-auto px-4 py-24 border-t border-[var(--line)]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--ember-soft)] mb-3">
              Pilot rankings
            </p>
            <h2 className="display text-4xl font-bold">How well is your country working?</h2>
          </div>
          <Link href="/rankings/" className="btn-ghost">
            Full rankings →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {top.map((c, i) => (
            <div key={c.country_name} className={`card animate-fade-up delay-${i + 1}`}>
              <div className="text-xs font-mono text-[var(--muted)] mb-2">#{c.rank}</div>
              <div className="display text-2xl font-bold mb-1">{c.country_name}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ember)] to-[var(--ice)] bg-clip-text text-transparent">
                {c.overall_score?.toFixed(1) ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-4 text-sm text-[var(--muted)]">
          <div>
            <div className="display text-white font-semibold mb-1">Operating System for a Democracy</div>
            Maqasid in. Evidence out. Power audited.
          </div>
          <div>
            Open source · MIT ·{" "}
            <a href="https://github.com/ibrahimmukherjee-boop/Operating-System-for-Democracy">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
