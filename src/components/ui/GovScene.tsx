/**
 * Original stylised silhouette of a North-Block-style secretariat dome with the
 * national flag, used as an atmospheric backdrop on the login panel. Drawn from
 * scratch — evokes a government building without reproducing any protected
 * emblem or copyrighted photograph.
 */
export function GovScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 320" className={className} role="img" aria-label="A government secretariat building at dusk" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="gvSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1220" />
          <stop offset="1" stopColor="#16233b" />
        </linearGradient>
        <linearGradient id="gvBuild" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#233450" />
          <stop offset="1" stopColor="#111a2b" />
        </linearGradient>
        <radialGradient id="gvGlow" cx="0.5" cy="0.2" r="0.7">
          <stop offset="0" stopColor="#F5C400" stopOpacity="0.18" />
          <stop offset="1" stopColor="#F5C400" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="600" height="320" fill="url(#gvSky)" />
      <circle cx="300" cy="70" r="160" fill="url(#gvGlow)" />

      {/* Stars */}
      {[[60,40],[120,70],[500,50],[540,90],[420,36],[240,54],[180,30]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1" fill="#ffffff" opacity="0.5" />
      ))}

      {/* Base wall */}
      <rect x="0" y="240" width="600" height="80" fill="url(#gvBuild)" />
      {/* Colonnade */}
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={20 + i * 27} y="200" width="10" height="40" fill="#1a2740" />
      ))}
      <rect x="10" y="192" width="580" height="10" fill="#2b3f60" />

      {/* Central block */}
      <rect x="235" y="120" width="130" height="80" fill="url(#gvBuild)" />
      <rect x="250" y="140" width="100" height="60" fill="#1a2740" />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={258 + i * 15} y="145" width="6" height="55" fill="#2b3f60" />
      ))}

      {/* Dome */}
      <path d="M262 120 Q300 58 338 120 Z" fill="url(#gvBuild)" />
      <path d="M262 120 Q300 70 338 120" fill="none" stroke="#2b3f60" strokeWidth="2" />
      <rect x="296" y="40" width="8" height="22" fill="#2b3f60" />
      {/* Flag */}
      <rect x="300" y="34" width="26" height="6" fill="#FF9933" />
      <rect x="300" y="40" width="26" height="5" fill="#ffffff" />
      <rect x="300" y="45" width="26" height="6" fill="#138808" />
      <line x1="300" y1="30" x2="300" y2="70" stroke="#8494ab" strokeWidth="2" />

      {/* Side towers */}
      <rect x="90" y="160" width="46" height="40" fill="url(#gvBuild)" />
      <path d="M92 160 Q113 138 134 160 Z" fill="#1a2740" />
      <rect x="464" y="160" width="46" height="40" fill="url(#gvBuild)" />
      <path d="M466 160 Q487 138 508 160 Z" fill="#1a2740" />

      {/* Warm window lights */}
      {[[110,210],[150,210],[270,215],[330,215],[470,210],[510,210],[60,215],[560,215]].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="6" height="10" fill="#F5C400" opacity="0.7" />
      ))}
    </svg>
  );
}
