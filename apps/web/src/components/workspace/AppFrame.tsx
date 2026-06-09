import type React from "react";
import Link from "next/link";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#17202a]">
      <header className="border-b border-[#d9e0e8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b66c3] text-white">RC</span>
            <span>Reach Consensus</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-[#657180]">
            <Link href="/dashboard">Dashboard</Link>
            <span>Internal workspace</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
