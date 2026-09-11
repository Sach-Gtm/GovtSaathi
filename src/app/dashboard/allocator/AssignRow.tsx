"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { allocate, unassign } from "./actions";

interface OfficerRow {
  id: string;
  full_name: string;
  role: "officer" | "gatc";
  organisation: string | null;
  employee_code: string | null;
  state_code: string | null;
  openJobs: number;
}

export function AssignRow({
  applicationId,
  appState,
  officers,
  assigned
}: {
  applicationId: string;
  appState: string | null;
  officers: OfficerRow[];
  assigned?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Rank: same state first, then lightest workload, then name.
  const ranked = useMemo(() => {
    return [...officers].sort((a, b) => {
      const sa = a.state_code === appState ? 0 : 1;
      const sb = b.state_code === appState ? 0 : 1;
      if (sa !== sb) return sa - sb;
      if (a.openJobs !== b.openJobs) return a.openJobs - b.openJobs;
      return a.full_name.localeCompare(b.full_name);
    });
  }, [officers, appState]);

  const [assignee, setAssignee] = useState<string>(ranked[0]?.id ?? "");
  const [date, setDate] = useState("");

  const best = ranked[0];
  const chosen = ranked.find((o) => o.id === assignee);

  function run(fn: () => Promise<any>) {
    setErr(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setErr(res.error);
      else router.refresh();
    });
  }

  if (!officers?.length) return <span className="text-xs text-ink/60">No officers on record.</span>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <select className="field-select w-56 text-xs" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          {ranked.map((o) => (
            <option key={o.id} value={o.id}>
              {o.full_name} · {o.role.toUpperCase()} · {o.state_code ?? "—"} · open {o.openJobs}
              {o.state_code === appState ? " ✓" : ""}
            </option>
          ))}
        </select>
        <input type="date" className="field-input w-36 text-xs" value={date} onChange={(e) => setDate(e.target.value)} />
        <button
          disabled={pending || !assignee}
          onClick={() => run(() => allocate({ applicationId, assigneeId: assignee, scheduledFor: date || null }))}
          className="btn-primary text-xs"
        >
          {pending ? "…" : assigned ? "Reassign" : "Assign"}
        </button>
        {assigned && (
          <button
            disabled={pending}
            onClick={() => run(() => unassign({ applicationId }))}
            className="btn-outline text-xs"
          >
            Unassign
          </button>
        )}
      </div>
      <div className="text-[11px] text-ink/50">
        {best && chosen?.id === best.id && best.state_code === appState ? (
          <span className="text-accent">Best match — same state, lightest load</span>
        ) : chosen && chosen.state_code !== appState ? (
          <span className="text-warning">Out of state ({chosen.state_code ?? "—"})</span>
        ) : (
          <span>Ranked by state match &amp; workload</span>
        )}
      </div>
      {err && <span className="text-xs text-danger">{err}</span>}
    </div>
  );
}
