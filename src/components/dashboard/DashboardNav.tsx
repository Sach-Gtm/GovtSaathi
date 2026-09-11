"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface DashNavItem {
  href: string;
  label: string;
}

function Icon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const p = (d: string) => <path d={d} stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  let body: React.ReactNode;
  if (l.includes("overview")) body = <>{p("M4 13h7V4H4zM13 20h7v-9h-7zM13 4v4h7V4zM4 20h7v-4H4z")}</>;
  else if (l.includes("field") || l.includes("map")) body = <>{p("M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z")}<circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.7" fill="none" /></>;
  else if (l.includes("watchlist") || l.includes("complaint")) body = <>{p("M12 3l9 16H3zM12 10v4")}<circle cx="12" cy="16.5" r="0.6" fill="currentColor" /></>;
  else if (l.includes("audit")) body = <>{p("M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6zM9 12l2 2 4-4")}</>;
  else if (l.includes("user") || l.includes("officer")) body = <><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" fill="none" />{p("M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 0 0 0-6M20.5 20a5.5 5.5 0 0 0-4-5.3")}</>;
  else if (l.includes("business")) body = <>{p("M4 9l2-5h12l2 5M5 9v11h14V9M10 20v-6h4v6")}</>;
  else if (l.includes("instrument")) body = <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" fill="none" />{p("M12 12l4-3")}</>;
  else if (l.includes("certificate")) body = <>{p("M6 3h9l3 3v9H6zM9 19l3-2 3 2v-4H9z")}</>;
  else if (l.includes("history")) body = <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" fill="none" />{p("M12 8v4l3 2")}</>;
  else if (l.includes("queue") || l.includes("job")) body = <>{p("M4 6h16M4 12h16M4 18h10")}</>;
  else body = <>{p("M4 6h16M4 12h16M4 18h16")}</>;
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">{body}</svg>;
}

export function DashboardNav({ items }: { items: DashNavItem[] }) {
  const path = usePathname();
  const active = (href: string) =>
    path === href || (href !== "/dashboard" && path.startsWith(href + "/")) || path === href;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block space-y-1 text-sm">
        {items.map((n) => {
          const on = active(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                on ? "bg-brand-soft font-semibold text-brand-dark" : "text-ink/70 hover:bg-brand-soft/50 hover:text-brand"
              }`}
            >
              <Icon label={n.label} />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile: horizontal scroll chips */}
      <nav className="-mx-4 overflow-x-auto px-4 lg:hidden" aria-label="Dashboard sections">
        <div className="flex w-max gap-2 pb-1">
          {items.map((n) => {
            const on = active(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  on ? "border-brand bg-brand text-white" : "border-border bg-canvas text-ink/70"
                }`}
              >
                <Icon label={n.label} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
