# GovtSathi

Online verification and certification system for weighing and measuring instruments under India's Legal Metrology Act, 2009. Built for **Smart India Hackathon 2026 — SIH26036 (Department of Consumer Affairs)** by Team Codebit.

Traders, Legal Metrology Officers, Government Approved Test Centres (GATCs), allocators and citizens on one traceable rail.

## What's inside

- **Trader flow** — self-registration, businesses, instruments, application for verification / re-verification, certificate view.
- **Officer / GATC flow** — accept assigned jobs, capture observations offline on the field device, sync when back online.
- **Allocator flow** — application queue, assignment by district & instrument class, officer & GATC roster.
- **Admin flow** — pendency dashboard, audit log, users.
- **Public verifier** — `/verify` and `/verify/[cert]` — anyone can look up any certificate. The QR embeds an Ed25519 signature so scanners can validate offline too.
- **Cross-state records** — `state_code` on applications, businesses and instruments; RBAC & RLS scoped accordingly.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Supabase** (Postgres, Auth, Storage, RLS) — Mumbai region
- **Dexie** for on-device offline queue
- **Ed25519** (Node crypto) for certificate & QR signatures
- **Tailwind CSS** with a lightweight design system

## Repository layout

```
src/
  app/
    (landing, /login, /register)
    verify/, verify/[cert]/       # public certificate lookup
    dashboard/                    # role-scoped app shell
      trader/                     # applications, businesses, instruments, certificates
      officer/                    # jobs, offline-first workspace, history
      allocator/                  # queue, officers roster
      admin/                      # overview, audit, users
    api/
      sync/verifications          # officer device -> server
      sync/photos                 # field photo upload
      verify/[cert]               # JSON verifier for scanners
      health
  lib/
    supabase/                     # browser, server, service clients
    offline/                      # Dexie DB + sync drainer
    rbac.ts, audit.ts, signature.ts, qr.ts, utils.ts
supabase/
  migrations/0001_initial_schema.sql
  migrations/0002_storage.sql
  seed.sql
scripts/
  generate-signing-key.js
```

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy the environment template**
   ```bash
   cp .env.example .env.local
   ```
3. **Provision Supabase** — see the manual steps below.
4. **Generate the certificate signing key**
   ```bash
   node scripts/generate-signing-key.js
   ```
   Paste the two lines it prints into `.env.local`.
5. **Run**
   ```bash
   npm run dev
   ```

## Manual steps you need to do

The scaffold is complete but a few things live outside the code and cannot be committed to the repo. Do these once per environment.

1. **Create a Supabase project** in the Mumbai region.
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
2. **Run the migrations** — in Supabase SQL Editor, run in order:
   1. `supabase/migrations/0001_initial_schema.sql`
   2. `supabase/migrations/0002_storage.sql`
   3. `supabase/seed.sql` (adds reference states & districts)
3. **Auth settings** in Supabase dashboard → Authentication → Providers:
   - Enable **Email** provider.
   - (Optional) turn off email confirmation for local dev.
   - Add `http://localhost:3000` and your production URL to **Site URL / Redirect URLs**.
4. **Storage** — the migration creates the `verification-photos` bucket. Verify it exists in the Storage tab.
5. **Bootstrap the first admin** — Supabase creates every new user as `citizen`. To promote yourself:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
   Run in the SQL editor.
6. **Generate the signing key** and set both `GOVT_SIGNING_PRIVATE_KEY` and `GOVT_SIGNING_PUBLIC_KEY` in `.env.local` (and in your deploy environment). The private key never leaves the server; the QR-embedded signature is verified with the public key by field scanners.
7. **Set `NEXT_PUBLIC_APP_URL`** to your deployed URL (`https://govtsathi.example.gov.in` in prod). It goes into the QR fallback URL.
8. **Deploy target** — Vercel is the default; any Node 18+ host that supports Next.js works. Set the same environment variables in the deploy platform's project settings.
9. **Officer / GATC accounts** — after they self-register (or the admin invites them), promote them via SQL or the Users page:
   ```sql
   update profiles set role = 'officer', state_code = 'MH', employee_code = 'LM-MH-0442' where email = 'officer@lm.gov.in';
   ```

## Role permissions (short version)

|                             | citizen | trader | officer / gatc | allocator | admin |
|-----------------------------|:---:|:---:|:---:|:---:|:---:|
| Public certificate lookup   | ✓ | ✓ | ✓ | ✓ | ✓ |
| Own applications & certs    |   | ✓ |   |   |   |
| Assigned jobs & field record|   |   | ✓ |   |   |
| Allocate applications       |   |   |   | ✓ | ✓ |
| Users, audit log            |   |   |   |   | ✓ |

RLS enforces all of the above at the database, not just the UI.

## The four things beyond the department's brief

1. **A certificate that proves itself.** The QR on the sticker carries an Ed25519 signature over the canonical certificate identity, so a scan validates offline against the public key.
2. **A field app for no signal.** Officers cache the day's jobs in IndexedDB (Dexie), record every observation locally, and drain the queue when connectivity returns. Sync is idempotent on `local_id`.
3. **Records that cross borders.** Every application, business and instrument carries `state_code`; instruments that move state re-verify with the new jurisdiction, but the audit trail stays continuous.
4. **A written architecture.** This README, the SQL schema, the RLS policy set and the audit log form the artefact the brief asked for.

## Attribution

Team Codebit · Smart India Hackathon 2026 · SIH26036 · Department of Consumer Affairs, Government of India.
