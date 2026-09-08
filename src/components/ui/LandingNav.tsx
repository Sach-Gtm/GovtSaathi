"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { InstallPWA } from "./InstallPWA";

export function LandingNav({ dashboardHref }: { dashboardHref?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-transparent">
      <div className="container-app flex items-center justify-between py-3.5">
        <Link href="/" aria-label="MAAPSETU home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-2 text-sm md:flex">
          <Link href="/verify" className="btn-ghost">Check a certificate</Link>
          <InstallPWA className="btn-ghost" />
          {dashboardHref ? (
            <Link href={dashboardHref} className="btn-accent">Go to dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-outline">Sign in</Link>
              <Link href="/register" className="btn-accent">Register</Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-canvas md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-b border-border bg-canvas md:hidden">
          <nav className="container-app flex flex-col gap-2 py-4 text-sm">
            <Link href="/verify" className="btn-outline w-full justify-center" onClick={() => setOpen(false)}>Check a certificate</Link>
            {dashboardHref ? (
              <Link href={dashboardHref} className="btn-accent w-full justify-center" onClick={() => setOpen(false)}>Go to dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-outline w-full justify-center" onClick={() => setOpen(false)}>Sign in</Link>
                <Link href="/register" className="btn-accent w-full justify-center" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
            <Link href="/report?type=complaint" className="btn-ghost w-full justify-center" onClick={() => setOpen(false)}>Complain about a shop</Link>
            <InstallPWA className="btn-ghost w-full justify-center" />
          </nav>
        </div>
      )}
    </header>
  );
}
