/**
 * Gold scales-of-justice emblem for the Legal Metrology identity — a decorative,
 * theme-independent mark (it always renders in gold, meant for dark panels).
 * Drawn from scratch; a lightweight speckle evokes the gilt/glitter look.
 */
export function ScalesEmblem({ size = 128, className, withLabel = false }: { size?: number; className?: string; withLabel?: boolean }) {
  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Legal Metrology — scales of justice">
        <defs>
          <linearGradient id="lmGold2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBE9A6" />
            <stop offset="0.45" stopColor="#E9B93E" />
            <stop offset="1" stopColor="#B8860B" />
          </linearGradient>
          <filter id="lmSpeckle">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.86  0 0 0 0 0.4  0 0 0 0.5 0" result="s" />
            <feComposite in="s" in2="SourceGraphic" operator="in" />
          </filter>
          <g id="lmScales">
            {/* base */}
            <path d="M40 104 L80 104 L74 96 L46 96 Z" />
            <rect x="36" y="104" width="48" height="5" rx="2" />
            {/* post + top knob */}
            <rect x="57" y="30" width="6" height="66" rx="3" />
            <circle cx="60" cy="26" r="6" />
            {/* beam */}
            <path d="M18 40 Q60 30 102 40" fill="none" stroke="url(#lmGold2)" strokeWidth="5" strokeLinecap="round" />
            {/* chains */}
            <g stroke="url(#lmGold2)" strokeWidth="2.4" fill="none" strokeLinecap="round">
              <path d="M22 41 L30 66" /><path d="M40 39 L30 66" />
              <path d="M98 41 L90 66" /><path d="M80 39 L90 66" />
            </g>
            {/* pans */}
            <path d="M12 66 Q30 88 48 66 Z" />
            <path d="M72 66 Q90 88 108 66 Z" />
          </g>
        </defs>

        <use href="#lmScales" fill="url(#lmGold2)" />
        <use href="#lmScales" fill="url(#lmGold2)" filter="url(#lmSpeckle)" opacity="0.55" />

        {/* sparkles */}
        <g fill="#FFF6DA">
          <circle cx="30" cy="34" r="1.3" /><circle cx="92" cy="52" r="1.1" /><circle cx="60" cy="18" r="1.4" /><circle cx="46" cy="72" r="1" />
        </g>
      </svg>
      {withLabel && (
        <span style={{ fontFamily: "var(--font-display), serif", fontWeight: 600, letterSpacing: "0.02em", color: "#E9B93E", textAlign: "center", lineHeight: 1.15 }}>
          Legal Metrology
        </span>
      )}
    </div>
  );
}
