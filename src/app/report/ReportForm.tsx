"use client";
import { useState } from "react";
import { Field } from "@/components/ui/Field";

type Kind = "complaint" | "bug" | "service";

const TABS: { key: Kind; label: string; blurb: string }[] = [
  { key: "complaint", label: "Complain about a shop", blurb: "A scale looked wrong, there was no sticker, or you were short-changed." },
  { key: "service", label: "Ask for help", blurb: "A question about verifying, registering, or your application." },
  { key: "bug", label: "Report a problem with the site", blurb: "Something on this website did not work as expected." }
];

const CATEGORIES = [
  ["underweight", "The scale gives less than it should"],
  ["tampered", "The machine looks tampered with"],
  ["no_sticker", "No verification sticker at all"],
  ["expired", "The sticker is expired"],
  ["overcharge", "Charged for more than weighed"],
  ["other", "Something else"]
];

export function ReportForm({ initialType, certNo }: { initialType: Kind; certNo?: string }) {
  const [type, setType] = useState<Kind>(initialType);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ ref?: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shop, setShop] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("underweight");
  const [cert, setCert] = useState(certNo ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    try {
      const body: any = { type, message, subject, contact_email: email, page_url: typeof window !== "undefined" ? window.location.href : "" };
      if (type === "complaint") {
        Object.assign(body, { shop_name: shop, city, category, certificate_no: cert, contact_phone: phone });
      }
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setDone({ ref: data.ref });
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="card mt-8 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Thank you</h2>
        <p className="mt-2 text-ink/70">
          {type === "complaint"
            ? "Your complaint has reached the Legal Metrology team. An officer will review it."
            : "We have received your message and will look into it."}
        </p>
        {done.ref && (
          <p className="mt-3 text-sm">
            Your reference number: <span className="font-mono font-semibold">{done.ref}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="grid gap-2 sm:grid-cols-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`rounded-xl border p-3 text-left text-sm transition-colors ${
              type === t.key ? "border-brand bg-brand-soft" : "border-border bg-canvas hover:bg-paper"
            }`}
          >
            <div className="font-medium">{t.label}</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink/60">{TABS.find((t) => t.key === type)?.blurb}</p>

      <form onSubmit={submit} className="card mt-5 space-y-4 p-6">
        {type === "complaint" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Shop name or place" hint="Whatever you know — the signboard, the market.">
                <input className="field-input" value={shop} onChange={(e) => setShop(e.target.value)} placeholder="e.g. Sharma Vegetables, Andheri market" />
              </Field>
              <Field label="City / town">
                <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
            </div>
            <Field label="What went wrong?">
              <select className="field-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Certificate number on the sticker" hint="Optional — if there was a sticker with a number.">
              <input className="field-input font-mono" value={cert} onChange={(e) => setCert(e.target.value)} placeholder="LM-2026-XXXXXXXX" />
            </Field>
          </>
        )}

        {type !== "complaint" && (
          <Field label="Subject">
            <input className="field-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={type === "bug" ? "e.g. Verify page did not open" : "e.g. How do I add a second shop?"} />
          </Field>
        )}

        <Field label={type === "complaint" ? "Tell us what happened" : "Details"}>
          <textarea required className="field-textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={type === "complaint" ? "Describe what you saw. The more detail, the faster an officer can act." : "Please describe it clearly."} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your email" hint="Optional — so we can update you.">
            <input type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {type === "complaint" && (
            <Field label="Your phone" hint="Optional.">
              <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          )}
        </div>

        {err && <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{err}</div>}

        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Sending…" : type === "complaint" ? "Send complaint" : "Send"}
        </button>
      </form>
    </div>
  );
}
