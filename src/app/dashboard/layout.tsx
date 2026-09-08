import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getSessionProfile, roleLabel, type UserRole } from "@/lib/rbac";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

interface NavItem {
  href: string;
  label: string;
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
      <div className="h-1 tricolor-bar" aria-hidden />
      <header className="border-b border-border bg-canvas">
        <div className="container-app flex items-center justify-between py-3">
          <Link href="/" aria-label="MAAPSETU home"><Logo /></Link>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:block text-right">
              <div className="font-medium">{profile.full_name}</div>
              <div className="text-xs text-ink/60">{roleLabel(profile.role)}</div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container-app grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="space-y-1 text-sm">
            {items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-md px-3 py-2 hover:bg-canvas hover:text-brand"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
