import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-800 mb-8">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight">
              Operating System for a Democracy
            </h1>
          </Link>
          <p className="text-sm text-gray-400 mt-1">
            Policy in. Evidence out. Power audited.
          </p>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/">Global Rankings</Link>
          <Link href="/weighting">Weighting Lab</Link>
        </nav>
      </div>
    </header>
  );
}
