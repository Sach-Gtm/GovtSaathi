"use client";
import { useRef, useState } from "react";

export interface VideoItem {
  src: string;
  poster?: string;
  title: string;
  caption: string;
}

/**
 * Framed product video with a tap-to-play overlay. Falls back to a branded
 * placeholder if the file is missing so the section never looks broken.
 */
export function VideoCard({ item, chrome = false }: { item: VideoItem; chrome?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => setFailed(true));
  }

  return (
    <figure className="group relative overflow-hidden rounded-2xl border border-border bg-canvas shadow-card">
      {chrome && (
        <div className="flex items-center gap-2 border-b border-border bg-paper/60 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-danger/60" />
          <span className="h-3 w-3 rounded-full bg-warning/60" />
          <span className="h-3 w-3 rounded-full bg-success/60" />
          <span className="ml-3 truncate rounded-md bg-canvas px-3 py-1 text-xs text-ink/50">govt-saathi.vercel.app</span>
        </div>
      )}

      <div className="relative aspect-video bg-ink">
        {!failed && (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            controls={playing}
            playsInline
            preload="metadata"
            poster={item.poster}
            onError={() => setFailed(true)}
            onPlay={() => setPlaying(true)}
            onEnded={() => setPlaying(false)}
          >
            <source src={item.src} type="video/mp4" />
          </video>
        )}

        {!playing && (
          <button
            onClick={play}
            className="absolute inset-0 grid place-items-center bg-gradient-to-t from-ink/85 via-ink/25 to-transparent text-white"
            aria-label={`Play: ${item.title}`}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-left">
              <div className="font-display text-lg font-semibold">{item.title}</div>
              <div className="text-sm text-white/75">{failed ? "Video coming soon" : item.caption}</div>
            </figcaption>
          </button>
        )}
      </div>
    </figure>
  );
}

/** A row of one or more videos. */
export function VideoGallery({ items }: { items: VideoItem[] }) {
  return (
    <div className={`grid gap-6 ${items.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-3xl"}`}>
      {items.map((it) => (
        <VideoCard key={it.src} item={it} />
      ))}
    </div>
  );
}
