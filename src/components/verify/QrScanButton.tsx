"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * In-page QR scanner using the native BarcodeDetector API + the device camera.
 * No third-party library, no upload. Falls back to a short note where the API
 * is unavailable (there the NFC tap or typed number is used instead).
 */
export function QrScanButton() {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "BarcodeDetector" in window &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const extractCert = (raw: string): string | null => {
    const s = (raw || "").trim();
    if (!s) return null;
    try {
      if (s.includes("/verify/")) return decodeURIComponent(s.split("/verify/")[1].split(/[?#]/)[0]);
      if (/^https?:/i.test(s)) {
        const u = new URL(s);
        const q = u.searchParams.get("q");
        if (q) return q;
        const parts = u.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || null;
      }
    } catch {
      /* ignore */
    }
    return s;
  };

  const launch = async () => {
    setErr("");
    setOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(v);
          if (codes && codes.length) {
            const cert = extractCert(codes[0].rawValue);
            if (cert) {
              stop();
              setOpen(false);
              router.push(`/verify/${encodeURIComponent(cert)}`);
              return;
            }
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setErr(
        e?.name === "NotAllowedError"
          ? "Camera permission was blocked. Allow it, or type the number below."
          : "Could not open the camera. Type the number below instead."
      );
    }
  };

  const close = () => {
    stop();
    setOpen(false);
  };

  useEffect(() => () => stop(), []);

  if (supported === null) return <div className="h-[52px]" aria-hidden />;

  if (!supported) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper/60 p-4 text-sm text-ink/60">
        Open your phone’s <span className="font-medium text-ink/80">camera app</span> and point it at the QR
        sticker — it opens this page automatically. Or type the number below.
      </div>
    );
  }

  return (
    <>
      <button onClick={launch} className="btn-primary w-full justify-center py-3 text-base">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-1">
          <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Scan the QR with camera
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="QR scanner">
          <div className="flex items-center justify-between p-4 text-white">
            <span className="font-display text-lg">Point at the QR sticker</span>
            <button onClick={close} className="rounded-full bg-white/15 px-4 py-1.5 text-sm">Close</button>
          </div>
          <div className="relative flex-1">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {/* scan frame */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="relative h-64 w-64 max-w-[80vw]">
                <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-lg border-l-4 border-t-4 border-accent" />
                <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-lg border-r-4 border-t-4 border-accent" />
                <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-lg border-b-4 border-l-4 border-accent" />
                <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-lg border-b-4 border-r-4 border-accent" />
              </div>
            </div>
          </div>
          <p className="p-4 text-center text-sm text-white/70">Hold steady — it reads automatically.</p>
        </div>
      )}

      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
    </>
  );
}
