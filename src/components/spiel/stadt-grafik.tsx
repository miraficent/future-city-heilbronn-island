import { memo, type ReactNode } from "react";
import type { Figur as FigurDaten } from "@/lib/figuren";
import type { Punkt } from "@/lib/spiel";
import { aufBahn, INSEL_RADIUS, type Auto, type Stadt } from "@/lib/stadt";
import { Figur, type Blick } from "./figur";
import { PixelGrafik } from "./pixel-grafik";
import { Rakete } from "./rakete";
import { ThemenSymbol } from "./themen-symbol";

function abdunkeln(hex: string, faktor: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(faktor >= 1 ? c + (255 - c) * (faktor - 1) : c * faktor));
  return `#${k.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

const WEG = "#f1dfb5";
const WEG_RAND = "#c9b483";
const GEHWEG = "#e6dccb";
const GEHWEG_RAND = "#b5ab98";
const ASPHALT = "#5d6b6e";

/** Auto von oben gesehen, im Pixel-Stil. Ursprung = Mitte, Fahrtrichtung = +x. */
export function AutoGrafik({ farbe, art = "auto" }: { farbe: string; art?: "auto" | "bus" }) {
  const dunkel = abdunkeln(farbe, 0.75);
  if (art === "bus") {
    return (
      <g>
        <rect x="-62" y="-24" width="124" height="48" rx="10" fill="#1c1934" opacity="0.16" transform="translate(4 5)" />
        {[-44, 34].map((x) => [-25, 19].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="16" height="7" rx="3" fill="#1c1934" />))}
        <rect x="-60" y="-22" width="120" height="44" rx="10" fill={farbe} stroke="#254950" strokeWidth="3" />
        <rect x="-56" y="-18" width="112" height="36" rx="7" fill={abdunkeln(farbe, 1.08)} />
        {[-44, -26, -8, 10, 28].map((x) => <rect key={x} x={x} y="-14" width="14" height="28" rx="3" fill="#bfe3ea" stroke="#254950" strokeWidth="1.5" />)}
        <rect x="46" y="-16" width="10" height="32" rx="3" fill="#bfe3ea" stroke="#254950" strokeWidth="2" />
        <rect x="-60" y="-3" width="120" height="6" fill={dunkel} opacity="0.5" />
        <rect x="56" y="-18" width="5" height="8" rx="2" fill="#fff4b0" />
        <rect x="56" y="10" width="5" height="8" rx="2" fill="#fff4b0" />
        <rect x="-61" y="-17" width="4" height="7" fill="#e8513a" />
        <rect x="-61" y="10" width="4" height="7" fill="#e8513a" />
      </g>
    );
  }
  return (
    <g>
      <rect x="-38" y="-21" width="76" height="42" rx="12" fill="#1c1934" opacity="0.16" transform="translate(4 5)" />
      {[-26, 14].map((x) => [-23, 16].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="14" height="7" rx="3" fill="#1c1934" />))}
      <rect x="-37" y="-19" width="74" height="38" rx="13" fill={farbe} stroke="#254950" strokeWidth="3" />
      <rect x="-31" y="-15" width="60" height="9" rx="4" fill="#ffffff" opacity="0.22" />
      <rect x="-37" y="9" width="74" height="10" rx="5" fill={dunkel} opacity="0.55" />
      <path d="M8-15h13q5 0 5 5v20q0 5-5 5H8Z" fill="#bfe3ea" stroke="#254950" strokeWidth="2" />
      <path d="M-24-14h7v28h-7q-4 0-4-4v-20q0-4 4-4Z" fill="#bfe3ea" stroke="#254950" strokeWidth="2" />
      <rect x="-15" y="-14" width="21" height="28" rx="4" fill={dunkel} />
      <rect x="-12" y="-11" width="8" height="5" rx="2" fill="#ffffff" opacity="0.3" />
      <rect x="10" y="-22" width="6" height="4" rx="1.5" fill={farbe} stroke="#254950" strokeWidth="1.5" />
      <rect x="10" y="18" width="6" height="4" rx="1.5" fill={farbe} stroke="#254950" strokeWidth="1.5" />
      <rect x="32" y="-16" width="5" height="8" rx="2" fill="#fff4b0" />
      <rect x="32" y="8" width="5" height="8" rx="2" fill="#fff4b0" />
      <rect x="-38" y="-15" width="4" height="7" rx="1" fill="#e8513a" />
      <rect x="-38" y="8" width="4" height="7" rx="1" fill="#e8513a" />
    </g>
  );
}

function Baum({ x, y, variante }: { x: number; y: number; variante: number }) {
  const b = 110 + variante * 14;
  return <PixelGrafik motiv="baum" x={x - b / 2} y={y - b * 1.15} breite={b} hoehe={b * 1.15} />;
}

function Busch({ x, y, variante }: { x: number; y: number; variante: number }) {
  const gruen = ["#6f9e5b", "#7fae62", "#5f8f50"][variante] ?? "#6f9e5b";
  const hell = abdunkeln(gruen, 1.25);
  const dunkel = abdunkeln(gruen, 0.72);
  const bluete = ["#f08cb4", "#f2c94c", "#ffffff"][variante] ?? "#ffffff";
  const kugeln: Array<[number, number, number]> = [[-18, -14, 17], [18, -14, 17], [0, -26, 20], [-6, -10, 18], [10, -8, 16]];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="3" rx="34" ry="8" fill="#254950" opacity="0.15" />
      {kugeln.map(([cx, cy, r], i) => <circle key={`k${i}`} cx={cx} cy={cy} r={r + 3} fill="#3f6b45" />)}
      {kugeln.map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill={gruen} />)}
      <path d="M-30-6q30 14 60 0v6q-30 10-60 0Z" fill={dunkel} opacity="0.6" />
      {[[-8, -34, 7], [12, -22, 6], [-22, -20, 5]].map(([cx, cy, r], i) => <circle key={`h${i}`} cx={cx} cy={cy} r={r} fill={hell} opacity="0.8" />)}
      {[[-14, -18], [6, -30], [16, -12], [-2, -12]].map(([bx, by], i) => (
        <g key={`b${i}`} transform={`translate(${bx} ${by})`}>
          <circle r="3.2" fill={bluete} stroke={dunkel} strokeWidth="1" />
          <circle r="1.2" fill="#f2a900" />
        </g>
      ))}
    </g>
  );
}

function Blume({ x, y, variante }: { x: number; y: number; variante: number }) {
  const farbe = ["#e6b65e", "#c596c0", "#e8513a"][variante] ?? "#e6b65e";
  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      <rect x="-1" y="-6" width="2" height="8" fill="#5f8f50" />
      <path d="M-7-10h4v-4h6v4h4v6H3v4h-6v-4h-4Z" fill={farbe} />
      <rect x="-2" y="-9" width="4" height="4" fill="#fff4d9" />
    </g>
  );
}

function Laterne({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      <ellipse cy="2" rx="10" ry="3" fill="#254950" opacity="0.2" />
      <rect x="-3" y="-78" width="6" height="80" fill="#3b4a50" />
      <rect x="-9" y="-92" width="18" height="16" rx="3" fill="#fff4b0" stroke="#3b4a50" strokeWidth="3" />
      <circle cx="0" cy="-84" r="22" fill="#fff4b0" opacity="0.18" />
    </g>
  );
}

function Tunnel({ stadt }: { stadt: Stadt }) {
  const { oben, unten, tunnelBreite } = stadt.strasse;
  const h = unten - oben;
  return (
    <g>
      <rect x={tunnelBreite - 4} y={oben - 22} width="34" height={h + 44} rx="6" fill="#9b968a" stroke="#4f4c45" strokeWidth="3" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={tunnelBreite + (i % 2) * 12} y={oben - 16 + i * ((h + 32) / 6)} width="16" height="12" rx="2" fill="#b7b2a4" />
      ))}
      <rect x="0" y={oben} width={tunnelBreite + 4} height={h} fill="#1c1934" />
      <rect x={tunnelBreite - 26} y={oben + 6} width="26" height={h - 12} fill="#2b2846" />
      {[oben + 14, unten - 18].map((ly) => <rect key={ly} x={tunnelBreite - 18} y={ly} width="10" height="4" rx="2" fill="#f6d77a" />)}
    </g>
  );
}

/** Der Hügel über dem Tunnel – liegt über den Autos, damit sie wirklich im Tunnel verschwinden. */
export function TunnelHuegel({ stadt }: { stadt: Stadt }) {
  const { oben, unten, tunnelBreite } = stadt.strasse;
  const mitte = (oben + unten) / 2;
  return (
    <g pointerEvents="none">
      <path d={`M-40 ${oben - 130} Q${tunnelBreite + 40} ${oben - 110} ${tunnelBreite + 6} ${mitte} Q${tunnelBreite + 40} ${unten + 110} -40 ${unten + 130} Z`} fill="#8fb874" stroke="#4f7a45" strokeWidth="4" />
      <path d={`M-40 ${oben - 100} Q${tunnelBreite} ${oben - 80} ${tunnelBreite - 16} ${mitte} Q${tunnelBreite} ${unten + 80} -40 ${unten + 100} Z`} fill="#a3c98a" />
      {[[10, oben - 70], [26, unten + 60], [-6, mitte - 10]].map(([bx, by], i) => (
        <g key={i} transform={`translate(${bx} ${by})`}>
          <rect x="-3" y="-4" width="6" height="12" fill="#7a5233" />
          <circle cy="-14" r="16" fill="#5f8f50" stroke="#3f6b45" strokeWidth="3" />
          <circle cx="-5" cy="-19" r="6" fill="#7fae62" />
        </g>
      ))}
      <g transform={`translate(${tunnelBreite + 16} ${oben - 34})`}>
        <rect x="-26" y="-14" width="52" height="24" rx="5" fill="#fbf7ee" stroke="#254950" strokeWidth="3" />
        <path d="M-15 6v-6a15 15 0 0 1 30 0v6" fill="#1c1934" />
      </g>
    </g>
  );
}

function Strasse({ stadt }: { stadt: Stadt }) {
  const { oben, unten, wende } = stadt.strasse;
  const mitte = (oben + unten) / 2;
  return (
    <g>
      <rect x="0" y={oben - 8} width={wende.x} height={unten - oben + 16} fill="#a7a99c" />
      <circle cx={wende.x} cy={wende.y} r={wende.r + 8} fill="#a7a99c" />
      <rect x="0" y={oben} width={wende.x} height={unten - oben} fill={ASPHALT} />
      <circle cx={wende.x} cy={wende.y} r={wende.r} fill={ASPHALT} />
      <circle cx={wende.x} cy={wende.y} r={INSEL_RADIUS} fill="#7fae62" stroke="#c9c5b5" strokeWidth="6" />
      <g transform={`translate(${wende.x} ${wende.y + 12}) scale(0.6)`}>
        <Busch x={0} y={0} variante={1} />
      </g>
      <path d={`M${stadt.strasse.tunnelBreite + 30} ${mitte}H${wende.x - 70}`} stroke="#f3ecdc" strokeWidth="4" strokeDasharray="28 24" />
      {stadt.zebras.map((z, i) => (
        <g key={i} shapeRendering="crispEdges">
          {Array.from({ length: Math.floor(z.hoehe / 20) }, (_, n) => (
            <rect key={n} x={z.x + 4} y={z.y + 6 + n * 20} width={z.breite - 8} height="10" fill="#fbf7ee" />
          ))}
        </g>
      ))}
      <g transform={`translate(${wende.x + wende.r + 40} ${wende.y - 70})`} shapeRendering="crispEdges">
        <rect x="-3" y="0" width="6" height="56" fill="#3b4a50" />
        <rect x="-22" y="-34" width="44" height="40" rx="5" fill="#2f4bff" stroke="#fbf7ee" strokeWidth="3" />
        <rect x="-4" y="-18" width="8" height="20" fill="#fbf7ee" />
        <rect x="-12" y="-26" width="24" height="9" fill="#e8513a" stroke="#fbf7ee" strokeWidth="2" />
      </g>
    </g>
  );
}

function Wegenetz({ stadt }: { stadt: Stadt }) {
  const n = new Map(stadt.knoten.map((k) => [k.id, k]));
  const linien = stadt.kanten
    .filter((k) => k.art !== "zebra" && k.art !== "platz")
    .map((k) => ({ k, a: n.get(k.von)!, b: n.get(k.nach)! }))
    .filter(({ a, b }) => a && b);
  return (
    <g strokeLinecap="round">
      {linien.map(({ k, a, b }, i) => (
        <line key={`r${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={k.art === "gehweg" ? GEHWEG_RAND : WEG_RAND} strokeWidth={k.breite + 8} />
      ))}
      {linien.map(({ k, a, b }, i) => (
        <line key={`f${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={k.art === "gehweg" ? GEHWEG : WEG} strokeWidth={k.breite} />
      ))}
      <circle cx={stadt.platz.x} cy={stadt.platz.y} r={stadt.platz.r + 4} fill={WEG_RAND} />
      <circle cx={stadt.platz.x} cy={stadt.platz.y} r={stadt.platz.r} fill="url(#pflaster)" />
      <circle cx={stadt.platz.x} cy={stadt.platz.y} r={stadt.platz.r - 26} fill="none" stroke="#e3cfa0" strokeWidth="6" strokeDasharray="10 10" />
    </g>
  );
}

function Hausschild({ name, kurz, thema, farbe, erledigt }: { name: string; kurz: string; thema: string; farbe: string; erledigt: boolean }) {
  return (
    <g transform="translate(0 -18)" className="haus-schild">
      <rect x="-104" y="-50" width="208" height="54" rx="12" fill="#fff7df" stroke="#254950" strokeWidth="3" />
      <rect x="-98" y="-44" width="42" height="42" rx="9" fill={farbe} stroke="#254950" strokeWidth="2" />
      <g transform="translate(-77 -23)"><ThemenSymbol thema={thema} groesse={26} /></g>
      <text x="-48" y="-25" fill="#1c1934" fontSize="19" fontWeight="800">{kurz}</text>
      <text x="-48" y="-7" fill="#4a4560" fontSize="13">{name}</text>
      {erledigt && (
        <g transform="translate(96 -48)">
          <circle r="16" fill="#5dbb63" stroke="#fbf7ee" strokeWidth="3" />
          <path d="m-7 0 5 5 9-10" fill="none" stroke="#fbf7ee" strokeWidth="3.5" />
        </g>
      )}
    </g>
  );
}

type KulisseProps = {
  stadt: Stadt;
  teile: string[];
  erledigt: string[];
  nahesHausId?: string;
  rakete: "bereit" | "startet" | "weg";
};

/** Alles, was stillsteht. Wird nur neu gezeichnet, wenn sich Fortschritt oder Türhinweis ändern. */
export const StadtKulisse = memo(function StadtKulisse({ stadt, teile, erledigt, nahesHausId, rakete }: KulisseProps) {
  const schichten: Array<{ id: string; y: number; node: ReactNode }> = [];

  for (const d of stadt.deko) {
    if (d.art === "blume") continue;
    schichten.push({
      id: d.id,
      y: d.y,
      node: d.art === "baum" ? <Baum {...d} /> : d.art === "busch" ? <Busch {...d} /> : d.art === "laterne" ? <Laterne {...d} /> : <PixelGrafik motiv="bank" x={d.x - 48} y={d.y - 46} breite={96} hoehe={52} />,
    });
  }

  for (const h of stadt.haeuser) {
    const fertig = erledigt.includes(h.station.id);
    const nah = nahesHausId === h.station.id;
    schichten.push({
      id: `haus-${h.station.id}`,
      y: h.bodenY,
      node: (
        <g data-haus={h.station.id} className={`stadt-haus ${nah ? "ist-nah" : ""}`}>
          <PixelGrafik motiv={h.station.grafik} x={h.flaeche.x} y={h.flaeche.y + 10} breite={h.flaeche.breite} hoehe={h.flaeche.hoehe - 10} />
          <g transform={`translate(${h.mitteX} ${h.dachY})`}>
            <Hausschild name={h.station.name} kurz={h.station.kurz} thema={h.station.aufgabe} farbe={h.station.farbe} erledigt={fertig} />
          </g>
          {nah && (
            <g transform={`translate(${h.tuer.x} ${h.tuer.y - 74})`}>
              <g className="tuer-hinweis">
                <circle r="24" fill="#2f4bff" stroke="#fbf7ee" strokeWidth="4" />
                <path d="M-9-4 0 6 9-4" fill="none" stroke="#fbf7ee" strokeWidth="5" />
              </g>
            </g>
          )}
        </g>
      ),
    });
  }

  schichten.push({
    id: "rakete",
    y: stadt.platz.y + 40,
    node: (
      <g data-rakete transform={`translate(${stadt.platz.x} ${stadt.platz.y + 40})`}>
        <Rakete teile={teile} zustand={rakete} stationen={stadt.haeuser.map((h) => ({ teil: h.station.teil, farbe: h.station.farbe, aufgabe: h.station.aufgabe }))} />
      </g>
    ),
  });

  return (
    <>
      <defs>
        <pattern id="rasen" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="#d6e5bf" />
          <path d="M8 13h3v3H8zm23 20h3v3h-3zM18 40h5v2h-5zM38 8h2v4h-2z" fill="#b7d09e" />
        </pattern>
        <pattern id="wasser" width="32" height="24" patternUnits="userSpaceOnUse">
          <rect width="32" height="24" fill="#7eb9c2" />
          <path d="M3 8h12v3H3zm15 12h10v2H18z" fill="#afd6d5" />
        </pattern>
        <pattern id="pflaster" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill="#f1dfb5" />
          <path d="M0 14h28M14 0v14M7 14v14M21 14v14" stroke="#e3cfa0" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width={stadt.breite} height={stadt.hoehe} fill="url(#rasen)" />
      <ellipse cx={stadt.teich.x} cy={stadt.teich.y} rx={stadt.teich.rx + 12} ry={stadt.teich.ry + 12} fill="#a5bd8b" />
      <ellipse cx={stadt.teich.x} cy={stadt.teich.y} rx={stadt.teich.rx} ry={stadt.teich.ry} fill="url(#wasser)" />
      <g transform={`translate(${stadt.teich.x} ${stadt.teich.y})`}>
        <g className="enten">
          {[{ x: 40, y: -6, k: 1 }, { x: 78, y: 4, k: 0.6 }, { x: 104, y: 10, k: 0.6 }].map((e, i) => (
            <g key={i} transform={`translate(${e.x} ${e.y}) scale(${e.k})`}>
              <ellipse cy="9" rx="24" ry="5" fill="#ffffff" opacity="0.35" />
              <path d="M-20 0q0-14 18-14h12q10 0 12 10l4-6v12q-4 10-24 10H-8q-12 0-12-12Z" fill={i ? "#f6d77a" : "#fbf7ee"} stroke="#254950" strokeWidth="2.5" />
              <path d="M-8-4q6 8 16 0" fill="none" stroke={i ? "#d9b24f" : "#c9c2b0"} strokeWidth="2.5" />
              <circle cx="-14" cy="-16" r="9" fill={i ? "#f6d77a" : "#fbf7ee"} stroke="#254950" strokeWidth="2.5" />
              <circle cx="-17" cy="-18" r="1.8" fill="#1c1934" />
              <path d="M-23-15h-9l3 4h6Z" fill="#f2a900" stroke="#254950" strokeWidth="1.5" />
            </g>
          ))}
        </g>
      </g>
      <Strasse stadt={stadt} />
      <Wegenetz stadt={stadt} />
      <Tunnel stadt={stadt} />
      {stadt.deko.filter((d) => d.art === "blume").map((d) => <Blume key={d.id} {...d} />)}
      {schichten.sort((a, b) => a.y - b.y).map((s) => (
        <g key={s.id}>{s.node}</g>
      ))}
    </>
  );
});

type LebenProps = {
  stadt: Stadt;
  figur: FigurDaten;
  position: Punkt;
  blick: Blick;
  spiegeln: boolean;
  laeuft: boolean;
  autos: Auto[];
  ziel?: Punkt;
};

/** Was sich bewegt: Autos, Zielmarke, Spielfigur. */
export function StadtLeben({ stadt, figur, position, blick, spiegeln, laeuft, autos, ziel }: LebenProps) {
  return (
    <>
      {ziel && (
        <g transform={`translate(${ziel.x} ${ziel.y})`}>
          <g className="ziel-marke">
            <ellipse rx="22" ry="9" fill="none" stroke="#2f4bff" strokeWidth="4" />
            <ellipse rx="10" ry="4" fill="#2f4bff" />
          </g>
        </g>
      )}
      {autos.map((auto) => {
        const { punkt, winkel } = aufBahn(stadt.autoBahn, auto.s);
        return (
          <g key={auto.id} transform={`translate(${punkt.x.toFixed(1)} ${punkt.y.toFixed(1)}) rotate(${((winkel * 180) / Math.PI).toFixed(1)})`}>
            <AutoGrafik farbe={auto.farbe} art={auto.art} />
          </g>
        );
      })}
      <g data-spielfigur transform={`translate(${position.x.toFixed(1)} ${position.y.toFixed(1)}) scale(${spiegeln ? -1 : 1} 1)`}>
        <Figur figur={figur} blick={blick} laeuft={laeuft} />
      </g>
    </>
  );
}
