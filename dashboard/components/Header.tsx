"use client";

import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/dashboard/", label: "Live dashboard" },
  { href: "/rankings/", label: "Countries" },
  { href: "/os/", label: "Policy OS" },
  { href: "/weighting/", label: "Weights" },
  { href: "/framework/", label: "Framework" },
];

export function Header() {
  return (
    <header className="site-nav">
      <div className="shell flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
        <Link href="/" className="hover:no-underline">
          <div className="font-semibold text-[15px] text-[var(--fg)]">
            Operating System for a Democracy
          </div>
          <div className="mono text-[11px] text-[var(--muted)]">
            Maqasid · evidence · audit
          </div>
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[var(--fg)] hover:text-[var(--accent-2)]">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
