import Link from "next/link";
import { requireProfile } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RequestAccess } from "@/components/dashboard/RequestAccess";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — MAAPSETU" };

export default async function CitizenHome() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("requested_role").eq("id", profile.id).maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Welcome</h1>
        <p className="mt-1 text-ink/70">You are signed in. You can look up any certificate for free, or ask for department access.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="font-display text-lg font-semibold">Check a certificate</div>
          <p className="mt-2 text-sm text-ink/70">
            Scan the QR sticker on any weighing or measuring instrument, or enter the certificate number.
          </p>
          <Link href="/verify" className="btn-primary mt-4 inline-flex">Open the verifier</Link>
        </div>

        <RequestAccess currentRequest={data?.requested_role} />
      </div>

      <div className="card p-6">
        <div className="font-display text-lg font-semibold">Run a shop?</div>
        <p className="mt-2 text-sm text-ink/70">
          If you own a shop with weighing scales, dispensers, weighbridges or any measuring device used in
          trade, you can register as a shop owner to apply for verification.
        </p>
        <p className="mt-2 text-xs text-ink/60">
          Contact the department to switch your account to a shop-owner account.
        </p>
      </div>
    </div>
  );
}
