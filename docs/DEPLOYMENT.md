# MAAPSETU — Deployment Runbook

## 1. Prerequisites

- Node.js 18+ and npm
- A Supabase project (recommended region: **Mumbai / ap-south-1**)
- A Vercel project (or any Node host) for the Next.js app

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only, never exposed
NEXT_PUBLIC_APP_URL=https://<your-domain>        # used in QR + email links
GOVT_SIGNING_PRIVATE_KEY=<base64 32-byte seed>   # see step 4
GOVT_SIGNING_PUBLIC_KEY=<base64 32-byte pubkey>
```

> `NEXT_PUBLIC_*` values are inlined at **build time** — set them before
> `next build`, not only at runtime.

## 3. Database migrations (run in order)

Apply the SQL files in `supabase/migrations/` in numeric order via the Supabase
SQL editor or CLI:

| File | Adds |
|---|---|
| `0001_initial_schema.sql` | Core tables, enums, RLS, `verify_certificate` RPC, signup trigger |
| `0002_storage.sql` | `verification-photos` private bucket + policies |
| `0003_field_ops.sql` | Shop geo, route/check-in columns, `field_plan_today` view |
| `0004_scans_complaints.sql` | `certificate_scans`, `complaints`, `feedback`, `cert_scan_stats` |
| `0005_access_requests.sql` | Access requests + role-change guard trigger |
| `0006_documents.sql` | `documents` table + `documents` private bucket (supporting docs) |
| `0007_gatc_centres.sql` | `gatc_centres` registry + `profiles.gatc_centre_id`, accreditation validity |
| `0008_tolerances.sql` | `tolerances` MPE reference for automatic pass/fail |
| `0009_notifications.sql` | `notifications` table (in-app alerts + reminder ledger) |

Then seed reference data (`supabase/seed.sql`) for states/districts and demo
rows.

With the Supabase CLI:

```bash
supabase link --project-ref <ref>
supabase db push          # applies migrations
psql "$DATABASE_URL" -f supabase/seed.sql
```

## 4. Generate the certificate signing key

```bash
node scripts/generate-signing-key.js
# prints GOVT_SIGNING_PRIVATE_KEY and GOVT_SIGNING_PUBLIC_KEY — put them in env
```

Keep the private key server-side only (Vercel encrypted env / Supabase secrets).
Rotating it invalidates offline verification of previously issued QRs unless the
old public key is retained for verification.

## 5. Build & run

```bash
npm install
npm run build
npm start           # or deploy to Vercel
```

Local development: `npm run dev` (http://localhost:3000).
Checks: `npm run lint`, `npm run typecheck`.

## 6. Storage buckets

Migrations create the buckets, but verify in Supabase → Storage that
`verification-photos` and `documents` exist and are **private**. The app never
serves these publicly — it mints short-lived signed URLs.

## 7. PWA / field app

The service worker (`public/sw.js`, registered by `components/ui/RegisterSW.tsx`)
and `public/manifest.webmanifest` make the officer app installable and
offline-capable. No extra build step; ship the `public/` assets as-is.

## 8. Automated expiry reminders (cron)

The route `GET /api/cron/reminders` scans `instruments.next_due_on` and
`certificates.valid_until`, and creates a notification for the owner once per
escalation window (30d → 15d → 7d → overdue), de-duplicated by `dedupe_key`.

- Set **`CRON_SECRET`** in env. The route rejects any request without
  `Authorization: Bearer $CRON_SECRET` (or an `x-cron-secret` header).
- On **Vercel**, `vercel.json` already schedules it daily at 03:00 UTC; Vercel
  injects the `Authorization: Bearer $CRON_SECRET` header automatically.
- On **Supabase** (`pg_cron` + `pg_net`) or any scheduler, call the URL daily
  with the same header.
- **Email (optional):** set `RESEND_API_KEY` and `RESEND_FROM` (a verified
  sender) to also email newly-created reminders. Without them, reminders are
  in-app only (bell + `/dashboard/notifications`).

Manual test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/reminders
# → {"ok":true,"scanned":N,"created":M,"emailed":K}
```

## 9. Post-deploy smoke test

1. Register a trader → file an application (with a supporting document).
2. As allocator, assign it (note the state-match / workload ranking).
3. As officer, accept → check-in (status moves to *in verification*) → record an
   instrument with an in-app photo → finish & sync.
4. Confirm a certificate is issued; open its printable page; scan the QR at
   `/verify/<cert_no>`.
5. Revoke it from the certificate page and confirm the public page shows
   *Revoked*.
6. Export a CSV from the admin overview / audit log.
