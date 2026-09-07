export function HeroScene() {
  return (
    <div className="relative aspect-square w-full max-w-[520px]">
      {/* Floor grid */}
      <svg
        viewBox="0 0 520 520"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="A digital weighbridge in an isometric perspective with a QR-verified certificate floating above it."
      >
        <defs>
          <linearGradient id="scaleTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1B2333" />
            <stop offset="1" stopColor="#0B1220" />
          </linearGradient>
          <linearGradient id="scaleFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A3446" />
            <stop offset="1" stopColor="#0B1220" />
          </linearGradient>
          <linearGradient id="scaleSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#141C2E" />
            <stop offset="1" stopColor="#0B1220" />
          </linearGradient>
          <linearGradient id="displayLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0B5FFF" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0745B8" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#F5C400" stopOpacity="0.55" />
            <stop offset="1" stopColor="#F5C400" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floor" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0" stopColor="#0B1220" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0B1220" stopOpacity="0" />
          </radialGradient>
          <pattern id="dotGrid" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#0B1220" opacity="0.06" />
          </pattern>
        </defs>

        {/* Ground plate + dot grid */}
        <rect x="0" y="0" width="520" height="520" fill="url(#dotGrid)" />
        <ellipse cx="260" cy="440" rx="230" ry="46" fill="url(#floor)" />

        {/* Ashoka-chakra style rotating accent */}
        <g transform="translate(88 88)" className="gs-spin-slow" opacity="0.7">
          <circle cx="0" cy="0" r="34" fill="none" stroke="#0B5FFF" strokeOpacity="0.25" strokeWidth="1" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2="0"
              y2="-34"
              stroke="#0B5FFF"
              strokeOpacity="0.35"
              strokeWidth="1"
              transform={`rotate(${(360 / 24) * i})`}
            />
          ))}
          <circle cx="0" cy="0" r="5" fill="#0B5FFF" />
        </g>

        {/* Floating verified badge — top right */}
        <g transform="translate(360 60)" className="gs-float">
          <circle cx="0" cy="0" r="46" fill="url(#glow)" />
          <circle cx="0" cy="0" r="30" fill="#F5C400" />
          <path d="M-12 0 L-4 8 L12 -8" stroke="#0B1220" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="0" y="52" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0B1220" letterSpacing="0.08em">VERIFIED</text>
        </g>

        {/* Weighbridge — isometric platform */}
        <g transform="translate(120 220)">
          {/* Shadow */}
          <ellipse cx="140" cy="220" rx="180" ry="24" fill="#0B1220" opacity="0.14" />

          {/* Base slab */}
          <path d="M0 150 L140 220 L280 150 L140 80 Z" fill="url(#scaleTop)" />
          <path d="M0 150 L0 178 L140 248 L140 220 Z" fill="url(#scaleFront)" />
          <path d="M280 150 L280 178 L140 248 L140 220 Z" fill="url(#scaleSide)" />

          {/* Load platform */}
          <path d="M40 128 L140 180 L240 128 L140 76 Z" fill="#F7F5EF" stroke="#E4E1D6" strokeWidth="1.5" />
          <path d="M40 128 L40 138 L140 190 L140 180 Z" fill="#E4E1D6" />
          <path d="M240 128 L240 138 L140 190 L140 180 Z" fill="#CFCCC0" />

          {/* Load bars (tick marks on platform) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${60 + i * 20} ${138 - i * 2} L${160 + i * 20} ${190 - i * 2}`}
              stroke="#0B1220"
              strokeOpacity="0.15"
              strokeWidth="1"
            />
          ))}

          {/* Digital display column */}
          <g transform="translate(196 -20)">
            <path d="M0 0 L36 -18 L36 96 L0 114 Z" fill="url(#scaleSide)" />
            <path d="M36 -18 L60 -6 L60 108 L36 96 Z" fill="url(#scaleFront)" />

            {/* Display screen */}
            <g transform="translate(6 8)">
              <path d="M0 0 L38 -18 L38 40 L0 58 Z" fill="url(#displayLight)" />
              <path d="M0 0 L38 -18" stroke="#0B5FFF" strokeWidth="0.5" />
              <text x="19" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill="#F5C400" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" transform="skewY(-25)">
                500.02
              </text>
              <text x="19" y="34" textAnchor="middle" fontSize="6" fill="#F5C400" opacity="0.8" transform="skewY(-25)">
                kg  ·  class III
              </text>
            </g>
          </g>
        </g>

        {/* Certificate paper — floating */}
        <g transform="translate(38 258)" className="gs-float-slow">
          <rect x="0" y="0" width="150" height="200" rx="10" fill="#FFFFFF" stroke="#E4E1D6" strokeWidth="1.5" />
          <rect x="0" y="0" width="150" height="34" rx="10" fill="#0B1220" />
          <rect x="0" y="26" width="150" height="8" fill="#0B1220" />
          <text x="12" y="21" fontSize="10" fontWeight="700" fill="#F5C400" letterSpacing="0.08em">
            LM CERTIFICATE
          </text>
          <text x="12" y="52" fontSize="8" fill="#0B1220" opacity="0.6">
            No. LM-2026-a1b2c3d4
          </text>
          <line x1="12" y1="60" x2="138" y2="60" stroke="#E4E1D6" />
          <text x="12" y="76" fontSize="8" fill="#0B1220" opacity="0.6">Weighing scale · 500 kg</text>
          <text x="12" y="90" fontSize="8" fill="#0B1220" opacity="0.6">Class III  ·  Pass</text>
          <text x="12" y="104" fontSize="8" fill="#0B1220" opacity="0.6">Valid until 13 Mar 2027</text>

          {/* QR grid — hand-drawn tiles */}
          <g transform="translate(24 118)">
            <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" stroke="#E4E1D6" />
            {/* Corner finders */}
            <g>
              <rect x="4" y="4" width="24" height="24" fill="#0B1220" />
              <rect x="10" y="10" width="12" height="12" fill="#FFFFFF" />
              <rect x="13" y="13" width="6" height="6" fill="#0B1220" />
            </g>
            <g transform="translate(72 0)">
              <rect x="4" y="4" width="24" height="24" fill="#0B1220" />
              <rect x="10" y="10" width="12" height="12" fill="#FFFFFF" />
              <rect x="13" y="13" width="6" height="6" fill="#0B1220" />
            </g>
            <g transform="translate(0 72)">
              <rect x="4" y="4" width="24" height="24" fill="#0B1220" />
              <rect x="10" y="10" width="12" height="12" fill="#FFFFFF" />
              <rect x="13" y="13" width="6" height="6" fill="#0B1220" />
            </g>
            {/* Random-looking tiles */}
            {[
              [4,32],[10,32],[16,32],[28,32],[40,32],[46,32],[58,32],
              [4,40],[16,40],[22,40],[34,40],[46,40],[64,40],[76,40],
              [4,48],[10,48],[22,48],[34,48],[52,48],[70,48],
              [10,56],[22,56],[28,56],[40,56],[52,56],[58,56],[70,56],[82,56],
              [4,64],[16,64],[28,64],[46,64],[64,64],[76,64],
              [34,72],[46,72],[58,72],[70,72],[82,72],
              [40,80],[52,80],[64,80],[76,80],[88,80],
              [34,88],[46,88],[70,88],[82,88]
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="6" height="6" fill="#0B1220" />
            ))}
          </g>
        </g>

        {/* Floating trust chip — bottom right */}
        <g transform="translate(360 380)" className="gs-float-alt">
          <rect x="-70" y="-16" width="140" height="32" rx="16" fill="#FFFFFF" stroke="#E4E1D6" />
          <circle cx="-52" cy="0" r="7" fill="#0F9D58" />
          <path d="M-56 0 L-53 3 L-48 -2" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="-40" y="4" fontSize="10" fontWeight="600" fill="#0B1220">Scan validates offline</text>
        </g>

        {/* Subtle scanning ray */}
        <g className="gs-scan" opacity="0.55">
          <path d="M300 -20 L520 200" stroke="#F5C400" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
