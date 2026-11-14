/**
 * Gezeichnete Mini-Heilbronn-Karte (SVG, viewBox 0 0 1200 800, volle Breite).
 * Die Stadt geht über den Rand hinaus weiter (overflow: visible), damit die Karte
 * auf jedem Bildschirm randlos wirkt. Häuser werden einmalig und immer gleich verteilt
 * (fester Zufall), nie auf Fluss, Wegen, Parks oder Einrichtungen.
 */
import { useMemo } from "react";
import {
  ALTSTADT_HAEUSER, AUSSICHTSTURM, BAEUME, BRUECKEN, F, HAUPTBAHNHOF, KILIANSKIRCHE, NECKAR,
  PARKS, TEICH, WEGE, WEINBERG, punktAufKurve, type KartenOrt, type Kurve, type Pt,
} from "@/lib/kinderkarte";
import { GEBAEUDE_HOEHE, Gebaeude, PinZeichen } from "./gebaeude";

const RAND = { x: -700, y: -450, w: 2600, h: 1700 };
const BAHN_X = 118;
const DAECHER = [F.dach, "#d0624a", F.klippe, "#e8935f"];

const kurveD = (k: Kurve) => `M${k[0]} C${k[1]} ${k[2]} ${k[3]}`;
const NECKAR_D = `M340 ${RAND.y} L${NECKAR[0]![0]} ` + NECKAR.map((s) => `C${s[1]} ${s[2]} ${s[3]}`).join(" ") + ` L300 ${RAND.y + RAND.h}`;
const WELLEN = ([[0, 0.25], [0, 0.8], [1, 0.3], [1, 0.8], [2, 0.3]] as const).map(([s, t]) => punktAufKurve(NECKAR[s]!, t));

function zufall(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Punkte entlang mehrerer Kurven, für Abstandsprüfungen */
function stichproben(kurven: Kurve[], n: number): Pt[] {
  return kurven.flatMap((k) => Array.from({ length: n + 1 }, (_, i) => {
    const p = punktAufKurve(k, i / n);
    return [p.x, p.y] as Pt;
  }));
}

/** Stadt-Häuser: Raster mit Versatz, nur auf freien Flächen */
function verteileHaeuser(orte: KartenOrt[]) {
  const fluss = stichproben(NECKAR, 40);
  const wege = stichproben(WEGE, 24);
  const nah = (punkte: Pt[], x: number, y: number, d: number) => punkte.some(([px, py]) => Math.hypot(px - x, py - y) < d);
  const r = zufall(7);
  const liste: { x: number; y: number; dach: string; s: number }[] = [];
  for (let y = RAND.y + 30; y < RAND.y + RAND.h; y += 40) {
    for (let x = RAND.x + 20; x < RAND.x + RAND.w; x += 44) {
      const hx = x + (r() - 0.5) * 18;
      const hy = y + (r() - 0.5) * 14;
      if (r() < 0.32) continue; // Lücken = Gärten
      if (Math.abs(x - 600) > 900 && r() < 0.5) continue; // außen lockerer
      if (Math.abs(hx - BAHN_X) < 45 || hx < BAHN_X - 120) continue; // Bahn + Wald links
      if (nah(fluss, hx, hy, 52) || nah(wege, hx, hy, 20)) continue;
      if (orte.some((o) => Math.abs(hx - o.x) < 95 && hy > o.y - 150 && hy < o.y + 55)) continue;
      if (PARKS.some((p) => hx > p.x - 20 && hx < p.x + p.w + 20 && hy > p.y - 15 && hy < p.y + p.h + 25)) continue;
      if (hx > 830 && hx < 1130 && hy > 100 && hy < 280) continue; // Weinberg
      if (Math.hypot(hx - 755, hy - 405) < 120) continue; // Altstadt (eigene Häuser)
      if (Math.abs(hx - HAUPTBAHNHOF[0]) < 105 && hy > HAUPTBAHNHOF[1] - 100 && hy < HAUPTBAHNHOF[1] + 40) continue;
      if (Math.hypot(hx - TEICH.x, hy - TEICH.y) < 60) continue;
      liste.push({ x: hx, y: hy, dach: DAECHER[Math.floor(r() * DAECHER.length)]!, s: 0.85 + r() * 0.35 });
    }
  }
  return liste;
}

function verteileWald() {
  const r = zufall(23);
  const liste: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 220; i++) {
    const links = r() < 0.55;
    const x = links ? RAND.x + r() * (BAHN_X - 120 - RAND.x) : r() < 0.5 ? -700 + r() * 2600 : 1150 + r() * 750;
    const y = links ? RAND.y + r() * RAND.h : r() < 0.5 ? RAND.y + r() * 400 : 900 + r() * 350;
    liste.push({ x, y, r: 14 + r() * 14 });
  }
  return liste;
}

type Props = {
  orte: KartenOrt[];
  zahlen: Record<string, number>;
  aktiv: Set<string> | null;
  figur: Pt | null;
  gewaehlt: string | null;
  onWaehle: (id: string) => void;
};

export function InselKarte({ orte, zahlen, aktiv, figur, gewaehlt, onWaehle }: Props) {
  const haeuser = useMemo(() => verteileHaeuser(orte), [orte]);
  const wald = useMemo(() => verteileWald(), []);
  const [hx, hy] = HAUPTBAHNHOF;
  const [tx, ty] = AUSSICHTSTURM;
  const altstadt = [
    ...ALTSTADT_HAEUSER.map(([x, y]) => ({ x, y, kirche: false })),
    { x: KILIANSKIRCHE[0], y: KILIANSKIRCHE[1], kirche: true },
  ];
  // Alles, was steht, von hinten nach vorn zeichnen
  const stehend = [
    ...haeuser.map((h) => ({ ...h, art: "haus" as const })),
    ...altstadt.map((h) => ({ ...h, art: h.kirche ? ("kirche" as const) : ("alt" as const), dach: F.dach, s: 1 })),
  ].sort((a, b) => a.y - b.y);

  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" className="kr-karte" role="group" aria-label="Karte von Mini-Heilbronn">
      <defs>
        <clipPath id="kr-weinberg"><path d={WEINBERG} /></clipPath>
      </defs>

      {/* Boden über den Rand hinaus */}
      <rect x={RAND.x} y={RAND.y} width={RAND.w} height={RAND.h} fill={F.gras} />
      <ellipse cx={300} cy={140} rx={120} ry={40} fill={F.grasDunkel} opacity={0.45} />
      <ellipse cx={920} cy={580} rx={140} ry={44} fill={F.grasDunkel} opacity={0.45} />

      {/* Wege, Neckar, Bahn */}
      {WEGE.map((k, i) => <path key={i} d={kurveD(k)} fill="none" stroke={F.weg} strokeWidth={14} strokeLinecap="round" />)}
      <path d={NECKAR_D} fill="none" stroke={F.fluss} strokeWidth={50} strokeLinecap="round" />
      {WELLEN.map((w, i) => (
        <path key={i} d="M-10 0 q5 -5 10 0 t10 0" transform={`translate(${w.x},${w.y})`} fill="none" stroke={F.welle} strokeWidth={3} strokeLinecap="round" />
      ))}
      <g stroke="#8a7a66">
        <line x1={BAHN_X - 9} y1={RAND.y} x2={BAHN_X - 9} y2={RAND.y + RAND.h} strokeWidth={3} />
        <line x1={BAHN_X + 9} y1={RAND.y} x2={BAHN_X + 9} y2={RAND.y + RAND.h} strokeWidth={3} />
        {Array.from({ length: 90 }, (_, i) => (
          <line key={i} x1={BAHN_X - 14} x2={BAHN_X + 14} y1={RAND.y + i * 19} y2={RAND.y + i * 19} strokeWidth={4} opacity={0.5} />
        ))}
      </g>
      {/* Roter Zug am Hauptbahnhof */}
      <g transform={`translate(${BAHN_X},${hy - 120})`}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0,${i * 52})`}>
            <rect x={-13} y={0} width={26} height={48} rx={8} fill="#d9433a" />
            <rect x={-9} y={8} width={18} height={10} rx={3} fill={F.welle} />
            <rect x={-9} y={26} width={18} height={10} rx={3} fill={F.welle} />
          </g>
        ))}
      </g>

      {BRUECKEN.map((b, i) => (
        <g key={i} transform={`translate(${b.x},${b.y}) rotate(${b.winkel - 90})`}>
          <path d="M-40 -10 H40 V10 H22 A22 12 0 0 0 -22 10 H-40 Z" fill={F.klippe} />
          <rect x={-40} y={-12} width={80} height={5} rx={2.5} fill={F.sand} />
        </g>
      ))}

      <ellipse cx={TEICH.x} cy={TEICH.y} rx={TEICH.rx} ry={TEICH.ry} fill={F.fluss} />
      {PARKS.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={22} fill={F.grasDunkel} />
          <circle cx={p.x + 18} cy={p.y + 16} r={11} fill={F.baum} />
          <circle cx={p.x + p.w - 16} cy={p.y + 18} r={12} fill={F.baumHell} />
        </g>
      ))}

      {/* Weinberg mit Aussichtsturm */}
      <path d={WEINBERG} fill={F.grasDunkel} />
      <g clipPath="url(#kr-weinberg)" stroke={F.gras} strokeWidth={5} strokeLinecap="round">
        {Array.from({ length: 18 }, (_, i) => <line key={i} x1={837 + i * 17} y1={270} x2={887 + i * 17} y2={110} />)}
      </g>
      <rect x={tx - 7} y={ty - 28} width={14} height={28} fill={F.wand} />
      <polygon points={`${tx - 11},${ty - 28} ${tx},${ty - 42} ${tx + 11},${ty - 28}`} fill={F.dach} />

      {/* Wald am Rand + einzelne Bäume */}
      {wald.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={i % 3 ? F.baum : F.baumHell} />)}
      {BAEUME.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x + 3} cy={y + 4} r={r} fill={F.grasDunkel} />
          <circle cx={x} cy={y} r={r} fill={i % 2 ? F.baum : F.baumHell} />
        </g>
      ))}

      <ellipse cx={755} cy={410} rx={56} ry={26} fill={F.weg} />

      {/* Stadt: Häuser, Altstadt, Kilianskirche */}
      {stehend.map((h, i) =>
        h.art === "kirche" ? (
          <g key={i} transform={`translate(${h.x},${h.y})`}>
            <polygon points="34,0 34,-30 44,-36 44,-6" fill={F.sand} />
            <rect x={-6} y={-30} width={40} height={30} fill={F.wand} />
            <polygon points="-9,-30 14,-48 37,-30" fill={F.dach} />
            <polygon points="0,0 0,-96 8,-101 8,-5" fill={F.sand} />
            <rect x={-22} y={-96} width={22} height={96} fill={F.wand} />
            <polygon points="-25,-96 -11,-136 3,-96" fill={F.dach} />
            <circle cx={-11} cy={-78} r={6} fill={F.welle} />
          </g>
        ) : (
          <g key={i} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
            <polygon points="11,0 11,-18 17,-22 17,-4" fill={F.sand} />
            <rect x={-11} y={-18} width={22} height={18} fill={F.wand} />
            <rect x={-6} y={-13} width={5} height={5} fill={F.welle} />
            <polygon points="0,-31 13,-18 19,-22 6,-35" fill={F.klippe} />
            <polygon points="-13,-18 0,-31 13,-18" fill={h.dach} />
          </g>
        ),
      )}

      {/* Hauptbahnhof */}
      <g transform={`translate(${hx},${hy})`}>
        <polygon points="60,0 60,-40 76,-48 76,-8" fill={F.sand} />
        <rect x={-60} y={-40} width={120} height={40} fill="#f0d79a" />
        <rect x={-64} y={-46} width={128} height={8} rx={3} fill="#5b6b8a" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-54 + i * 30} y={-30} width={18} height={22} rx={9} fill={F.welle} />)}
        <rect x={-14} y={-72} width={28} height={28} fill="#f0d79a" />
        <polygon points="-18,-72 0,-88 18,-72" fill="#5b6b8a" />
        <circle cx={0} cy={-58} r={9} fill="#fff" stroke={F.text} strokeWidth={2} />
        <path d="M0 -58 V-64 M0 -58 H5" stroke={F.text} strokeWidth={2} strokeLinecap="round" />
      </g>

      {/* Einrichtungen: Haus + Pin mit Namensschild rechts daneben */}
      {[...orte].sort((p, q) => p.y - q.y).map((o, i) => {
        const zahl = zahlen[o.id] ?? 0;
        const gedimmt = aktiv !== null && !aktiv.has(o.id);
        const leuchtet = aktiv !== null && aktiv.has(o.id);
        const pinY = -GEBAEUDE_HOEHE[o.gebaeude] - 10;
        const breite = o.name.length * 12 + 34;
        const waehle = () => onWaehle(o.id);
        return (
          <g
            key={o.id}
            transform={`translate(${o.x},${o.y})`}
            className={`kr-ort${gedimmt ? " ist-gedimmt" : ""}${leuchtet ? " leuchtet" : ""}${gewaehlt === o.id ? " ist-gewaehlt" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={zahl ? `${o.name}: ${zahl} passende Angebote` : o.name}
            onClick={waehle}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), waehle())}
          >
            {leuchtet && <ellipse cx={0} cy={0} rx={95} ry={24} fill={F.orange} opacity={0.4} className="kr-schein" />}
            <Gebaeude art={o.gebaeude} farbe={o.farbe} symbol={o.symbol} />
            <g transform={`translate(0,${pinY})`}>
              <g className="kr-pin" style={{ animationDelay: `${i * 0.2}s` }}>
                {/* Schild rechts vom Pin – am rechten Kartenrand links davon, damit nichts abgeschnitten wird */}
                <g transform={o.x > 880 ? `translate(${-18 - breite},-48)` : "translate(18,-48)"}>
                  <rect x={0} y={-21} width={breite} height={42} rx={21} fill={F.wand} stroke={F.text} strokeOpacity={0.15} strokeWidth={2} />
                  <text x={o.x > 880 ? breite / 2 - 12 : breite / 2 + 12} y={7} textAnchor="middle" className="kr-name">{o.name}</text>
                </g>
                <path d="M0 0 C-6 -10 -26 -24 -26 -44 A26 26 0 1 1 26 -44 C26 -24 6 -10 0 0 Z" fill={o.farbe} stroke={F.wand} strokeWidth={4} />
                <g transform="translate(0,-44)"><PinZeichen name={o.symbol} /></g>
                {zahl > 0 && (
                  <g transform="translate(-22,-72)">
                    <circle r={15} fill={F.orange} stroke={F.wand} strokeWidth={3} />
                    <text y={6} textAnchor="middle" className="kr-badge">{zahl}</text>
                  </g>
                )}
              </g>
            </g>
          </g>
        );
      })}

      {/* Figur – läuft per CSS-Übergang zum gewählten Haus */}
      {figur && (
        <g className="kr-figur" style={{ transform: `translate(${figur[0]}px, ${figur[1]}px)` }} aria-hidden="true">
          <ellipse cx={0} cy={2} rx={14} ry={5} fill={F.text} opacity={0.2} />
          <rect x={-7} y={-20} width={5} height={14} rx={2} fill="#3d5a80" />
          <rect x={2} y={-20} width={5} height={14} rx={2} fill="#3d5a80" />
          <rect x={-10} y={-40} width={20} height={22} rx={8} fill="#3D7BE8" />
          <circle cx={0} cy={-50} r={11} fill="#f5c9a0" />
          <path d="M-11 -52 A11 11 0 0 1 11 -52 L11 -55 A11 9 0 0 0 -11 -55 Z" fill="#6b3e26" />
          <circle cx={0} cy={-63} r={5} fill="#6b3e26" />
          <circle cx={-4} cy={-50} r={1.6} fill={F.text} />
          <circle cx={4} cy={-50} r={1.6} fill={F.text} />
          <path d="M-4 -45 Q0 -42 4 -45" stroke={F.text} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
