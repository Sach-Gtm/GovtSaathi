import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

type StepState = "done" | "current" | "pending" | "skipped";

export interface WFAssignment {
  scheduled_for?: string | null;
  created_at?: string | null;
  accepted_at?: string | null;
  check_in_at?: string | null;
  completed_at?: string | null;
  assignee?: { full_name?: string | null; role?: string | null } | null;
}

interface Step {
  key: string;
  label: string;
  labelHi: string;
  state: StepState;
  at?: string | null;
  detail?: string;
  href?: string;
}

/**
 * The verification lifecycle, made visible. Every stage is derived from data
 * that already exists (applications.status, assignments timing, certificates) —
 * no schema change. This is the spine of the workflow the PS asks us to
 * emphasise: file → allocate → accept → on-site → verify & sign → certificate.
 */
export function WorkflowTimeline({
  status,
  submittedAt,
  assignment,
  certificate
}: {
  status: string;
  submittedAt?: string | null;
  assignment?: WFAssignment | null;
  certificate?: { id: string; certificate_no: string } | null;
}) {
  const rejected = status === "rejected";
  const cancelled = status === "cancelled";

  // ordinal progress of the happy path
  const order = ["draft", "submitted", "assigned", "in_verification", "verified"];
  const rank = Math.max(0, order.indexOf(status));

  const a = assignment ?? undefined;
  const has = (v: any) => v !== null && v !== undefined && v !== "";

  const steps: Step[] = [
    {
      key: "submitted",
      label: "Application filed",
      labelHi: "आवेदन दाखिल",
      at: submittedAt,
      state: has(submittedAt) || rank >= 1 ? "done" : "current"
    },
    {
      key: "allocated",
      label: "Verifier allocated",
      labelHi: "अधिकारी नियुक्त",
      at: a?.created_at ?? a?.scheduled_for,
      detail: a?.assignee?.full_name
        ? `${a.assignee.full_name}${a.assignee.role ? ` · ${String(a.assignee.role).toUpperCase()}` : ""}`
        : undefined,
      state: a ? "done" : rank >= 1 ? "current" : "pending"
    },
    {
      key: "accepted",
      label: "Visit accepted",
      labelHi: "दौरा स्वीकृत",
      at: a?.accepted_at,
      state: has(a?.accepted_at) ? "done" : a ? "current" : "pending"
    },
    {
      key: "checkin",
      label: "On-site check-in",
      labelHi: "मौके पर पहुँचे",
      at: a?.check_in_at,
      state: has(a?.check_in_at) ? "done" : has(a?.accepted_at) ? "current" : "pending"
    },
    {
      key: "verified",
      label: "Verified & digitally signed",
      labelHi: "सत्यापित व हस्ताक्षरित",
      at: a?.completed_at,
      state: has(a?.completed_at) || rank >= 4 ? "done" : has(a?.check_in_at) ? "current" : "pending"
    },
    {
      key: "certificate",
      label: "Certificate issued",
      labelHi: "प्रमाणपत्र जारी",
      at: undefined,
      href: certificate ? `/dashboard/certificate/${certificate.id}` : undefined,
      detail: certificate?.certificate_no,
      state: certificate ? "done" : rank >= 4 ? "current" : "pending"
    }
  ];

  if (rejected || cancelled) {
    // mark everything after the last done as skipped, add a terminal node
    let seenPending = false;
    for (const s of steps) {
      if (s.state !== "done") {
        s.state = "skipped";
        seenPending = true;
      }
    }
    if (seenPending) void 0;
    steps.push({
      key: "terminal",
      label: rejected ? "Application rejected" : "Application cancelled",
      labelHi: rejected ? "आवेदन अस्वीकृत" : "आवेदन रद्द",
      state: "current"
    });
  }

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">Verification workflow</div>
        <span className="text-xs uppercase tracking-wide text-ink/50">status: {status.replace(/_/g, " ")}</span>
      </div>
      <ol className="relative">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const color =
            s.key === "terminal"
              ? rejected || cancelled
                ? "#D14343"
                : "#0E7A4B"
              : s.state === "done"
              ? "#0E7A4B"
              : s.state === "current"
              ? "#0B2E6F"
              : s.state === "skipped"
              ? "#B8B3A4"
              : "#C9C4B4";
          return (
            <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!last && (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5"
                  style={{ background: s.state === "done" ? "#0E7A4B" : "#E3E0D4" }}
                  aria-hidden
                />
              )}
              <span
                className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white"
                style={{ background: color }}
              >
                {s.state === "done" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : s.state === "current" ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </span>
              <div className="pt-0.5">
                <div className={`font-medium ${s.state === "pending" || s.state === "skipped" ? "text-ink/45" : "text-ink"}`}>
                  {s.href ? (
                    <Link href={s.href} className="text-brand hover:underline">{s.label} →</Link>
                  ) : (
                    s.label
                  )}
                  <span className="ml-2 text-xs text-ink/40">{s.labelHi}</span>
                </div>
                {s.detail && <div className="text-sm text-ink/60">{s.detail}</div>}
                {s.at && <div className="text-xs text-ink/45">{formatDateTime(s.at)}</div>}
                {s.state === "current" && !s.at && s.key !== "terminal" && (
                  <div className="text-xs text-brand">In progress…</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
