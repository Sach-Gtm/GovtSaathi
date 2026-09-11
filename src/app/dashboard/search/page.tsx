import Link from "next/link";
import { requireProfile } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search records — MAAPSETU" };

// Keep only characters safe inside a PostgREST filter value.
const clean = (s: string) => s.replace(/[^a-zA-Z0-9 _\-/.]/g, "").trim().slice(0, 60);

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireProfile();
  const supabase = createSupabaseServerClient();
  const q = clean(searchParams.q ?? "");
  const like = `%${q}%`;

  let certs: any[] = [];
  let apps: any[] = [];
  let instruments: any[] = [];
  let businesses: any[] = [];

  if (q.length >= 2) {
    const [c, a, i, b] = await Promise.all([
      supabase.from("certificates").select("id, certificate_no, valid_until, revoked, business:businesses(legal_name, trade_name), instrument:instruments(category, serial_no)").ilike("certificate_no", like).limit(12),
      supabase.from("applications").select("id, application_no, status, created_at, business:businesses(legal_name, trade_name)").ilike("application_no", like).limit(12),
      supabase.from("instruments").select("id, category, serial_no, make, model, next_due_on, business:businesses(legal_name, trade_name)").ilike("serial_no", like).limit(12),
      supabase.from("businesses").select("id, legal_name, trade_name, city, state_code").or(`legal_name.ilike.${like},trade_name.ilike.${like}`).limit(12)
    ]);
    certs = c.data ?? [];
    apps = a.data ?? [];
    instruments = i.data ?? [];
    businesses = b.data ?? [];
  }

  const total = certs.length + apps.length + instruments.length + businesses.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Search records</h1>
        <p className="mt-1 text-sm text-ink/70">
          Find certificates, applications, instruments and businesses. Results are limited to what your role
          is allowed to see.
        </p>
      </div>

      <form action="/dashboard/search" method="get" className="card p-4">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Certificate no., application no., serial number, business name…"
            className="field-input"
          />
          <button className="btn-primary">Search</button>
        </div>
      </form>

      {q.length >= 2 && (
        <div className="text-sm text-ink/60">{total} result{total === 1 ? "" : "s"} for “{q}”</div>
      )}

      {certs.length > 0 && (
        <Group title="Certificates">
          {certs.map((c) => (
            <Link key={c.id} href={`/dashboard/certificate/${c.id}`} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-brand-soft/30">
              <div>
                <div className="font-mono text-sm">{c.certificate_no}</div>
                <div className="text-xs text-ink/60">{c.business?.trade_name ?? c.business?.legal_name} · {c.instrument?.category?.replace(/_/g, " ")}</div>
              </div>
              {c.revoked ? <Badge variant="danger">Revoked</Badge> : new Date(c.valid_until) < new Date() ? <Badge variant="warning">Expired</Badge> : <Badge variant="success">Valid</Badge>}
            </Link>
          ))}
        </Group>
      )}

      {apps.length > 0 && (
        <Group title="Applications">
          {apps.map((a) => (
            <Link key={a.id} href={`/dashboard/trader/applications/${a.id}`} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-brand-soft/30">
              <div>
                <div className="font-mono text-sm">{a.application_no}</div>
                <div className="text-xs text-ink/60">{a.business?.trade_name ?? a.business?.legal_name} · filed {formatDate(a.created_at)}</div>
              </div>
              <span className="text-xs uppercase tracking-wide text-ink/50">{a.status.replace(/_/g, " ")}</span>
            </Link>
          ))}
        </Group>
      )}

      {instruments.length > 0 && (
        <Group title="Instruments">
          {instruments.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <div className="text-sm font-medium">{i.category?.replace(/_/g, " ")} · <span className="font-mono">{i.serial_no ?? "—"}</span></div>
                <div className="text-xs text-ink/60">{[i.make, i.model].filter(Boolean).join(" ") || "—"} · {i.business?.trade_name ?? i.business?.legal_name}</div>
              </div>
              <div className="text-xs text-ink/50">due {formatDate(i.next_due_on)}</div>
            </div>
          ))}
        </Group>
      )}

      {businesses.length > 0 && (
        <Group title="Businesses">
          {businesses.map((b) => (
            <div key={b.id} className="rounded-lg border border-border px-4 py-3">
              <div className="text-sm font-medium">{b.trade_name ?? b.legal_name}</div>
              <div className="text-xs text-ink/60">{b.legal_name}{b.city ? ` · ${b.city}` : ""}{b.state_code ? `, ${b.state_code}` : ""}</div>
            </div>
          ))}
        </Group>
      )}

      {q.length >= 2 && total === 0 && (
        <div className="card p-8 text-center text-ink/60">No records matched “{q}”. Try a certificate or application number, or a serial number.</div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink/50">{title}</div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
