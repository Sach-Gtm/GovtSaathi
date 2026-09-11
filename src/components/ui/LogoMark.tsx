export function LogoMark({
  size = 40,
  className
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="MAAPSETU"
    >
      <defs>
        <linearGradient id="lmGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12A362" />
          <stop offset="1" stopColor="#0A5C38" />
        </linearGradient>
        <linearGradient id="lmInk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123A7A" />
          <stop offset="1" stopColor="#0B2E6F" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="url(#lmInk)" strokeWidth="5" />

      {/* Balance scale */}
      <g stroke="url(#lmInk)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M38 78 L62 78" strokeWidth="4" />
        <path d="M50 32 L50 78" strokeWidth="4" />
        <path d="M28 42 L72 42" strokeWidth="4" />
        <path d="M32 42 L26 60" strokeWidth="2" />
        <path d="M40 42 L46 60" strokeWidth="2" />
        <path d="M60 42 L54 60" strokeWidth="2" />
        <path d="M68 42 L74 60" strokeWidth="2" />
      </g>

      {/* Pans */}
      <path d="M22 60 Q36 72 46 60 Z" fill="url(#lmGreen)" stroke="#083D25" strokeWidth="1" />
      <path d="M54 60 Q64 72 78 60 Z" fill="url(#lmGreen)" stroke="#083D25" strokeWidth="1" />

      {/* Overlay checkmark */}
      <path
        d="M30 54 L46 70 L82 30"
        stroke="url(#lmGreen)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.96"
      />

      {/* Verified rosette top-right */}
      <g transform="translate(70 22)">
        <circle cx="0" cy="0" r="10" fill="url(#lmGreen)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x="-1" y="-13" width="2" height="3" fill="url(#lmGreen)" transform={`rotate(${i * 36})`} />
        ))}
        <path d="M-4 0 L-1 3 L4 -3" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
