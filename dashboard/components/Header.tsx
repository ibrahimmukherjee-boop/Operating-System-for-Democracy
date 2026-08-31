"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/#journey", label: "Policy loop" },
  { href: "/rankings/", label: "Rankings" },
  { href: "/weighting/", label: "Weighting lab" },
  { href: "/framework/", label: "Framework" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "shadow-lg shadow-black/30" : ""}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href="/" className="group">
          <div className="display text-lg font-bold tracking-tight text-white group-hover:text-white">
            Operating System for a Democracy
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Maqasid in · Evidence out · Power audited
          </div>
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
