import type { PlanetArt } from "@/lib/themen-stil";

type Props = {
  farbe: string;
  art: PlanetArt;
  /** Eindeutiger Präfix für SVG-IDs, wenn mehrere Planeten auf einer Seite sind. */
  kennung: string;
  className?: string;
  /** Zweite, versetzte Farbebene – der typische Risograph-Fehldruck. */
  versatzFarbe?: string;
  titel?: string;
};

/** Ein Planet im Risograph-Look: Farbfläche, Rasterpunkte als Schatten, versetzte zweite Ebene. */
export function Planet({ farbe, art, kennung, className, versatzFarbe = "#2F4BFF", titel }: Props) {
  const raster = `${kennung}-raster`;
  const schatten = `${kennung}-schatten`;
  const kugel = `${kennung}-kugel`;
  return (
    <svg viewBox="0 0 220 220" className={className} role={titel ? "img" : undefined} aria-hidden={titel ? undefined : true}>
      {titel ? <title>{titel}</title> : null}
      <defs>
        <pattern id={raster} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="3.5" cy="3.5" r="1.7" fill="#1c1934" />
        </pattern>
        <radialGradient id={schatten} cx="0.32" cy="0.3" r="0.85">
          <stop offset="0.45" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask id={`${schatten}-maske`}>
          <circle cx="110" cy="110" r="72" fill={`url(#${schatten})`} />
        </mask>
        <clipPath id={kugel}>
          <circle cx="110" cy="110" r="72" />
        </clipPath>
      </defs>

      {art === "ring" ? (
        <ellipse cx="110" cy="112" rx="104" ry="26" fill="none" stroke="#1c1934" strokeWidth="5" transform="rotate(-14 110 112)" />
      ) : null}

      <circle cx="118" cy="117" r="72" fill={versatzFarbe} opacity="0.85" style={{ mixBlendMode: "multiply" }} />
      <circle cx="110" cy="110" r="72" fill={farbe} />

      <g clipPath={`url(#${kugel})`}>
        {art === "baender" ? (
          <g fill="#1c1934" opacity="0.85">
            <path d="M20 82 Q110 66 200 84 L200 94 Q110 78 20 92Z" />
            <path d="M20 118 Q110 104 200 122 L200 136 Q110 120 20 132Z" />
            <path d="M20 152 Q110 142 200 156 L200 160 Q110 150 20 158Z" />
            <ellipse cx="140" cy="126" rx="15" ry="8" fill="#fbf7ee" />
          </g>
        ) : null}
        {art === "krater" ? (
          <g fill="#1c1934">
            <circle cx="86" cy="86" r="11" opacity="0.9" />
            <circle cx="132" cy="70" r="6" opacity="0.9" />
            <circle cx="140" cy="128" r="14" opacity="0.9" />
            <circle cx="96" cy="140" r="5" opacity="0.9" />
            <circle cx="86" cy="86" r="5" fill="#fbf7ee" />
          </g>
        ) : null}
        <rect x="0" y="0" width="220" height="220" fill={`url(#${raster})`} mask={`url(#${schatten}-maske)`} opacity="0.55" />
      </g>

      {art === "ring" ? (
        <path
          d="M 8 128 Q 110 176 214 96"
          fill="none"
          stroke="#1c1934"
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(-2 110 112)"
        />
      ) : null}
      {art === "baender" ? <circle cx="190" cy="48" r="12" fill="#1c1934" /> : null}
      {art === "krater" ? (
        <g fill="#1c1934">
          <path d="M34 40 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" />
          <path d="M186 168 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
        </g>
      ) : null}
    </svg>
  );
}
