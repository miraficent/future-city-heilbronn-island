/**
 * Gemalte Heilbronn-Karte für Kinder (DESIGN.md Projektentscheidung 11).
 * Hintergrundbild ohne Gebäude + eigene SVG-Häuser (Fachwerk) + isometrische Einrichtungsgebäude.
 * Gleiche Schnittstelle wie die gezeichnete Stadtkarte (insel-karte.tsx, bleibt als Rückfall).
 */
import { F, type KartenOrt, type Pt } from "@/lib/kinderkarte";
import { BILD, BILD_HAEUSER, BILD_NEUER_ORT } from "@/lib/bildkarte";
import { Fachwerkhaus } from "./fachwerkhaus";
import { PinZeichen } from "./gebaeude";
import { InstitutGebaeude, institutHoehe } from "./institut-gebaeude";
import { KinderFigur, type FigurArt } from "./kinder-figuren";

type Props = {
  /** Orte bereits in Bildkoordinaten (bildOrte) */
  orte: KartenOrt[];
  zahlen: Record<string, number>;
  heute?: Set<string>;
  aktiv: Set<string> | null;
  figur: Pt | null;
  /** Welche der drei Kinderfiguren läuft */
  figurArt: FigurArt;
  gewaehlt: string | null;
  onWaehle: (id: string) => void;
  onNeuerOrt?: () => void;
};

const DAECHER = [F.dach, F.klippe];

export function BildKarte({ orte, zahlen, heute, aktiv, figur, figurArt, gewaehlt, onWaehle, onNeuerOrt }: Props) {
  // Häuser und Einrichtungen gemeinsam von hinten nach vorn zeichnen
  const stehend = [
    ...BILD_HAEUSER.map(([x, y, d], i) => ({ art: "haus" as const, key: `h${i}`, x, y, d })),
    ...orte.map((o) => ({ art: "ort" as const, key: o.id, x: o.x, y: o.y, o })),
  ].sort((a, b) => a.y - b.y);

  return (
    <svg viewBox={`0 0 ${BILD.w} ${BILD.h}`} preserveAspectRatio="xMidYMid slice" className="kr-karte kr-bildkarte" role="group" aria-label="Karte von Heilbronn">
      <image href={BILD.src} x={0} y={0} width={BILD.w} height={BILD.h} />

      {stehend.map((s) =>
        s.art === "haus" ? (
          <g key={s.key} transform={`translate(${s.x},${s.y})`} aria-hidden="true">
            <ellipse cx={3} cy={1} rx={16} ry={4.5} fill="#2f4a2f" opacity={0.22} />
            <g transform="scale(0.78)"><Fachwerkhaus dach={DAECHER[s.d]} /></g>
          </g>
        ) : (
          <g
            key={s.key}
            transform={`translate(${s.x},${s.y})`}
            className={`kr-ort${aktiv !== null && !aktiv.has(s.o.id) ? " ist-gedimmt" : ""}${gewaehlt === s.o.id ? " ist-gewaehlt" : ""}`}
          >
            <InstitutGebaeude id={s.o.id} farbe={s.o.farbe} />
          </g>
        ),
      )}

      {/* Pins über allen Gebäuden, damit kein Haus ein Schild verdeckt */}
      {[...orte].sort((p, q) => p.y - q.y).map((o, i) => {
        const zahl = zahlen[o.id] ?? 0;
        const breite = o.name.length * 12 + 34;
        const links = o.x > BILD.w - 330;
        const waehle = () => onWaehle(o.id);
        return (
          <g
            key={o.id}
            transform={`translate(${o.x},${o.y - institutHoehe(o.id) - 4})`}
            className={`kr-ort${aktiv !== null && !aktiv.has(o.id) ? " ist-gedimmt" : ""}${gewaehlt === o.id ? " ist-gewaehlt" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`${o.name}${zahl ? `: ${zahl} Veranstaltungen` : ""}${heute?.has(o.id) ? ", heute ist etwas los" : ""}`}
            onClick={waehle}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), waehle())}
          >
            {/* große unsichtbare Klickfläche über Gebäude und Pin */}
            <rect x={-80} y={-100} width={160} height={100 + institutHoehe(o.id) + 10} fill="transparent" />
            <g className="kr-pin" style={{ animationDelay: `${i * 0.2}s` }}>
              <g transform={links ? `translate(${-18 - breite},-48)` : "translate(18,-48)"}>
                <rect x={0} y={-21} width={breite} height={42} rx={21} fill="#FFFFFF" stroke={o.farbe} strokeWidth={2} />
                <text x={links ? breite / 2 - 12 : breite / 2 + 12} y={7} textAnchor="middle" className="kr-name">{o.name}</text>
              </g>
              <path d="M0 0 C-6 -10 -26 -24 -26 -44 A26 26 0 1 1 26 -44 C26 -24 6 -10 0 0 Z" fill={o.farbe} stroke={F.wand} strokeWidth={4} />
              <g transform="translate(0,-44)"><PinZeichen name={o.symbol} /></g>
              {heute?.has(o.id) && (
                <g transform="translate(26,-84)" className="kr-heute">
                  <polygon className="kr-funkeln" points="0,-16 4.7,-5 16,-4.9 7,2.5 10,14 0,7.4 -10,14 -7,2.5 -16,-4.9 -4.7,-5" fill={F.orange} stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
                </g>
              )}
              {zahl > 0 && (
                <g transform="translate(-22,-72)">
                  <circle r={15} fill={F.orange} stroke={F.wand} strokeWidth={3} />
                  <text y={6} textAnchor="middle" className="kr-badge">{zahl}</text>
                </g>
              )}
            </g>
          </g>
        );
      })}

      {onNeuerOrt && (
        <g
          transform={`translate(${BILD_NEUER_ORT[0]},${BILD_NEUER_ORT[1]})`}
          className="kr-ort kr-neuer-ort"
          role="link"
          tabIndex={0}
          aria-label="Neuer Ort? Hier kann eine neue Einrichtung dazukommen"
          onClick={onNeuerOrt}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onNeuerOrt())}
        >
          <rect x={-70} y={-62} width={140} height={78} rx={18} fill={F.gras} stroke="#FFFFFF" strokeWidth={4} strokeDasharray="12 10" />
          <circle cx={0} cy={-24} r={20} fill="#FFFFFF" />
          <path d="M0 -34 V-14 M-10 -24 H10" stroke={F.lila} strokeWidth={4} strokeLinecap="round" />
          <g transform="translate(0,36)">
            <rect x={-62} y={-17} width={124} height={34} rx={17} fill="#FFFFFF" stroke={F.lila} strokeWidth={2} />
            <text y={6} textAnchor="middle" className="kr-name">Neuer Ort?</text>
          </g>
        </g>
      )}

      {figur && (
        <g className="kr-figur" style={{ transform: `translate(${figur[0]}px, ${figur[1]}px)` }} aria-hidden="true">
          <g transform="scale(0.42) translate(-80,-222)"><KinderFigur art={figurArt} /></g>
        </g>
      )}
    </svg>
  );
}
