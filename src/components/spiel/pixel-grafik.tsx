import { useId } from "react";

/*
 * Bilder der Spielwelt im gemalten Stil. Der Dateiname ist historisch: Früher waren das Pixelgrafiken.
 * Die vier Lernhäuser sind freigestellte Ausschnitte aus gemalten Ansichten der echten Gebäude,
 * Pico, Baum und Bank sind Vektorzeichnungen mit weichen Verläufen.
 */

export type PixelMotiv = "code-labor" | "forscherhaus" | "spielewerkstatt" | "ki-atelier" | "roboter" | "baum" | "bank" | "kind";

const HAUS: Record<string, { datei: string; breite: number; hoehe: number; name: string }> = {
  "code-labor": { datei: "/medien/spiel/aim.webp", breite: 900, hoehe: 387, name: "aim auf dem Bildungscampus" },
  forscherhaus: { datei: "/medien/spiel/experimenta.webp", breite: 900, hoehe: 450, name: "experimenta" },
  spielewerkstatt: { datei: "/medien/spiel/hdf.webp", breite: 900, hoehe: 419, name: "Haus der Familie" },
  "ki-atelier": { datei: "/medien/spiel/ipai.webp", breite: 900, hoehe: 397, name: "IPAI SPACES" },
};

export const hausBildMass = (motiv: string) => HAUS[motiv];

/** Pico, der Spielbegleiter: ein runder Roboter mit Bildschirmgesicht. */
export function Roboter({ x = 0, y = 0, breite = 120, hoehe = 140 }: { x?: number; y?: number; breite?: number; hoehe?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg x={x} y={y} width={breite} height={hoehe} viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}k`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf6e6" />
          <stop offset="1" stopColor="#d9cdb4" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#3c6e7a" />
          <stop offset="1" stopColor="#1e3d47" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="134" rx="34" ry="5" fill="#1c1934" opacity="0.18" />
      <path d="M60 6v14" stroke="#4b5d63" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="8" r="7" fill="#f2a24c" />
      <circle cx="58" cy="6" r="2.4" fill="#fff4d6" />
      <path d="M24 92q-14 6-12 22M96 92q14 6 12 22" stroke="#b9ad94" strokeWidth="9" strokeLinecap="round" fill="none" />
      <rect x="30" y="80" width="60" height="46" rx="20" fill={`url(#${id}k)`} stroke="#4b5d63" strokeWidth="3" />
      <circle cx="60" cy="102" r="8" fill="#63bdb5" stroke="#4b5d63" strokeWidth="2" />
      <rect x="14" y="20" width="92" height="66" rx="28" fill={`url(#${id}k)`} stroke="#4b5d63" strokeWidth="3" />
      <rect x="24" y="30" width="72" height="46" rx="20" fill={`url(#${id}g)`} />
      <ellipse cx="46" cy="51" rx="7" ry="9" fill="#9ff0e4" />
      <ellipse cx="74" cy="51" rx="7" ry="9" fill="#9ff0e4" />
      <path d="M50 64q10 7 20 0" stroke="#9ff0e4" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M30 38q8-8 22-8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.35" fill="none" />
      <circle cx="34" cy="62" r="4" fill="#f08c8c" opacity="0.5" />
      <circle cx="86" cy="62" r="4" fill="#f08c8c" opacity="0.5" />
    </svg>
  );
}

/** Laubbaum mit weicher Krone. Ursprung oben links, Stamm unten in der Mitte. */
function BaumBild({ x = 0, y = 0, breite, hoehe }: { x?: number; y?: number; breite: number; hoehe: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg x={x} y={y} width={breite} height={hoehe} viewBox="0 0 100 115" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}l`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#b8d97a" />
          <stop offset="0.55" stopColor="#7fae55" />
          <stop offset="1" stopColor="#4f7d3c" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="110" rx="30" ry="5" fill="#2f4b2a" opacity="0.2" />
      <path d="M45 110q3-30 0-46h10q-3 16 0 46Z" fill="#7a5638" />
      <path d="M50 70q-10-6-16-16M52 68q8-4 12-14" stroke="#7a5638" strokeWidth="4" strokeLinecap="round" fill="none" />
      {[[50, 44, 34], [28, 54, 22], [72, 54, 22], [38, 30, 22], [64, 30, 22]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#${id}l)`} />
      ))}
      {[[40, 26, 6], [58, 22, 5], [30, 46, 4], [66, 44, 4]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#d7ec9e" opacity="0.65" />
      ))}
    </svg>
  );
}

/** Holzbank wie am Neckarufer. */
function BankBild({ x = 0, y = 0, breite, hoehe }: { x?: number; y?: number; breite: number; hoehe: number }) {
  return (
    <svg x={x} y={y} width={breite} height={hoehe} viewBox="0 0 96 52" aria-hidden="true" focusable="false">
      <ellipse cx="48" cy="48" rx="40" ry="4" fill="#1c1934" opacity="0.18" />
      <path d="M14 30v18M82 30v18M20 30v14M76 30v14" stroke="#3f4a4e" strokeWidth="4" strokeLinecap="round" />
      {[8, 17].map((y2) => <rect key={y2} x="8" y={y2} width="80" height="7" rx="3" fill="#c98f55" stroke="#8a5b30" strokeWidth="1.5" />)}
      <rect x="6" y="28" width="84" height="8" rx="3" fill="#d9a066" stroke="#8a5b30" strokeWidth="1.5" />
    </svg>
  );
}

export function PixelGrafik({ motiv, x = 0, y = 0, breite, hoehe, className }: { motiv: PixelMotiv; x?: number; y?: number; breite: number; hoehe: number; className?: string }) {
  const haus = HAUS[motiv];
  if (haus) return <image href={haus.datei} x={x} y={y} width={breite} height={hoehe} preserveAspectRatio="xMidYMax meet" className={className} />;
  if (motiv === "roboter" || motiv === "kind") return <Roboter x={x} y={y} breite={breite} hoehe={hoehe} />;
  if (motiv === "baum") return <BaumBild x={x} y={y} breite={breite} hoehe={hoehe} />;
  return <BankBild x={x} y={y} breite={breite} hoehe={hoehe} />;
}

export function PixelBild({ motiv, alt = "", className = "" }: { motiv: PixelMotiv; alt?: string; className?: string }) {
  const haus = HAUS[motiv];
  if (haus) return <img className={`haus-bild ${className}`} src={haus.datei} width={haus.breite} height={haus.hoehe} alt={alt} loading="lazy" decoding="async" />;
  const breite = motiv === "bank" ? 96 : 100;
  const hoehe = motiv === "bank" ? 52 : motiv === "baum" ? 115 : 117;
  return (
    <svg className={`pixel-bild ${className}`} viewBox={`0 0 ${breite} ${hoehe}`} role={alt ? "img" : undefined} aria-hidden={alt ? undefined : true} aria-label={alt || undefined}>
      <PixelGrafik motiv={motiv} breite={breite} hoehe={hoehe} />
    </svg>
  );
}
