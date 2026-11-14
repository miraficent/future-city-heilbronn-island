import { useId, type ReactNode } from "react";

const LINIE = "#254950";

/**
 * Bilder der Lernorte als eigene Illustrationen (keine Fotos, keine Logos – so gibt es keine Bildrechte-Fragen).
 * Die Motive sind an die echten Gebäude angelehnt. Neue Orte aus der Quellentabelle bekommen ein Haus in ihrer Farbe.
 */
export function OrtsBild({ id, name, farbe, className = "" }: { id: string; name: string; farbe: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const motiv = MOTIVE[id]?.(farbe) ?? standardHaus(farbe);
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={`Illustration: ${name}`} className={`ortsbild ${className}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${uid}-himmel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe3f2" />
          <stop offset="1" stopColor="#f6f1e2" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${uid}-himmel)`} />
      <circle cx="276" cy="36" r="17" fill="#f6d26b" />
      <g fill="#fff" opacity="0.9">
        <ellipse cx="64" cy="34" rx="26" ry="9" />
        <ellipse cx="82" cy="28" rx="16" ry="9" />
        <ellipse cx="196" cy="22" rx="20" ry="7" />
      </g>
      <rect y="156" width="320" height="44" fill="#a9cf8a" />
      {motiv}
    </svg>
  );
}

function baum(x: number, y: number, r = 14): ReactNode {
  return (
    <g key={`b${x}-${y}`}>
      <rect x={x - 2.5} y={y} width="5" height={r * 1.1} fill="#7a5233" />
      <circle cx={x} cy={y - r * 0.3} r={r} fill="#5fa65a" stroke={LINIE} strokeWidth="2" />
      <circle cx={x - r * 0.35} cy={y - r * 0.6} r={r * 0.35} fill="#7cc06c" />
    </g>
  );
}

function mensch(x: number, farbe: string): ReactNode {
  return (
    <g key={`m${x}`}>
      <circle cx={x} cy="152" r="4" fill="#f2c6a0" stroke={LINIE} strokeWidth="1.5" />
      <path d={`M${x - 5} 168v-8a5 5 0 0 1 10 0v8Z`} fill={farbe} stroke={LINIE} strokeWidth="1.5" />
    </g>
  );
}

const MOTIVE: Record<string, (farbe: string) => ReactNode> = {
  // experimenta: alter Backstein-Speicher neben dem gläsernen Neubau mit versetzt gestapelten Etagen, davor der Neckar
  experimenta: (farbe) => {
    const etagen = [
      { x1: 138, x2: 284, y: 122 },
      { x1: 150, x2: 298, y: 96 },
      { x1: 134, x2: 280, y: 70 },
      { x1: 152, x2: 292, y: 46 },
    ];
    return (
      <>
        <rect y="150" width="320" height="22" fill="#e5dcc7" />
        <path d="M0 172h320v28H0Z" fill="#7fc4dc" />
        <path d="M20 184q10-4 20 0t20 0M120 190q10-4 20 0t20 0M220 182q10-4 20 0t20 0" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
        <path d="M28 150V84l46-32 46 32v66Z" fill="#b5523b" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M24 86 74 50l50 36" fill="none" stroke="#7a3426" strokeWidth="6" strokeLinecap="round" />
        {[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={40 + c * 20} y={92 + r * 18} width="10" height="11" rx="1" fill="#f3e3c3" />))}
        {etagen.map((e, i) => (
          <g key={i}>
            <path d={`M${e.x1} ${e.y + 26}h${e.x2 - e.x1}l3-26H${e.x1 - 3}Z`} fill="#c9eef2" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
            {Array.from({ length: Math.floor((e.x2 - e.x1) / 13) }, (_, k) => (
              <path key={k} d={`M${e.x1 + 8 + k * 13} ${e.y + 4}v20`} stroke="#fff" strokeWidth="2" opacity="0.9" />
            ))}
            <rect x={e.x1 - 3} y={e.y} width={e.x2 - e.x1 + 6} height="4" fill={farbe} />
          </g>
        ))}
        <path d="M200 46a22 22 0 0 1 44 0Z" fill="#eef3f4" stroke={LINIE} strokeWidth="2.5" />
        <path d="M222 24v22M208 32q14 6 28 0" fill="none" stroke="#9fb3b8" strokeWidth="1.5" />
      </>
    );
  },
  // aim am Bildungscampus: Klinkerbau mit großen Fensterbändern, Bäume und Menschen auf dem Campus
  aim: (farbe) => (
    <>
      <path d="M0 168h320v8H0Z" fill="#e5dcc7" />
      <rect x="36" y="66" width="248" height="92" fill="#b8664e" stroke={LINIE} strokeWidth="2.5" />
      <rect x="32" y="60" width="256" height="8" fill="#8f4a37" stroke={LINIE} strokeWidth="2" />
      {[0, 1].flatMap((r) =>
        Array.from({ length: 9 }, (_, c) => <rect key={`${r}${c}`} x={46 + c * 26} y={76 + r * 32} width="18" height="24" fill="#cfe8f0" stroke="#fff" strokeWidth="2" />),
      )}
      <rect x="140" y="112" width="40" height="46" fill="#a9d6e3" stroke={LINIE} strokeWidth="2.5" />
      <path d="M160 112v46" stroke="#fff" strokeWidth="2" />
      <rect x="18" y="80" width="10" height="78" fill="#d9d2c4" stroke={LINIE} strokeWidth="2" />
      <path d="M28 84h18v34l-9-6-9 6Z" fill={farbe} stroke={LINIE} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="37" cy="97" r="5" fill="#fff6d0" />
      {baum(60, 140)}
      {baum(262, 138, 16)}
      {baum(298, 142, 12)}
      {mensch(110, "#2f7fb8")}
      {mensch(206, farbe)}
      {mensch(220, "#5dbb63")}
    </>
  ),
  // Haus der Familie im Neckarbogen: Holzfassade und bunte Balkone, davor ein Spielplatz
  hdf: (farbe) => (
    <>
      <rect x="30" y="54" width="120" height="104" fill="#d9a66b" stroke={LINIE} strokeWidth="2.5" />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${40 + i * 10} 56v100`} stroke="#b9844c" strokeWidth="1.5" />)}
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={42 + c * 36} y={64 + r * 26} width="24" height="16" fill="#cfe8f0" stroke={LINIE} strokeWidth="2" />))}
      <rect x="40" y="132" width="100" height="26" fill="#cfe8f0" stroke={LINIE} strokeWidth="2.5" />
      <path d="M90 140l9 7v10H81v-10Z" fill={farbe} stroke={LINIE} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M90 152c-3-3-6-4-6-7a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 3-3 4-6 7Z" fill="#e8513a" />
      <rect x="160" y="78" width="96" height="80" fill="#f7f3ea" stroke={LINIE} strokeWidth="2.5" />
      {(["#f2a900", "#00a0b0", "#e8513a"] as const).map((c, r) => (
        <g key={c}>
          <rect x="170" y={88 + r * 24} width="22" height="14" fill="#cfe8f0" stroke={LINIE} strokeWidth="1.8" />
          <rect x="222" y={88 + r * 24} width="22" height="14" fill="#cfe8f0" stroke={LINIE} strokeWidth="1.8" />
          <rect x="164" y={100 + r * 24} width="88" height="6" fill={c} stroke={LINIE} strokeWidth="1.8" />
        </g>
      ))}
      <path d="M268 158l14-34 14 34M276 140h12" fill="none" stroke="#7a5233" strokeWidth="3" strokeLinecap="round" />
      <path d="M282 124v18" stroke={LINIE} strokeWidth="1.5" />
      <rect x="276" y="142" width="12" height="4" rx="1" fill={farbe} stroke={LINIE} strokeWidth="1.5" />
      <ellipse cx="240" cy="172" rx="22" ry="6" fill="#f0dfa8" stroke={LINIE} strokeWidth="2" />
      {baum(16, 146, 12)}
      {baum(306, 120, 13)}
      {mensch(196, "#e8513a")}
      {mensch(208, "#f2a900")}
    </>
  ),
  // IPAI im Zukunftspark: Glasbau mit Netz-Muster, Solardach und Baukran – der Campus wächst noch
  ipai: (farbe) => (
    <>
      <path d="M232 156V30M232 34h76M246 34l-14 14M290 34v20" fill="none" stroke="#f2a900" strokeWidth="4" strokeLinecap="round" />
      <path d="M290 54v10" stroke={LINIE} strokeWidth="1.5" />
      <rect x="284" y="64" width="12" height="8" fill="#8fa3ab" stroke={LINIE} strokeWidth="1.5" />
      <path d="M30 158V96q0-26 26-26h168v88Z" fill="#ddd6fa" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M60 70h164v8H52q2-6 8-8Z" fill={farbe} />
      {[[70, 104], [104, 92], [104, 128], [140, 110], [176, 96], [176, 134], [208, 116]].map(([x, y], i, alle) => (
        <g key={i}>
          {alle.slice(i + 1).filter(([x2]) => x2! - x! > 0 && x2! - x! < 40).map(([x2, y2]) => (
            <path key={`${x2}${y2}`} d={`M${x} ${y}L${x2} ${y2}`} stroke={farbe} strokeWidth="1.8" opacity="0.6" />
          ))}
          <circle cx={x} cy={y} r="5" fill="#fff" stroke={farbe} strokeWidth="2.5" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${80 + i * 34} 62l8-10h26l-8 10Z`} fill="#2f5f9e" stroke={LINIE} strokeWidth="1.8" strokeLinejoin="round" />)}
      <rect x="110" y="132" width="34" height="26" fill="#b8acf2" stroke={LINIE} strokeWidth="2.5" />
      <path d="M127 132v26" stroke="#fff" strokeWidth="2" />
      {baum(262, 146, 11)}
      {baum(290, 148, 9)}
      {mensch(170, farbe)}
      {mensch(184, "#00a0b0")}
    </>
  ),
};

function standardHaus(farbe: string): ReactNode {
  return (
    <>
      <path d="M100 158V92l60-40 60 40v66Z" fill="#f7f3ea" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M94 94l66-44 66 44" fill="none" stroke={farbe} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="146" y="118" width="28" height="40" fill={farbe} stroke={LINIE} strokeWidth="2.5" />
      <rect x="116" y="104" width="20" height="18" fill="#cfe8f0" stroke={LINIE} strokeWidth="2" />
      <rect x="184" y="104" width="20" height="18" fill="#cfe8f0" stroke={LINIE} strokeWidth="2" />
      {baum(60, 140)}
      {baum(262, 140, 16)}
    </>
  );
}
