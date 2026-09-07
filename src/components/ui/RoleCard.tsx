export interface Role {
  tag: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  accent: string;
}

export function RoleCard({ role, index }: { role: Role; index: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-canvas p-6 shadow-card transition-transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Accent orb */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-70 blur-2xl transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at center, ${role.accent} 0%, transparent 70%)` }}
        aria-hidden
      />
      <div className="relative flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ backgroundColor: `${role.accent}22`, color: role.accent }}
        >
          {role.icon}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: role.accent }}>
          {role.tag}
        </div>
      </div>
      <div className="mt-4 font-display text-xl font-semibold leading-tight">{role.title}</div>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{role.body}</p>
    </div>
  );
}

export const TraderIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 8 L6 4 H18 L20 8 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M6 8 V20 H18 V8" stroke="currentColor" strokeWidth="1.6" />
    <rect x="10" y="12" width="4" height="8" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
export const OfficerIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 12 L11 14 L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
export const AllocatorIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 6 L9 4 L15 6 L20 4 V18 L15 20 L9 18 L4 20 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 4 V18 M15 6 V20" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
export const CitizenIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="9" y="7" width="6" height="6" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);
