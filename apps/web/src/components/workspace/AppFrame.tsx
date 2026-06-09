import type React from "react";
import Link from "next/link";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div
          data-testid="workspace-header-row"
          className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6"
        >
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 font-extrabold">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0b66c3] text-white">RC</span>
            <span>Reach Consensus</span>
          </Link>
          <nav
            aria-label="Workspace navigation"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-[#657180]"
          >
            <Link href="/dashboard">Dashboard</Link>
            <span>Internal workspace</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
