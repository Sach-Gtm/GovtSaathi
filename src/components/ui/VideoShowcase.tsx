"use client";
import { useRef, useState } from "react";

/**
 * Framed product video. Drop a file at /public/demo.mp4 (and optionally
 * /public/demo-poster.jpg) and it plays here. Until then, a branded
 * placeholder is shown so the section never looks broken.
 */
export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => setFailed(true));
  }

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Browser chrome */}
      <div className="overflow-hidden rounded-2xl border border-border bg-canvas shadow-card">
        <div className="flex items-center gap-2 border-b border-border bg-paper/60 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-danger/60" />
          <span className="h-3 w-3 rounded-full bg-warning/60" />
          <span className="h-3 w-3 rounded-full bg-success/60" />
          <span className="ml-3 truncate rounded-md bg-canvas px-3 py-1 text-xs text-ink/50">
            govt-saathi.vercel.app
          </span>
        </div>

        <div className="relative aspect-video bg-ink">
          {!failed && (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              controls={playing}
              playsInline
              preload="metadata"
              poster="/demo-poster.jpg"
              onError={() => setFailed(true)}
              onPlay={() => setPlaying(true)}
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          )}

          {/* Overlay play button / placeholder */}
          {!playing && (
            <button
              onClick={play}
              className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink/60 to-ink/80 text-white transition-opacity hover:opacity-95"
              aria-label="Play the demo"
            >
              <span className="flex flex-col items-center gap-4">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform hover:scale-105">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="text-center">
                  <span className="block font-display text-xl font-semibold">Watch how it works</span>
                  <span className="mt-1 block text-sm text-white/70">
                    {failed ? "Demo video coming soon" : "A two-minute walkthrough"}
                  </span>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Glow */}
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(11,95,255,0.25), transparent 60%)" }}
        aria-hidden
      />
    </div>
  );
}
