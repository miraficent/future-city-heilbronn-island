import { memo, type ReactNode } from "react";
import type { AvatarKonfiguration } from "@/lib/avatar";
import type { Bewohner } from "@/lib/bewohner";
import type { Punkt } from "@/lib/spiel";
import { aufBahn, INSEL_RADIUS, type Auto, type Stadt, type Wahrzeichen } from "@/lib/stadt";
import { Avatar } from "./avatar";
import type { Blick } from "./figur";
import { hausBildMass, PixelGrafik, Roboter } from "./pixel-grafik";
import { Rakete } from "./rakete";
import { ThemenSymbol } from "./themen-symbol";

/*
 * Die Spielwelt im gemalten Stil: weiche Verläufe statt Pixel. Heilbronn erkennt man an der Kilianskirche,
 * dem Rathaus mit Kunstuhr, den Weinbergen am Wartberg, dem Neckar mit der MS Experimenta und der Stadtbahn.
 */

function abdunkeln(hex: string, faktor: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(faktor >= 1 ? c + (255 - c) * (faktor - 1) : c * faktor));
  return `#${k.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

const WEG = "#efdcb2";
const WEG_RAND = "#d6c193";
const GEHWEG = "#e8dfcf";
const GEHWEG_RAND = "#c9bea9";
/** Höhe einer Figur in der Welt (Einheiten). */
const FIGUR_HOEHE = 108;

/** Fahrzeug von oben. Ursprung = Mitte, Fahrtrichtung = +x. Die Stadtbahn ist gelb wie in Heilbronn. */
export function AutoGrafik({ farbe, art = "auto" }: { farbe: string; art?: "auto" | "bus" }) {
  const dunkel = abdunkeln(farbe, 0.75);
  if (art === "bus") {
    return (
      <g>
        <rect x="-66" y="-24" width="132" height="48" rx="14" fill="#1c1934" opacity="0.14" transform="translate(4 6)" />
        <rect x="-64" y="-22" width="128" height="44" rx="16" fill="#f4c430" stroke="#5a4a1c" strokeWidth="2.5" />
        <rect x="-64" y="-6" width="128" height="12" fill="#d64a3a" opacity="0.9" />
        <rect x="-58" y="-17" width="116" height="9" rx="4" fill="#fff6c9" opacity="0.45" />
        {[-46, -24, -2, 20, 42].map((x) => <rect key={x} x={x} y="-15" width="16" height="30" rx="5" fill="#bfe3ea" opacity="0.85" />)}
        <path d="M-8-22v-8m16 8v-8M-12-30h24" stroke="#5a4a1c" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="58" cy="-14" r="3.5" fill="#fff4b0" />
        <circle cx="58" cy="14" r="3.5" fill="#fff4b0" />
        <rect x="-30" y="-5" width="26" height="10" rx="3" fill="#fffaf0" />
        <text x="-17" y="3.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#d64a3a">S4</text>
      </g>
    );
  }
  return (
    <g>
      <rect x="-38" y="-21" width="76" height="42" rx="14" fill="#1c1934" opacity="0.14" transform="translate(4 6)" />
      {[-26, 14].map((x) => [-23, 16].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="14" height="7" rx="3.5" fill="#2b2a38" />))}
      <rect x="-37" y="-19" width="74" height="38" rx="15" fill={farbe} />
      <rect x="-37" y="5" width="74" height="14" rx="7" fill={dunkel} opacity="0.45" />
      <rect x="-31" y="-15" width="60" height="8" rx="4" fill="#ffffff" opacity="0.3" />
      <path d="M8-15h12q6 0 6 6v18q0 6-6 6H8Z" fill="#cfeaf0" />
      <path d="M-24-14h7v28h-7q-4 0-4-4v-20q0-4 4-4Z" fill="#cfeaf0" />
      <rect x="-15" y="-14" width="21" height="28" rx="6" fill={dunkel} />
      <circle cx="33" cy="-12" r="3" fill="#fff4b0" />
      <circle cx="33" cy="12" r="3" fill="#fff4b0" />
    </g>
  );
}

function Busch({ x, y, variante }: { x: number; y: number; variante: number }) {
  const bluete = ["#f4a6c6", "#f6d36b", "#ffffff"][variante] ?? "#ffffff";
  const kugeln: Array<[number, number, number]> = [[-18, -12, 17], [18, -12, 17], [0, -24, 20], [-4, -8, 18], [10, -6, 16]];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="3" rx="36" ry="8" fill="url(#schatten)" />
      {kugeln.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="url(#laub)" />)}
      {[[-8, -32, 6], [12, -20, 5], [-20, -18, 4]].map(([cx, cy, r], i) => <circle key={`h${i}`} cx={cx} cy={cy} r={r} fill="#dcef9f" opacity="0.6" />)}
      {[[-14, -18], [6, -30], [16, -10], [-2, -10]].map(([bx, by], i) => (
        <g key={`b${i}`} transform={`translate(${bx} ${by})`}>
          <circle r="3.4" fill={bluete} />
          <circle r="1.3" fill="#f2a900" />
        </g>
      ))}
    </g>
  );
}

function Blume({ x, y, variante }: { x: number; y: number; variante: number }) {
  const farbe = ["#f2b84b", "#c9a0dc", "#ef7d6a"][variante] ?? "#f2b84b";
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 2q-1-6 0-10" stroke="#6b9a52" strokeWidth="1.8" fill="none" />
      {[0, 72, 144, 216, 288].map((w) => (
        <ellipse key={w} cx="0" cy="-13" rx="3" ry="4.2" fill={farbe} transform={`rotate(${w} 0 -10)`} />
      ))}
      <circle cy="-10" r="2.4" fill="#fff4cf" />
    </g>
  );
}

/** Alte Straßenlaterne wie in der Heilbronner Innenstadt. */
function Laterne({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="2" rx="12" ry="4" fill="url(#schatten)" />
      <circle cy="-84" r="26" fill="#fff1b8" opacity="0.18" />
      <path d="M-5 0h10l-2-10h-6Z" fill="#2f4a42" />
      <rect x="-2.5" y="-74" width="5" height="66" rx="2" fill="#35524a" />
      <path d="M-11-76h22l-4-18h-14Z" fill="#fff1b8" stroke="#2f4a42" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-13-94h26l-13-8Z" fill="#2f4a42" />
    </g>
  );
}

/** Tunnelportal aus Sandstein unter dem Weinberg. */
function Tunnel({ stadt }: { stadt: Stadt }) {
  const { oben, unten, tunnelBreite } = stadt.strasse;
  const h = unten - oben;
  return (
    <g>
      <rect x={tunnelBreite - 6} y={oben - 22} width="36" height={h + 44} rx="8" fill="#c9a77f" />
      <rect x={tunnelBreite + 18} y={oben - 22} width="12" height={h + 44} rx="4" fill="#a8865f" opacity="0.6" />
      <rect x="0" y={oben} width={tunnelBreite + 4} height={h} fill="#26243a" />
      <rect x={tunnelBreite - 26} y={oben + 6} width="26" height={h - 12} fill="#34314d" />
      {[oben + 14, unten - 18].map((ly) => <rect key={ly} x={tunnelBreite - 18} y={ly} width="10" height="4" rx="2" fill="#f6d77a" />)}
    </g>
  );
}

/** Rebzeilen auf einem Hang. */
function Reben({ x, y, breite, hoehe, zeilen }: { x: number; y: number; breite: number; hoehe: number; zeilen: number }) {
  return (
    <g>
      {Array.from({ length: zeilen }, (_, i) => {
        const ry = y + ((i + 0.5) / zeilen) * hoehe;
        return <path key={i} d={`M${x} ${ry}q${breite / 2} -10 ${breite} 0`} stroke="#5e8f3e" strokeWidth="6" strokeDasharray="7 5" strokeLinecap="round" fill="none" opacity="0.85" />;
      })}
    </g>
  );
}

/** Der Weinberg über dem Tunnel – liegt über den Autos, damit sie wirklich im Tunnel verschwinden. */
export function TunnelHuegel({ stadt }: { stadt: Stadt }) {
  const { oben, unten, tunnelBreite } = stadt.strasse;
  const mitte = (oben + unten) / 2;
  return (
    <g pointerEvents="none">
      <path d={`M-40 ${oben - 130} Q${tunnelBreite + 40} ${oben - 110} ${tunnelBreite + 6} ${mitte} Q${tunnelBreite + 40} ${unten + 110} -40 ${unten + 130} Z`} fill="url(#hang)" />
      <Reben x={-30} y={oben - 100} breite={tunnelBreite + 10} hoehe={unten - oben + 200} zeilen={9} />
      <g transform={`translate(${tunnelBreite + 16} ${oben - 34})`}>
        <rect x="-28" y="-15" width="56" height="26" rx="8" fill="#fffaf0" stroke="#5a4a3a" strokeWidth="2" />
        <text y="3" textAnchor="middle" fontSize="12" fontWeight="800" fill="#5a4a3a">Tunnel</text>
      </g>
    </g>
  );
}

function Strasse({ stadt }: { stadt: Stadt }) {
  const { oben, unten, wende } = stadt.strasse;
  const mitte = (oben + unten) / 2;
  return (
    <g>
      <rect x="0" y={oben - 9} width={wende.x} height={unten - oben + 18} fill="#cfc8b6" />
      <circle cx={wende.x} cy={wende.y} r={wende.r + 9} fill="#cfc8b6" />
      <rect x="0" y={oben} width={wende.x} height={unten - oben} fill="url(#asphalt)" />
      <circle cx={wende.x} cy={wende.y} r={wende.r} fill="#5f6c70" />
      <circle cx={wende.x} cy={wende.y} r={INSEL_RADIUS} fill="url(#laub)" stroke="#e5dfcf" strokeWidth="6" />
      <path d={`M${stadt.strasse.tunnelBreite + 30} ${mitte}H${wende.x - 70}`} stroke="#f3ecdc" strokeWidth="4" strokeDasharray="28 24" opacity="0.85" />
      {stadt.zebras.map((z, i) => (
        <g key={i}>
          {Array.from({ length: Math.floor(z.hoehe / 20) }, (_, n) => (
            <rect key={n} x={z.x + 4} y={z.y + 6 + n * 20} width={z.breite - 8} height="10" rx="2" fill="#fbf7ee" opacity="0.95" />
          ))}
        </g>
      ))}
      {/* Haltestelle der Stadtbahn: gelbes Schild mit grünem H */}
      <g transform={`translate(${wende.x + wende.r + 40} ${wende.y - 70})`}>
        <rect x="-2.5" y="0" width="5" height="56" rx="2" fill="#4a5a5e" />
        <circle cy="-14" r="20" fill="#f6d34a" stroke="#3d7a3a" strokeWidth="3" />
        <text y="-6" textAnchor="middle" fontSize="24" fontWeight="900" fill="#2f7a3a">H</text>
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
        <line key={`r${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={k.art === "gehweg" ? GEHWEG_RAND : WEG_RAND} strokeWidth={k.breite + 8} opacity="0.8" />
      ))}
      {linien.map(({ k, a, b }, i) => (
        <line key={`f${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={k.art === "gehweg" ? GEHWEG : WEG} strokeWidth={k.breite} />
      ))}
      <circle cx={stadt.platz.x} cy={stadt.platz.y} r={stadt.platz.r + 5} fill={WEG_RAND} opacity="0.8" />
      <circle cx={stadt.platz.x} cy={stadt.platz.y} r={stadt.platz.r} fill="url(#pflaster)" />
      <circle cx={stadt.platz.x} cy={stadt.platz.y} r={stadt.platz.r - 26} fill="none" stroke="#e2cd9c" strokeWidth="6" strokeDasharray="10 10" />
    </g>
  );
}

/* ---------- Heilbronner Wahrzeichen ---------- */

/** Kilianskirche: gotisches Schiff, Renaissance-Turm mit immer kleineren Stockwerken, ganz oben das „Männle“. */
function Kilianskirche({ w }: { w: Wahrzeichen }) {
  const stufen = [
    { b: 64, h: 70 },
    { b: 56, h: 40 },
    { b: 46, h: 30 },
    { b: 36, h: 24 },
    { b: 26, h: 20 },
    { b: 14, h: 14 },
  ];
  const oberkanten = stufen.map((_, i) => -stufen.slice(0, i + 1).reduce((summe, s) => summe + s.h, 0));
  const y = oberkanten.at(-1) ?? 0;
  return (
    <g transform={`translate(${w.x} ${w.y})`}>
      <ellipse cx="0" cy="2" rx="90" ry="10" fill="url(#schatten)" />
      <path d="M-90 0v-62l40-34h80l40 34V0Z" fill="url(#sandstein)" />
      <path d="M-96-60 -50-104h104l46 44Z" fill="#5b6b78" />
      {[-70, -42, 42, 70].map((fx) => <path key={fx} d={`M${fx - 7} -10v-30q7-10 14 0v30Z`} fill="#6c5a4a" opacity="0.75" />)}
      <g transform="translate(0 -40)">
        {stufen.map((s, i) => {
          const oberkante = oberkanten[i] ?? 0;
          return (
            <g key={i}>
              <rect x={-s.b / 2} y={oberkante} width={s.b} height={s.h} fill="url(#sandstein)" />
              <rect x={-s.b / 2} y={oberkante} width={s.b} height="4" fill="#b9845f" />
              {s.h > 18 && <path d={`M-5 ${oberkante + s.h - 6}v-${s.h - 16}q5-7 10 0v${s.h - 16}Z`} fill="#6c5a4a" opacity="0.8" />}
            </g>
          );
        })}
        <path d={`M-3 ${y}v-10h6v10Z`} fill="#7c6a58" />
        <circle cx="0" cy={y - 14} r="3.5" fill="#d9a441" />
        <path d={`M0 ${y - 10}v-10m-4 4h8`} stroke="#d9a441" strokeWidth="2" />
      </g>
    </g>
  );
}

/** Rathaus am Marktplatz mit Kunstuhr (1580): große Uhr, darunter die astronomische Scheibe, unten Arkaden. */
function Rathaus({ w }: { w: Wahrzeichen }) {
  return (
    <g transform={`translate(${w.x} ${w.y})`}>
      <ellipse cx="0" cy="2" rx="110" ry="10" fill="url(#schatten)" />
      <rect x="-100" y="-104" width="200" height="104" fill="url(#ocker)" />
      <path d="M-106-104 0-160l106 56Z" fill="#9c5a44" />
      <path d="M-34-104v-70h68v70Z" fill="url(#ocker)" />
      <path d="M-40-172 0-200l40 28Z" fill="#9c5a44" />
      <circle cy="-150" r="17" fill="#fffaf0" stroke="#3d4b5a" strokeWidth="3" />
      <path d="M0-150v-11m0 11 8 5" stroke="#3d4b5a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cy="-118" r="13" fill="#2f5b9a" stroke="#d9a441" strokeWidth="3" />
      <circle cx="5" cy="-120" r="4" fill="#f6e3a1" />
      {[-80, -52, 52, 80].map((fx) => <rect key={fx} x={fx - 9} y="-90" width="18" height="24" rx="3" fill="#cfe5ea" stroke="#8a6a4a" strokeWidth="1.5" />)}
      {[-75, -45, -15, 15, 45, 75].map((ax) => <path key={ax} d={`M${ax - 11} 0v-24q11-14 22 0V0Z`} fill="#6c5040" opacity="0.8" />)}
      <path d="M-34 0l14-30h40L34 0" fill="none" stroke="#8a6a4a" strokeWidth="5" />
    </g>
  );
}

/** Wartberg: Hang mit Rebzeilen, oben der Aussichtsturm. */
function Wartberg({ w }: { w: Wahrzeichen }) {
  const b = w.breite;
  return (
    <g transform={`translate(${w.x} ${w.y})`}>
      <path d={`M${-b / 2} 0Q${-b / 4} ${-w.hoehe * 0.9} 0 ${-w.hoehe * 0.95}T${b / 2} 0Z`} fill="url(#hang)" />
      <Reben x={-b / 2 + 40} y={-w.hoehe * 0.8} breite={b - 80} hoehe={w.hoehe * 0.75} zeilen={8} />
      <g transform={`translate(0 ${-w.hoehe * 0.95})`}>
        <rect x="-12" y="-46" width="24" height="46" fill="url(#sandstein)" />
        <path d="M-15-46h30v-8h-6v4h-6v-4h-6v4h-6v-4h-6Z" fill="#c69a72" />
        <rect x="-4" y="-34" width="8" height="12" rx="3" fill="#6c5a4a" />
      </g>
    </g>
  );
}

/** Der Neckar am unteren Rand – mit der MS Experimenta, die langsam vorbeifährt. */
function Neckar({ stadt }: { stadt: Stadt }) {
  const y = stadt.neckarY;
  return (
    <g pointerEvents="none">
      <rect x="0" y={y - 10} width={stadt.breite} height="18" fill="#b9c99a" />
      <rect x="0" y={y} width={stadt.breite} height={stadt.hoehe - y + 40} fill="url(#fluss)" />
      {[0.2, 0.45, 0.7, 0.9].map((f, i) => (
        <path key={i} d={`M${stadt.breite * f - 60} ${y + 30 + (i % 2) * 28}q30-8 60 0t60 0`} stroke="#e6f6f6" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" />
      ))}
      <text x={stadt.breite * 0.32} y={y + 64} className="neckar-name">Neckar</text>
      <g transform={`translate(0 ${y + 46})`}>
        <g className="neckar-schiff">
          <path d="M-70 0h140l-18 18H-52Z" fill="#fffaf0" stroke="#2f4f6a" strokeWidth="2.5" />
          <rect x="-50" y="-22" width="88" height="22" rx="5" fill="#e9eef2" stroke="#2f4f6a" strokeWidth="2" />
          {[-42, -26, -10, 6, 22].map((fx) => <rect key={fx} x={fx} y="-17" width="11" height="10" rx="2" fill="#7fc3d6" />)}
          <rect x="-70" y="2" width="140" height="5" fill="#00a0b0" />
          <text x="0" y="14" textAnchor="middle" fontSize="9" fontWeight="800" fill="#2f4f6a">MS EXPERIMENTA</text>
        </g>
      </g>
    </g>
  );
}

function Hausschild({ name, kurz, thema, farbe, erledigt }: { name: string; kurz: string; thema: string; farbe: string; erledigt: boolean }) {
  return (
    <g className="haus-schild">
      <rect x="-108" y="-56" width="216" height="58" rx="16" fill="#fffaf0" stroke="#254950" strokeWidth="3" />
      <rect x="-101" y="-49" width="44" height="44" rx="11" fill={farbe} />
      <g transform="translate(-79 -27)"><ThemenSymbol thema={thema} groesse={27} /></g>
      <text x="-49" y="-29" fill="#1c1934" fontSize="20" fontWeight="800">{kurz}</text>
      <text x="-49" y="-10" fill="#3f4a5a" fontSize="14">{name}</text>
      {erledigt && (
        <g transform="translate(100 -54)">
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
    const groesse = 120 + d.variante * 14;
    schichten.push({
      id: d.id,
      y: d.y,
      node:
        d.art === "baum" ? <PixelGrafik motiv="baum" x={d.x - groesse / 2} y={d.y - groesse * 1.15} breite={groesse} hoehe={groesse * 1.15} />
        : d.art === "busch" ? <Busch {...d} />
        : d.art === "laterne" ? <Laterne {...d} />
        : <PixelGrafik motiv="bank" x={d.x - 48} y={d.y - 46} breite={96} hoehe={52} />,
    });
  }

  for (const h of stadt.haeuser) {
    const fertig = erledigt.includes(h.station.id);
    const nah = nahesHausId === h.station.id;
    const mass = hausBildMass(h.station.grafik);
    const breite = 440;
    const hoehe = mass ? (breite * mass.hoehe) / mass.breite : 200;
    const unten = h.tuer.y + 34;
    const oben = unten - hoehe;
    schichten.push({
      id: `haus-${h.station.id}`,
      y: h.bodenY,
      node: (
        <g data-haus={h.station.id} className={`stadt-haus ${nah ? "ist-nah" : ""}`}>
          <ellipse cx={h.mitteX} cy={unten - 6} rx={breite * 0.48} ry="18" fill="url(#schatten)" />
          <PixelGrafik motiv={h.station.grafik} x={h.mitteX - breite / 2} y={oben} breite={breite} hoehe={hoehe} />
          <g transform={`translate(${h.mitteX} ${oben + 8})`}>
            <Hausschild name={h.station.name} kurz={h.station.kurz} thema={h.station.symbol} farbe={h.station.farbe} erledigt={fertig} />
          </g>
          {nah && (
            <g transform={`translate(${h.tuer.x} ${h.tuer.y - 70})`}>
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
        <Rakete teile={teile} zustand={rakete} />
      </g>
    ),
  });

  return (
    <>
      <defs>
        <linearGradient id="rasen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4e7ad" />
          <stop offset="1" stopColor="#bcd890" />
        </linearGradient>
        <radialGradient id="rasen-licht" cx="0.35" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#fff6cf" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff6cf" stopOpacity="0" />
        </radialGradient>
        <pattern id="halme" width="64" height="56" patternUnits="userSpaceOnUse">
          <path d="M8 40q2-8 0-12m4 12q1-7 4-10M40 18q2-7 0-11m4 11q1-6 4-9M52 50q1-6-1-9" stroke="#9fc274" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
        </pattern>
        <radialGradient id="laub" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#b9da7c" />
          <stop offset="0.6" stopColor="#7cab56" />
          <stop offset="1" stopColor="#557f3f" />
        </radialGradient>
        <radialGradient id="schatten">
          <stop offset="0" stopColor="#2b3d2a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2b3d2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a777b" />
          <stop offset="1" stopColor="#56636a" />
        </linearGradient>
        <radialGradient id="wasser" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#a9dde2" />
          <stop offset="1" stopColor="#5e9fae" />
        </radialGradient>
        <linearGradient id="fluss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ccbd4" />
          <stop offset="1" stopColor="#4c8ea0" />
        </linearGradient>
        <linearGradient id="hang" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b6d27f" />
          <stop offset="1" stopColor="#8db466" />
        </linearGradient>
        <linearGradient id="sandstein" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e2b893" />
          <stop offset="0.6" stopColor="#d3a37c" />
          <stop offset="1" stopColor="#b98761" />
        </linearGradient>
        <linearGradient id="ocker" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3dca6" />
          <stop offset="1" stopColor="#ddbb7c" />
        </linearGradient>
        <pattern id="pflaster" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill="#efdcb2" />
          <path d="M0 14h28M14 0v14M7 14v14M21 14v14" stroke="#e0ca98" strokeWidth="1.6" />
        </pattern>
      </defs>
      <rect width={stadt.breite} height={stadt.hoehe} fill="url(#rasen)" />
      <rect width={stadt.breite} height={stadt.hoehe} fill="url(#halme)" />
      <rect width={stadt.breite} height={stadt.hoehe} fill="url(#rasen-licht)" />
      {stadt.wahrzeichen.map((w) => (
        <g key={w.id} data-wahrzeichen={w.id} className="wahrzeichen">
          {w.id === "kilianskirche" ? <Kilianskirche w={w} /> : w.id === "rathaus" ? <Rathaus w={w} /> : <Wartberg w={w} />}
        </g>
      ))}
      <ellipse cx={stadt.teich.x} cy={stadt.teich.y} rx={stadt.teich.rx + 14} ry={stadt.teich.ry + 14} fill="#b8cf96" />
      <ellipse cx={stadt.teich.x} cy={stadt.teich.y} rx={stadt.teich.rx} ry={stadt.teich.ry} fill="url(#wasser)" />
      {([[-80, -30, 14], [-40, 40, 11], [70, 36, 12]] as const).map(([dx, dy, r], i) => (
        <g key={i} transform={`translate(${stadt.teich.x + dx} ${stadt.teich.y + dy})`}>
          <path d={`M0 0L${r} -3A${r} ${r} 0 1 1 ${r} 3Z`} fill="#6fa858" />
        </g>
      ))}
      <g transform={`translate(${stadt.teich.x} ${stadt.teich.y})`}>
        <g className="enten">
          {[{ x: 40, y: -6, k: 1 }, { x: 78, y: 4, k: 0.6 }, { x: 104, y: 10, k: 0.6 }].map((e, i) => (
            <g key={i} transform={`translate(${e.x} ${e.y}) scale(${e.k})`}>
              <ellipse cy="9" rx="24" ry="5" fill="#ffffff" opacity="0.35" />
              <path d="M-20 0q0-14 18-14h12q10 0 12 10l4-6v12q-4 10-24 10H-8q-12 0-12-12Z" fill={i ? "#f6d77a" : "#fbf7ee"} stroke="#5a5040" strokeWidth="2" />
              <circle cx="-14" cy="-16" r="9" fill={i ? "#f6d77a" : "#fbf7ee"} stroke="#5a5040" strokeWidth="2" />
              <circle cx="-17" cy="-18" r="1.8" fill="#1c1934" />
              <path d="M-23-15h-9l3 4h6Z" fill="#f2a900" />
            </g>
          ))}
        </g>
      </g>
      <Neckar stadt={stadt} />
      {/* Gelbes Ortsschild an der Einfahrt aus dem Tunnel */}
      <g transform={`translate(${stadt.strasse.tunnelBreite + 130} ${stadt.gehwegSued + 6})`}>
        <ellipse cy="46" rx="30" ry="6" fill="url(#schatten)" />
        <rect x="-3" y="0" width="6" height="46" rx="2" fill="#5a676b" />
        <rect x="-58" y="-34" width="116" height="40" rx="6" fill="#f6d34a" stroke="#2b2a2a" strokeWidth="3" />
        <text y="-9" textAnchor="middle" fontSize="18" fontWeight="900" fill="#1c1c1c">Heilbronn</text>
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

/** Eine Figur in der Welt: die eigene oder ein Bewohner. Von hinten beim Laufen nach oben, gespiegelt nach links. */
function WeltFigur({ aussehen, blick, spiegeln, laeuft, name }: { aussehen: AvatarKonfiguration | "roboter"; blick: Blick; spiegeln: boolean; laeuft: boolean; name: string }) {
  const breite = (FIGUR_HOEHE * 240) / 380;
  return (
    <g className={`welt-figur ${laeuft ? "laeuft" : ""}`}>
      <g transform={`scale(${spiegeln ? -1 : 1} 1)`}>
        <g className="welt-figur-koerper">
          {aussehen === "roboter" ? (
            <Roboter x={-36} y={-84} breite={72} hoehe={84} />
          ) : (
            <Avatar wert={aussehen} hinten={blick === "hinten"} mini x={-breite / 2} y={-(FIGUR_HOEHE * 362) / 380} width={breite} height={FIGUR_HOEHE} label={name} />
          )}
        </g>
      </g>
    </g>
  );
}

type LebenProps = {
  stadt: Stadt;
  avatar: AvatarKonfiguration;
  position: Punkt;
  blick: Blick;
  spiegeln: boolean;
  laeuft: boolean;
  autos: Auto[];
  ziel?: Punkt;
  bewohner?: Bewohner[];
  sprichtMit?: string;
  nahBei?: string;
  gesprochen?: string[];
};

/** Ein Bewohner neben dem Weg. Im Gespräch dreht er sich zur Spielfigur; eine Sprechblase zeigt, wer noch etwas erzählt. */
function BewohnerFigur({ b, spieler, spricht, nah, fertig }: { b: Bewohner; spieler: Punkt; spricht: boolean; nah: boolean; fertig: boolean }) {
  const zumSpieler = spricht || nah;
  const links = zumSpieler ? spieler.x < b.ort.x - 12 : b.blickNach === "links";
  return (
    <g transform={`translate(${b.ort.x} ${b.ort.y})`} data-bewohner={b.id}>
      <g className="bewohner-wippen">
        <WeltFigur aussehen={b.aussehen} blick="vorne" spiegeln={links} laeuft={false} name={b.name} />
      </g>
      {!spricht && (
        <g transform="translate(0 -128)" className={nah ? "bewohner-blase ist-nah" : "bewohner-blase"}>
          <g>
            <path d="M-22 -16h44a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H6l-6 9-6-9h-16a8 8 0 0 1-8-8v-14a8 8 0 0 1 8-8Z" fill={fertig ? "#e7f3e9" : "#fffaf0"} stroke="#254950" strokeWidth="3" />
            {fertig ? (
              <path d="m-8 -1 6 6 11-12" fill="none" stroke="#2f7a4a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <g fill="#254950">
                <circle cx="-10" cy="-1" r="3.4" />
                <circle cx="0" cy="-1" r="3.4" />
                <circle cx="10" cy="-1" r="3.4" />
              </g>
            )}
          </g>
        </g>
      )}
      <text y="26" textAnchor="middle" className="bewohner-name">{b.name}</text>
    </g>
  );
}

/** Was sich bewegt: Autos, Stadtbahn, Zielmarke, Bewohner, Spielfigur. */
export function StadtLeben({ stadt, avatar, position, blick, spiegeln, laeuft, autos, ziel, bewohner = [], sprichtMit, nahBei, gesprochen = [] }: LebenProps) {
  // Wer weiter oben steht, wird zuerst gezeichnet – so steht die Spielfigur je nach Position vor oder hinter den Bewohnern.
  const dahinter = bewohner.filter((b) => b.ort.y <= position.y);
  const davor = bewohner.filter((b) => b.ort.y > position.y);
  const zeichne = (b: Bewohner) => <BewohnerFigur key={b.id} b={b} spieler={position} spricht={sprichtMit === b.id} nah={nahBei === b.id} fertig={gesprochen.includes(b.id)} />;
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
      {dahinter.map(zeichne)}
      <g data-spielfigur transform={`translate(${position.x.toFixed(1)} ${position.y.toFixed(1)})`}>
        <ellipse cy="2" rx="24" ry="7" fill="#2b3d2a" opacity="0.18" />
        <WeltFigur aussehen={avatar} blick={blick} spiegeln={spiegeln} laeuft={laeuft} name="Du" />
      </g>
      {davor.map(zeichne)}
    </>
  );
}
