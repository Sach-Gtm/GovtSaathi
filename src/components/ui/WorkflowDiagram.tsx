export function WorkflowDiagram() {
  return (
    <svg
      viewBox="0 0 1120 260"
      className="w-full h-auto"
      role="img"
      aria-label="Four steps: trader applies, allocator routes, officer verifies on site, citizen scans the QR."
    >
      <defs>
        <linearGradient id="wfConn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0B2E6F" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#0B2E6F" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0B2E6F" stopOpacity="0.15" />
        </linearGradient>
        <filter id="wfSoft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Connector rail */}
      <line x1="130" y1="130" x2="990" y2="130" stroke="url(#wfConn)" strokeWidth="2" />
      <g fill="#0B2E6F">
        {[280, 560, 840].map((x) => (
          <circle key={x} cx={x} cy="130" r="4" opacity="0.65" />
        ))}
      </g>

      {/* Moving dot along rail */}
      <circle cx="140" cy="130" r="6" fill="#0E7A4B" className="gs-flow-dot">
        <animate attributeName="cx" values="140;980;140" dur="8s" repeatCount="indefinite" />
      </circle>

      {[
        { x: 130, title: "Trader files", sub: "Lists every instrument, submits the application", icon: <ShopIcon /> },
        { x: 410, title: "System allots", sub: "Routes to nearest officer or GATC by district", icon: <MapIcon /> },
        { x: 690, title: "Officer records", sub: "Site visit, readings, photos — signed offline", icon: <ClipboardIcon /> },
        { x: 970, title: "Citizen scans", sub: "QR on the sticker validates in 3 seconds", icon: <ScanIcon /> }
      ].map((s) => (
        <g key={s.title} transform={`translate(${s.x} 130)`}>
          <circle cx="0" cy="0" r="46" fill="#FFFFFF" stroke="#E3E0D4" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="46" fill="#0B2E6F" opacity="0.06" />
          <g transform="translate(-18 -18)">{s.icon}</g>
          <text x="0" y="82" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0B1220">{s.title}</text>
          <text x="0" y="102" textAnchor="middle" fontSize="11" fill="#0B1220" opacity="0.65">
            {s.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M6 12 L8 6 H28 L30 12 Z" stroke="#0B1220" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 12 V30 H28 V12" stroke="#0B1220" strokeWidth="1.8" />
      <rect x="14" y="18" width="8" height="12" stroke="#0B1220" strokeWidth="1.8" />
      <path d="M11 15 A2 2 0 0 0 15 15 A2 2 0 0 0 19 15 A2 2 0 0 0 23 15 A2 2 0 0 0 27 15" stroke="#0E7A4B" strokeWidth="1.6" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M6 8 L14 6 L22 10 L30 8 V28 L22 30 L14 26 L6 28 Z" stroke="#0B1220" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 6 V26" stroke="#0B1220" strokeWidth="1.6" />
      <path d="M22 10 V30" stroke="#0B1220" strokeWidth="1.6" />
      <circle cx="20" cy="18" r="3" fill="#0E7A4B" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="8" y="8" width="20" height="24" rx="2" stroke="#0B1220" strokeWidth="1.8" />
      <rect x="13" y="5" width="10" height="6" rx="1.5" fill="#0B1220" />
      <path d="M13 18 H23 M13 22 H23 M13 26 H19" stroke="#0B1220" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="26" cy="26" r="4" fill="#0E7A4B" />
      <path d="M24 26 L25.5 27.5 L28 25" stroke="#0B1220" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ScanIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="8" y="4" width="20" height="28" rx="3" stroke="#0B1220" strokeWidth="1.8" />
      <rect x="12" y="10" width="12" height="12" fill="#0B1220" />
      <rect x="14" y="12" width="3" height="3" fill="#F4F2EC" />
      <rect x="19" y="12" width="3" height="3" fill="#F4F2EC" />
      <rect x="14" y="17" width="3" height="3" fill="#F4F2EC" />
      <rect x="19" y="17" width="3" height="3" fill="#F4F2EC" />
      <path d="M14 26 H22" stroke="#0B1220" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18" cy="30" r="1" fill="#0B1220" />
    </svg>
  );
}
