import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getSessionProfile, roleLabel, type UserRole } from "@/lib/rbac";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { DashboardNav, type DashNavItem } from "@/components/dashboard/DashboardNav";

interface NavItem extends DashNavItem {
  roles: UserRole[];
}

const NAV: NavItem[] = [
  { href: "/dashboard/trader", label: "My applications", roles: ["trader"] },
  { href: "/dashboard/trader/businesses", label: "Businesses", roles: ["trader"] },
  { href: "/dashboard/trader/instruments", label: "Instruments", roles: ["trader"] },
  { href: "/dashboard/trader/certificates", label: "Certificates", roles: ["trader"] },

  { href: "/dashboard/officer", label: "Today's jobs", roles: ["officer", "gatc"] },
  { href: "/dashboard/watchlist", label: "Watchlist & complaints", roles: ["officer", "gatc"] },
  { href: "/dashboard/officer/history", label: "Verification history", roles: ["officer", "gatc"] },

  { href: "/dashboard/allocator", label: "Application queue", roles: ["allocator"] },
  { href: "/dashboard/admin/field-ops", label: "Field operations", roles: ["allocator"] },
  { href: "/dashboard/watchlist", label: "Watchlist & complaints", roles: ["allocator"] },
  { href: "/dashboard/allocator/officers", label: "Officers & GATCs", roles: ["allocator"] },

  { href: "/dashboard/admin", label: "Overview", roles: ["admin"] },
  { href: "/dashboard/admin/field-ops", label: "Field operations", roles: ["admin"] },
  { href: "/dashboard/watchlist", label: "Watchlist & complaints", roles: ["admin"] },
  { href: "/dashboard/admin/audit", label: "Audit log", roles: ["admin"] },
  { href: "/dashboard/admin/users", label: "Users", roles: ["admin"] }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const items = NAV.filter((n) => n.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/95 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Link href="/" aria-label="MAAPSETU home"><Logo /></Link>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <div className="font-medium leading-tight">{profile.full_name}</div>
              <div className="text-xs text-ink/60">{roleLabel(profile.role)}</div>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft font-display text-sm font-semibold text-brand">
              {(profile.full_name || "?").trim().charAt(0).toUpperCase()}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container-app grid gap-8 py-6 lg:grid-cols-[228px_1fr] lg:py-8">
        <aside className="lg:sticky lg:top-[73px] lg:h-max">
          <DashboardNav items={items} />
        </aside>

        <main id="main" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
