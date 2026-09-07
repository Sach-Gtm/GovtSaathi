"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "trader",
          organisation,
          phone
        }
      }
    });
    setPending(false);
    if (error) {
      setMsg({ type: "err", text: error.message });
      return;
    }
    if (data.user && !data.session) {
      setMsg({ type: "ok", text: "Check your email to confirm your account." });
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full name">
        <input required className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>
      <Field label="Business / organisation name" hint="Legal name or trade name — what appears above your shop.">
        <input required className="field-input" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email">
          <input type="email" required autoComplete="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mobile">
          <input type="tel" inputMode="tel" pattern="[0-9+ ]{7,}" className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <Field label="Password" hint="Minimum 8 characters.">
        <input type="password" required minLength={8} autoComplete="new-password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {msg && (
        <div className={`rounded-md border px-3 py-2 text-sm ${
          msg.type === "err"
            ? "border-danger/30 bg-danger/5 text-danger"
            : "border-success/30 bg-success/5 text-success"
        }`}>
          {msg.text}
        </div>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? "Creating account…" : "Create trader account"}
      </button>
    </form>
  );
}
