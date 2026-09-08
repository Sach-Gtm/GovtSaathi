"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { InstallPWA } from "./InstallPWA";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Auth state is detected on the client (reads the cached session, no blocking
 * network on the server) so the landing page can be fully static and fast.
 */
export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  const authButtons = (mobile = false) => {
    const w = mobile ? "w-full justify-center" : "";
    if (signedIn) {
      return <Link href="/dashboard" className={`btn-accent ${w}`} onClick={() => setOpen(false)}>Go to dashboard</Link>;
    }
    return (
      <>
        <Link href="/login" className={`btn-outline ${w}`} onClick={() => setOpen(false)}>Sign in</Link>
        <Link href="/register" className={`btn-accent ${w}`} onClick={() => setOpen(false)}>Register</Link>
      </>
    );
  };

  return (
    <header className="relative z-30 border-b border-transparent">
      <div className="container-app flex items-center justify-between py-3.5">
        <Link href="/" aria-label="MAAPSETU home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-2 text-sm md:flex">
          <Link href="/verify" className="btn-ghost">Check a certificate</Link>
          <InstallPWA className="btn-ghost" />
          {signedIn === null ? <span className="h-9 w-40" /> : authButtons()}
        </nav>

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

      {open && (
        <div className="border-b border-border bg-canvas md:hidden">
          <nav className="container-app flex flex-col gap-2 py-4 text-sm">
            <Link href="/verify" className="btn-outline w-full justify-center" onClick={() => setOpen(false)}>Check a certificate</Link>
            {signedIn !== null && authButtons(true)}
            <Link href="/report?type=complaint" className="btn-ghost w-full justify-center" onClick={() => setOpen(false)}>Complain about a shop</Link>
            <InstallPWA className="btn-ghost w-full justify-center" />
          </nav>
        </div>
      )}
    </header>
  );
}
