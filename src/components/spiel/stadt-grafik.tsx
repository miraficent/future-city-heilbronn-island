import { memo, type ReactNode } from "react";
import type { Figur as FigurDaten } from "@/lib/figuren";
import type { Punkt } from "@/lib/spiel";
import { aufBahn, type Auto, type Stadt } from "@/lib/stadt";
import { Figur, type Blick } from "./figur";
import { PixelGrafik } from "./pixel-grafik";
import { Rakete } from "./rakete";
import { ThemenSymbol } from "./themen-symbol";

const WEG = "#f1dfb5";
const WEG_RAND = "#c9b483";
const GEHWEG = "#e6dccb";
const GEHWEG_RAND = "#b5ab98";
const ASPHALT = "#5d6b6e";

/** Auto von oben gesehen, im Pixel-Stil. Ursprung = Mitte, Fahrtrichtung = +x. */
export function AutoGrafik({ farbe }: { farbe: string }) {
  return (
    <g shapeRendering="crispEdges">
      <rect x="-37" y="-20" width="74" height="40" rx="9" fill="#1c1934" opacity="0.18" transform="translate(3 4)" />
      {[-24, 18].map((x) => [-21, 15].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="12" height="6" rx="2" fill="#1c1934" />))}
      <rect x="-36" y="-18" width="72" height="36" rx="10" fill={farbe} stroke="#254950" strokeWidth="3" />
      <rect x="-14" y="-14" width="30" height="28" rx="6" fill="#ffffff" opacity="0.18" />
      <rect x="14" y="-14" width="11" height="28" rx="3" fill="#bfe3ea" stroke="#254950" strokeWidth="2" />
      <rect x="-28" y="-13" width="8" height="26" rx="3" fill="#bfe3ea" stroke="#254950" strokeWidth="2" />
      <rect x="31" y="-15" width="5" height="7" rx="1" fill="#fff4b0" />
      <rect x="31" y="8" width="5" height="7" rx="1" fill="#fff4b0" />
      <rect x="-36" y="-15" width="4" height="6" fill="#e8513a" />
      <rect x="-36" y="9" width="4" height="6" fill="#e8513a" />
    </g>
  );
}

function Baum({ x, y, variante }: { x: number; y: number; variante: number }) {
  const b = 110 + variante * 14;
  return <PixelGrafik motiv="baum" x={x - b / 2} y={y - b * 1.15} breite={b} hoehe={b * 1.15} />;
}

function Busch({ x, y, variante }: { x: number; y: number; variante: number }) {
  const gruen = ["#6f9e5b", "#7fae62", "#5f8f50"][variante] ?? "#6f9e5b";
  return (
    <g transform={`translate(${x} ${y})`} shapeRendering="crispEdges">
      <ellipse cy="2" rx="30" ry="7" fill="#254950" opacity="0.15" />
      <rect x="-28" y="-26" width="56" height="28" rx="12" fill={gruen} stroke="#3f6b45" strokeWidth="3" />
      <rect x="-16" y="-36" width="32" height="18" rx="9" fill={gruen} stroke="#3f6b45" strokeWidth="3" />
      {variante === 1 && <><rect x="-12" y="-20" width="6" height="6" fill="#e8513a" /><rect x="8" y="-14" width="6" height="6" fill="#e8513a" /></>}
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
  return (
    <g shapeRendering="crispEdges">
      <rect x="0" y={oben - 46} width={tunnelBreite + 26} height={unten - oben + 70} fill="#8d8a7e" stroke="#4f4c45" strokeWidth="4" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={6 + (i % 2) * 18} y={oben - 40 + i * 30} width="26" height="14" fill="#a9a597" />
      ))}
      <rect x="0" y={oben - 4} width={tunnelBreite} height={unten - oben + 8} rx="6" fill="#1c1934" />
      <rect x="6" y={oben + 6} width={tunnelBreite - 18} height={unten - oben - 12} fill="#2b2846" />
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
      <circle cx={wende.x + 10} cy={wende.y} r={34} fill="#7fae62" stroke="#a7a99c" strokeWidth="6" />
      <Busch x={wende.x + 10} y={wende.y + 14} variante={1} />
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
  startet: boolean;
};

/** Alles, was stillsteht. Wird nur neu gezeichnet, wenn sich Fortschritt oder Türhinweis ändern. */
export const StadtKulisse = memo(function StadtKulisse({ stadt, teile, erledigt, nahesHausId, startet }: KulisseProps) {
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
            <Hausschild name={h.station.name} kurz={h.station.kurz} thema={h.station.symbol} farbe={h.station.farbe} erledigt={fertig} />
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
        <Rakete teile={teile} startet={startet} />
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
      <g transform={`translate(${stadt.teich.x + 40} ${stadt.teich.y - 10})`}>
        <g className="ente">
          <rect x="-14" y="-8" width="26" height="14" rx="6" fill="#fbf7ee" stroke="#254950" strokeWidth="2" />
          <rect x="6" y="-18" width="12" height="12" rx="4" fill="#fbf7ee" stroke="#254950" strokeWidth="2" />
          <rect x="17" y="-13" width="7" height="4" fill="#f2a900" />
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
            <AutoGrafik farbe={auto.farbe} />
          </g>
        );
      })}
      <g data-spielfigur transform={`translate(${position.x.toFixed(1)} ${position.y.toFixed(1)}) scale(${spiegeln ? -1 : 1} 1)`}>
        <Figur figur={figur} blick={blick} laeuft={laeuft} />
      </g>
    </>
  );
}
