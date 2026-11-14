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

/**
 * Bit, der Lieferroboter: schwebt, blinzelt mit seinen Bildschirmaugen, schaut zur Seite und zeigt beim Sprechen
 * eine kleine Klangwelle als Mund. Die Bewegungen stehen in figur.css.
 */
export function Roboter({ x = 0, y = 0, breite = 120, hoehe = 140, spricht = false, blick = "vorne" }: { x?: number; y?: number; breite?: number; hoehe?: number; spricht?: boolean; blick?: "vorne" | "links" | "rechts" }) {
  const id = useId().replace(/[:«»]/g, "");
  const v = blick === "links" ? -5 : blick === "rechts" ? 5 : 0;
  return (
    <svg x={x} y={y} width={breite} height={hoehe} viewBox="0 0 120 140" className={`roboter2 ${spricht ? "spricht" : ""}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}k`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e9eef2" />
          <stop offset="1" stopColor="#b9c6cf" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#2c5664" />
          <stop offset="1" stopColor="#10232b" />
        </radialGradient>
        <radialGradient id={`${id}l`}>
          <stop offset="0" stopColor="#9ff6ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#9ff6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="rob-schatten" cx="60" cy="134" rx="30" ry="5" fill="#1c1934" opacity="0.22" />
      <g className="rob-koerper">
        <g className="rob-antenne">
          <path d="M60 8v13" stroke="#5b6b72" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="60" cy="8" r="9" fill={`url(#${id}l)`} />
          <circle className="rob-licht" cx="60" cy="8" r="5" fill="#f4a24c" />
        </g>
        <g className="rob-arm-l"><path d="M28 92q-14 4-14 20" stroke="#8796a0" strokeWidth="7" strokeLinecap="round" fill="none" /><circle cx="14" cy="114" r="6" fill="#dfe6ea" stroke="#5b6b72" strokeWidth="2" /></g>
        <g className="rob-arm-r"><path d="M92 92q14 4 14 20" stroke="#8796a0" strokeWidth="7" strokeLinecap="round" fill="none" /><circle cx="106" cy="114" r="6" fill="#dfe6ea" stroke="#5b6b72" strokeWidth="2" /></g>
        <path d="M30 84h60l-6 36q-24 10-48 0Z" fill={`url(#${id}k)`} stroke="#5b6b72" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="50" y="94" width="20" height="12" rx="4" fill="#2f4bff" opacity="0.85" />
        <path d="M54 100h12" stroke="#9ff6ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M46 124q14 10 28 0" stroke="#9ff6ff" strokeWidth="4" strokeLinecap="round" opacity="0.6" className="rob-duese" />
        <rect x="14" y="20" width="92" height="68" rx="30" fill={`url(#${id}k)`} stroke="#5b6b72" strokeWidth="2.5" />
        <rect x="23" y="29" width="74" height="50" rx="22" fill={`url(#${id}g)`} />
        <g className="rob-augen" style={{ transformOrigin: "60px 50px" }}>
          <ellipse cx={45 + v} cy="50" rx="8" ry="10" fill="#9ff6ff" />
          <ellipse cx={75 + v} cy="50" rx="8" ry="10" fill="#9ff6ff" />
          <circle cx={48 + v} cy="46" r="3" fill="#ffffff" />
          <circle cx={78 + v} cy="46" r="3" fill="#ffffff" />
        </g>
        <g className="rob-mund" transform={`translate(${60 + v} 67)`}>
          {spricht ? (
            [-8, -3, 2, 7].map((mx, i) => <rect key={mx} className={`rob-welle rob-welle-${i}`} x={mx} y="-4" width="3" height="8" rx="1.5" fill="#9ff6ff" />)
          ) : (
            <path d="M-8-1q8 7 16 0" stroke="#9ff6ff" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}
        </g>
        <path d="M28 36q8-7 20-8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.3" fill="none" />
        <circle cx="31" cy="66" r="4" fill="#f08c8c" opacity="0.55" />
        <circle cx="89" cy="66" r="4" fill="#f08c8c" opacity="0.55" />
      </g>
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
