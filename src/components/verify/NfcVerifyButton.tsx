"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "scanning" | "found" | "error";

/**
 * "Tap to verify" using the Web NFC API (NDEFReader). This uses the phone's own
 * built-in NFC radio — no external reader, no extra hardware or cost. Supported
 * on Android Chrome/Edge; on any other device the component shows a short note
 * and the page's QR + typed-code paths take over.
 */
export function NfcVerifyButton() {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "NDEFReader" in window);
    return () => ctrl.current?.abort();
  }, []);

  const extractCert = (raw: string): string | null => {
    const s = (raw || "").trim();
    if (!s) return null;
    try {
      if (s.includes("/verify/")) return decodeURIComponent(s.split("/verify/")[1].split(/[?#]/)[0]);
      if (s.includes("q=")) {
        const u = new URL(s, window.location.origin);
        const q = u.searchParams.get("q");
        if (q) return q;
      }
      if (/^https?:/i.test(s)) {
        const parts = new URL(s).pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || null;
      }
    } catch {
      /* fall through to raw */
    }
    return s;
  };

  const start = async () => {
    setState("scanning");
    setMsg("Hold the top of your phone against the sticker…");
    try {
      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();
      const controller = new AbortController();
      ctrl.current = controller;
      await ndef.scan({ signal: controller.signal });

      ndef.onreadingerror = () => {
        setState("error");
        setMsg("Could not read the tag. Try again, or use the QR code below.");
      };
      ndef.onreading = (event: any) => {
        const dec = new TextDecoder();
        let cert: string | null = null;
        for (const rec of event.message.records) {
          try {
            const text = dec.decode(rec.data);
            cert = extractCert(text) || cert;
          } catch {
            /* ignore this record */
          }
          if (cert) break;
        }
        if (cert) {
          setState("found");
          setMsg("Verified tag found — opening the certificate…");
          controller.abort();
          router.push(`/verify/${encodeURIComponent(cert)}`);
        } else {
          setState("error");
          setMsg("That tag does not carry a certificate. Use the QR code below.");
        }
      };
    } catch (e: any) {
      setState("error");
      if (e?.name === "NotAllowedError") setMsg("Please allow NFC access, then tap again.");
      else if (e?.name === "NotSupportedError") setMsg("NFC is turned off. Switch it on in settings, or use the QR code.");
      else setMsg("NFC could not start. Use the QR code below instead.");
    }
  };

  if (supported === null) return <div className="h-[92px]" aria-hidden />;

  if (!supported) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper/60 p-4 text-sm text-ink/60">
        <span className="font-medium text-ink/80">Tap-to-verify (NFC)</span> works on most Android phones. On this
        device, use the camera QR scan or type the number — both work the same way.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/[0.06] p-4">
      <button
        onClick={start}
        disabled={state === "scanning" || state === "found"}
        className="flex w-full items-center gap-4 text-left disabled:cursor-progress"
      >
        <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-white">
          {(state === "scanning" || state === "found") && (
            <span className="nfc-pulse absolute inset-0 rounded-full bg-accent/50" aria-hidden />
          )}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 8c5-3 11-3 16 0M6.5 11.5c3.2-1.8 7.8-1.8 11 0M9 15c1.8-1 4.2-1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="19" r="1.4" fill="currentColor" />
          </svg>
        </span>
        <span>
          <span className="block font-display text-lg font-semibold text-ink">
            {state === "scanning" ? "Ready — tap the sticker" : state === "found" ? "Opening…" : "Tap your phone to verify"}
          </span>
          <span className="block text-sm text-ink/60">
            {msg || "No camera needed. Works even if the printed QR has faded."}
          </span>
        </span>
      </button>
      {state === "error" && (
        <button onClick={start} className="btn-outline mt-3 w-full justify-center">Try the tap again</button>
      )}
    </div>
  );
}
