"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CaptureMeta {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  takenAt: string; // ISO
}

/**
 * In-app camera capture for field evidence. Photos are taken live inside the app
 * only — there is no gallery/file picker — and each frame is stamped with the
 * date-time and GPS location before it is handed back, so evidence is verifiably
 * captured on site. Uses getUserMedia; the burned-in stamp travels with the JPEG.
 */
export function CameraCapture({
  onCapture,
  context,
  count = 0
}: {
  onCapture: (file: File, meta: CaptureMeta) => void;
  context?: { appNo?: string; place?: string };
  count?: number;
}) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [geo, setGeo] = useState<CaptureMeta>({ lat: null, lng: null, accuracy: null, takenAt: "" });
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (watchRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation?.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setReady(false);
  }, []);

  const launch = async () => {
    setErr("");
    setOpen(true);
    // start watching location
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (p) => setGeo((g) => ({ ...g, lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy })),
        () => setErr("Location is off. Turn on GPS for a valid on-site stamp."),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setReady(true);
    } catch (e: any) {
      setErr(
        e?.name === "NotAllowedError"
          ? "Camera permission was blocked. Allow it to capture on-site evidence."
          : "Could not open the camera on this device."
      );
    }
  };

  const close = () => {
    stop();
    setOpen(false);
  };

  useEffect(() => () => stop(), [stop]);

  const shoot = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return;
    const w = v.videoWidth;
    const h = v.videoHeight;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0, w, h);

    const takenAt = new Date();
    const meta: CaptureMeta = { ...geo, takenAt: takenAt.toISOString() };

    // ── burn watermark ──────────────────────────────────────────────
    const pad = Math.round(w * 0.02);
    const fs = Math.max(16, Math.round(w * 0.022));
    const lines = [
      `${takenAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" })} IST`,
      geo.lat != null && geo.lng != null
        ? `GPS ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}  ±${Math.round(geo.accuracy ?? 0)}m`
        : "GPS: location unavailable",
      [context?.appNo ? `App ${context.appNo}` : null, context?.place].filter(Boolean).join("  ·  ")
    ].filter(Boolean) as string[];

    const bandH = pad * 2 + lines.length * fs * 1.4 + fs * 1.6;
    const grad = ctx.createLinearGradient(0, h - bandH, 0, h);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.35, "rgba(0,0,0,0.55)");
    grad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - bandH, w, bandH);

    // brand line
    ctx.textBaseline = "top";
    ctx.font = `700 ${Math.round(fs * 1.1)}px system-ui, sans-serif`;
    ctx.fillStyle = "#3DD68C";
    ctx.fillText("MAAPSETU", pad, h - bandH + pad);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `600 ${Math.round(fs * 0.8)}px system-ui, sans-serif`;
    ctx.fillText("Legal Metrology · verified on-site capture", pad + ctx.measureText("MAAPSETU ").width + 6, h - bandH + pad + fs * 0.3);

    ctx.font = `500 ${fs}px system-ui, sans-serif`;
    ctx.fillStyle = "#ffffff";
    let y = h - bandH + pad + fs * 1.7;
    for (const ln of lines) {
      ctx.fillText(ln, pad, y);
      y += fs * 1.4;
    }

    c.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file, meta);
        setFlash(true);
        setTimeout(() => setFlash(false), 160);
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <>
      <button type="button" onClick={launch} className="btn-primary w-full justify-center sm:w-auto">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-1">
          <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        {count > 0 ? "Capture another photo" : "Open camera to capture"}
      </button>
      <p className="mt-1.5 text-xs text-ink/50">
        In-app capture only — no gallery uploads. Each photo is stamped with the date, time and GPS.
      </p>

      {open && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="On-site camera">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="text-sm">
              <div className="font-semibold">On-site evidence</div>
              <div className="text-white/60">
                {geo.lat != null ? `GPS ±${Math.round(geo.accuracy ?? 0)}m locked` : "Acquiring GPS…"}
                {count > 0 ? ` · ${count} taken` : ""}
              </div>
            </div>
            <button onClick={close} className="rounded-full bg-white/15 px-4 py-1.5 text-sm">Done</button>
          </div>

          <div className="relative flex-1">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {flash && <div className="absolute inset-0 bg-white/80" aria-hidden />}
            {/* live stamp preview */}
            <div className="pointer-events-none absolute inset-x-0 bottom-24 px-4">
              <div className="mx-auto max-w-md rounded-lg bg-black/55 px-3 py-2 text-xs text-white backdrop-blur">
                <span className="font-semibold text-[#3DD68C]">MAAPSETU</span>{" "}
                {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                {geo.lat != null ? `${geo.lat.toFixed(5)}, ${geo.lng!.toFixed(5)}` : "location…"}
              </div>
            </div>
          </div>

          {err && <p className="bg-danger/90 px-4 py-2 text-center text-sm text-white">{err}</p>}

          <div className="flex items-center justify-center gap-6 p-6">
            <button
              onClick={shoot}
              disabled={!ready}
              aria-label="Take photo"
              className="grid h-18 w-18 place-items-center rounded-full bg-white ring-4 ring-white/40 disabled:opacity-40"
              style={{ height: 72, width: 72 }}
            >
              <span className="h-14 w-14 rounded-full border-4 border-black/80" />
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
