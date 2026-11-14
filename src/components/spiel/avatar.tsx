"use client";
import { createContext, useContext, useId, type ReactNode } from "react";
import { FARBEN, HAAR, HAUT, OBERTEILE, STANDARD_AVATAR, UNTERTEILE, zeigtUnterteil, type AvatarKonfiguration } from "@/lib/avatar";

export const AvatarKontext = createContext<AvatarKonfiguration>(STANDARD_AVATAR);

/*
 * Die Spielfigur als Gliederpuppe: Arme hängen an den Schultern, Beine an der Hüfte, Hände und Schuhe sitzen
 * am Ende der Glieder. Dadurch können Arme und Beine beim Laufen sauber schwingen (CSS in figur.css).
 * Koordinaten: 200 × 360, Füße unten bei y ≈ 348.
 */

const SCHULTER_L = { x: 72, y: 148 };
const SCHULTER_R = { x: 128, y: 148 };
const HUEFTE_L = { x: 86, y: 212 };
const HUEFTE_R = { x: 114, y: 212 };

function ton(hex: string, f: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(f >= 1 ? c + (255 - c) * (f - 1) : c * f));
  return `#${k.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

function Verlauf({ id, farbe }: { id: string; farbe: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={ton(farbe, 1.14)} />
      <stop offset="1" stopColor={ton(farbe, 0.86)} />
    </linearGradient>
  );
}

type Farben = { haut: string; haar: string; ober: string; unter: string; schuh: string; extra: string; ids: Record<"haut" | "haar" | "ober" | "unter" | "schuh", string> };

/** Ein Bein mit Hose (oder Haut) und Schuh. */
function Bein({ a, f, seite }: { a: AvatarKonfiguration; f: Farben; seite: "l" | "r" }) {
  const j = seite === "l" ? HUEFTE_L : HUEFTE_R;
  const x = j.x;
  const unterteil = zeigtUnterteil(a) ? UNTERTEILE[a.unterteil] : "Rock";
  const strich = { stroke: ton(f.unter, 0.62), strokeWidth: 2.2 };
  const hautStrich = { stroke: ton(f.haut, 0.7), strokeWidth: 2 };
  const nachAussen = seite === "l" ? -1 : 1;
  let hose: ReactNode;
  if (unterteil === "Jeans") {
    hose = (
      <g>
        <path d={`M${x - 14} ${j.y - 6}H${x + 14}L${x + 13} 322H${x - 13}Z`} fill={`url(#${f.ids.unter})`} {...strich} />
        <path d={`M${x + 6 * nachAussen} ${j.y + 6}L${x + 7 * nachAussen} 318`} stroke={ton(f.unter, 0.75)} strokeWidth="1.6" strokeDasharray="4 3" />
        <rect x={x - 13} y="312" width="26" height="10" rx="2" fill={ton(f.unter, 1.15)} {...strich} />
      </g>
    );
  } else if (unterteil === "Jogginghose") {
    hose = (
      <g>
        <path d={`M${x - 15} ${j.y - 6}H${x + 15}L${x + 12} 312H${x - 12}Z`} fill={`url(#${f.ids.unter})`} {...strich} />
        <path d={`M${x + 12 * nachAussen} ${j.y + 4}L${x + 11 * nachAussen} 308`} stroke="#fffaf0" strokeWidth="2.5" opacity="0.8" />
        <rect x={x - 12} y="310" width="24" height="14" rx="5" fill={ton(f.unter, 0.8)} {...strich} />
      </g>
    );
  } else if (unterteil === "Shorts") {
    hose = (
      <g>
        <path d={`M${x - 11} 250H${x + 11}L${x + 10} 326H${x - 10}Z`} fill={`url(#${f.ids.haut})`} {...hautStrich} />
        <path d={`M${x - 15} ${j.y - 6}H${x + 15}L${x + 16} 258H${x - 16}Z`} fill={`url(#${f.ids.unter})`} {...strich} />
      </g>
    );
  } else if (unterteil === "Leggings") {
    hose = <path d={`M${x - 12} ${j.y - 6}H${x + 12}L${x + 10} 326H${x - 10}Z`} fill={`url(#${f.ids.unter})`} {...strich} />;
  } else {
    hose = <path d={`M${x - 11} ${j.y}H${x + 11}L${x + 10} 326H${x - 10}Z`} fill={`url(#${f.ids.haut})`} {...hautStrich} />;
  }

  // Schuh: zeigt leicht nach außen, sitzt genau unter dem Bein.
  const s = nachAussen;
  const sohle = `M${x - 14 + s * 3} 346`;
  const schuhStrich = { stroke: ton(f.schuh, 0.55), strokeWidth: 2.2 };
  let schuh: ReactNode;
  if (a.schuhe === 1) {
    schuh = (
      <g>
        <path d={`M${x - 13} 296H${x + 13}V330H${x - 13}Z`} fill={`url(#${f.ids.schuh})`} {...schuhStrich} />
        <path d={`M${x - 15 + s * 2} 334Q${x - 15 + s * 2} 324 ${x - 6} 324H${x + 8}Q${x + 17 + s * 2} 326 ${x + 17 + s * 3} 338Q${x + 17 + s * 3} 348 ${x + 8} 348H${x - 10}Q${x - 16 + s * 2} 348 ${x - 15 + s * 2} 334Z`} fill={`url(#${f.ids.schuh})`} {...schuhStrich} />
        <path d={`M${x - 13} 302H${x + 13}`} stroke={ton(f.schuh, 1.3)} strokeWidth="3" />
      </g>
    );
  } else if (a.schuhe === 2) {
    schuh = (
      <g>
        <path d={`M${x - 13 + s * 2} 336Q${x - 13 + s * 2} 326 ${x - 4} 325H${x + 6}Q${x + 15 + s * 2} 327 ${x + 15 + s * 3} 338Q${x + 15 + s * 3} 346 ${x + 6} 346H${x - 8}Q${x - 14 + s * 2} 346 ${x - 13 + s * 2} 336Z`} fill={`url(#${f.ids.haut})`} {...hautStrich} />
        <path d={`M${x - 12} 333H${x + 14}M${x - 10} 341H${x + 14}`} stroke={f.schuh} strokeWidth="4" strokeLinecap="round" />
        <path d={`${sohle}H${x + 15 + s * 3}`} stroke={ton(f.schuh, 0.7)} strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  } else {
    schuh = (
      <g>
        <path d={`M${x - 15 + s * 2} 336Q${x - 15 + s * 2} 322 ${x - 5} 321H${x + 7}Q${x + 17 + s * 2} 324 ${x + 17 + s * 3} 338Q${x + 17 + s * 3} 348 ${x + 8} 348H${x - 10}Q${x - 16 + s * 2} 348 ${x - 15 + s * 2} 336Z`} fill={`url(#${f.ids.schuh})`} {...schuhStrich} />
        <path d={`M${x - 15 + s * 2} 342H${x + 17 + s * 3}`} stroke="#fffaf0" strokeWidth="3.5" />
        <path d={`M${x - 5} 328l8 0M${x - 5} 333l8 0`} stroke="#fffaf0" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g className={`fig-bein fig-bein-${seite}`} style={{ transformOrigin: `${j.x}px ${j.y}px` }}>
      {hose}
      {schuh}
    </g>
  );
}

/** Ein Arm mit Ärmel und Hand – die Hand sitzt genau am Ende. */
function Arm({ a, f, seite }: { a: AvatarKonfiguration; f: Farben; seite: "l" | "r" }) {
  const j = seite === "l" ? SCHULTER_L : SCHULTER_R;
  const winkel = seite === "l" ? 9 : -9;
  const kurz = OBERTEILE[a.oberteil] === "T-Shirt" || OBERTEILE[a.oberteil] === "Kleid";
  const strich = { stroke: ton(f.ober, 0.62), strokeWidth: 2.2 };
  return (
    <g className={`fig-arm fig-arm-${seite}`} style={{ transformOrigin: `${j.x}px ${j.y}px` }}>
      <g transform={`rotate(${winkel} ${j.x} ${j.y})`}>
        <rect x={j.x - 8.5} y={j.y - 6} width="17" height="76" rx="8.5" fill={`url(#${f.ids.haut})`} stroke={ton(f.haut, 0.7)} strokeWidth="2" />
        {kurz ? (
          <path d={`M${j.x - 11} ${j.y - 8}H${j.x + 11}L${j.x + 11} ${j.y + 24}Q${j.x} ${j.y + 28} ${j.x - 11} ${j.y + 24}Z`} fill={`url(#${f.ids.ober})`} {...strich} />
        ) : (
          <g>
            <rect x={j.x - 10} y={j.y - 8} width="20" height="72" rx="9" fill={`url(#${f.ids.ober})`} {...strich} />
            <rect x={j.x - 10} y={j.y + 56} width="20" height="9" rx="4" fill={ton(f.ober, 0.82)} {...strich} />
          </g>
        )}
        <circle cx={j.x} cy={j.y + 74} r="10.5" fill={`url(#${f.ids.haut})`} stroke={ton(f.haut, 0.7)} strokeWidth="2" />
      </g>
    </g>
  );
}

function HaarHinten({ a, f, mitKappe }: { a: AvatarKonfiguration; f: Farben; mitKappe: boolean }) {
  const fill = `url(#${f.ids.haar})`;
  const strich = { stroke: ton(f.haar, 0.6), strokeWidth: 2.2 };
  switch (a.frisur) {
    case 2:
      return <g fill={fill} {...strich}>{[[50, 100, 16], [150, 100, 16], [54, 124, 13], [146, 124, 13]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}</g>;
    case 3:
      return <path d="M50 90Q46 28 100 26Q154 28 150 90L158 178Q130 190 100 182Q70 190 42 178Z" fill={fill} {...strich} />;
    case 4:
      return (
        <g>
          <path d="M134 56Q176 64 170 128Q166 164 150 176Q158 134 142 92Z" fill={fill} {...strich} />
          <circle cx="140" cy="60" r="7" fill={f.extra} stroke={ton(f.extra, 0.6)} strokeWidth="2" />
        </g>
      );
    case 6:
      return mitKappe ? null : (
        <g>
          <circle cx="100" cy="24" r="19" fill={fill} {...strich} />
          <path d="M84 36Q100 44 116 36" stroke={f.extra} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 7:
      return <g fill={fill} {...strich}><circle cx="52" cy="46" r="24" /><circle cx="148" cy="46" r="24" /></g>;
    case 8:
      return <path d="M48 88Q44 28 100 26Q156 28 152 88L156 132Q100 144 44 132Z" fill={fill} {...strich} />;
    default:
      return null;
  }
}

function HaarVorne({ a, f, mitKappe }: { a: AvatarKonfiguration; f: Farben; mitKappe: boolean }) {
  const fill = `url(#${f.ids.haar})`;
  const strich = { stroke: ton(f.haar, 0.6), strokeWidth: 2.2, strokeLinejoin: "round" as const };
  const glanz = <path d="M74 44Q92 34 112 36" stroke={ton(f.haar, 1.45)} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />;
  switch (a.frisur) {
    case 1:
      return mitKappe ? <path d="M54 84Q52 36 100 32Q148 36 146 84Q144 62 130 56Q100 66 70 56Q58 62 54 84Z" fill={fill} {...strich} /> : (
        <g>
          <path d="M54 84Q50 50 62 40L64 24L78 34L88 16L100 32L112 16L122 34L136 24L138 40Q150 50 146 84Q142 62 128 56Q100 68 72 56Q58 62 54 84Z" fill={fill} {...strich} />
          {glanz}
        </g>
      );
    case 2:
      return <g fill={fill} {...strich}>{[[58, 72, 15], [64, 50, 16], [82, 36, 17], [102, 32, 17], [122, 36, 16], [138, 50, 15], [143, 72, 14]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}</g>;
    case 3:
      return (
        <g>
          <path d="M53 94Q48 32 100 30Q152 32 147 94Q140 66 118 58Q88 76 62 62Q55 76 53 94Z" fill={fill} {...strich} />
          <path d="M52 86Q44 132 56 172L68 172Q60 132 62 92Z" fill={fill} {...strich} />
          <path d="M148 86Q156 132 144 172L132 172Q140 132 138 92Z" fill={fill} {...strich} />
          {glanz}
        </g>
      );
    case 5:
      return (
        <g>
          <path d="M54 90Q50 32 100 30Q150 32 146 90Q142 64 104 58L100 40L96 58Q58 64 54 90Z" fill={fill} {...strich} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <ellipse cx="50" cy={104 + i * 15} rx="10" ry="9" fill={fill} {...strich} />
              <ellipse cx="150" cy={104 + i * 15} rx="10" ry="9" fill={fill} {...strich} />
            </g>
          ))}
          <path d="M42 172h16M142 172h16" stroke={f.extra} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 6:
      return (
        <g>
          <path d="M54 88Q50 34 100 32Q150 34 146 88Q140 58 100 54Q60 58 54 88Z" fill={fill} {...strich} />
          {glanz}
        </g>
      );
    case 8:
      return (
        <g>
          <path d="M53 96Q48 30 100 28Q152 30 147 96Q146 70 140 66H60Q54 70 53 96Z" fill={fill} {...strich} />
          {glanz}
        </g>
      );
    default:
      return (
        <g>
          <path d="M54 86Q52 34 100 30Q148 34 146 86Q144 60 130 54Q112 64 96 56Q80 64 66 56Q58 62 54 86Z" fill={fill} {...strich} />
          {glanz}
        </g>
      );
  }
}

function Oberkoerper({ a, f, clip }: { a: AvatarKonfiguration; f: Farben; clip: string }) {
  const art = OBERTEILE[a.oberteil];
  const strich = { stroke: ton(f.ober, 0.62), strokeWidth: 2.2 };
  const rumpf = art === "Kleid" ? "M66 150Q66 139 80 137H120Q134 139 134 150L132 204H68Z" : "M66 150Q66 139 80 137H120Q134 139 134 150L133 222Q100 230 67 222Z";
  const hell = ton(f.ober, 1.55);
  return (
    <g>
      {art === "Hoodie" && <path d="M68 150Q66 118 100 116Q134 118 132 150Z" fill={ton(f.ober, 0.78)} {...strich} />}
      <rect x="90" y="116" width="20" height="28" fill={ton(f.haut, 0.9)} stroke={ton(f.haut, 0.7)} strokeWidth="2" />
      <path d={rumpf} fill={`url(#${f.ids.ober})`} {...strich} />
      <clipPath id={clip}><path d={rumpf} /></clipPath>
      <g clipPath={`url(#${clip})`}>
        {a.aufdruck === 1 && <path d="M60 166H140M60 184H140" stroke={hell} strokeWidth="8" />}
        {a.aufdruck === 2 && <path d="M100 162l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill={hell} />}
      </g>
      {(art === "T-Shirt" || art === "Langarm" || art === "Kleid") && <path d="M86 137Q100 152 114 137Z" fill={ton(f.haut, 0.92)} stroke={ton(f.ober, 0.62)} strokeWidth="2.2" />}
      {art === "Pullover" && (
        <g>
          <path d="M84 137Q100 156 116 137" fill="none" stroke={ton(f.ober, 0.75)} strokeWidth="6" />
          <path d="M67 216Q100 224 133 216" fill="none" stroke={ton(f.ober, 0.75)} strokeWidth="7" />
        </g>
      )}
      {art === "Hoodie" && (
        <g>
          <path d="M93 146V178M107 146V178" stroke="#fffaf0" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="93" cy="180" r="2.5" fill="#fffaf0" />
          <circle cx="107" cy="180" r="2.5" fill="#fffaf0" />
          <path d="M78 192H122L126 214H74Z" fill={ton(f.ober, 0.86)} {...strich} />
        </g>
      )}
      {art === "Zipper-Jacke" && (
        <g>
          <path d="M84 137L100 158L116 137" fill="none" {...strich} strokeWidth="3" />
          <path d="M100 158V224" stroke={ton(f.ober, 0.5)} strokeWidth="2.5" />
          <rect x="97" y="164" width="6" height="11" rx="2" fill="#d9d4c4" stroke="#6b6b6b" strokeWidth="1.2" />
          <path d="M76 196h14M110 196h14" stroke={ton(f.ober, 0.6)} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {art === "Kleid" && <path d="M68 200H132L152 266Q100 278 48 266Z" fill={`url(#${f.ids.ober})`} {...strich} />}
      {art === "Kleid" && <path d="M68 202H132" stroke={ton(f.ober, 0.7)} strokeWidth="4" />}
    </g>
  );
}

function Gesicht({ a, f, blick }: { a: AvatarKonfiguration; f: Farben; blick: "vorne" | "links" | "rechts" }) {
  const v = blick === "links" ? -5 : blick === "rechts" ? 5 : 0;
  const rx = a.gesicht === 1 ? 42 : 46;
  const ry = a.gesicht === 1 ? 50 : 46;
  const iris = "#3b2a22";
  const augen =
    a.augen === 1 ? (
      <path d={`M${73 + v} 95q9-10 18 0M${109 + v} 95q9-10 18 0`} stroke={iris} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    ) : (
      <g className="fig-augen" style={{ transformOrigin: "100px 92px" }}>
        {[82, 118].map((ax) => (
          <g key={ax}>
            <ellipse cx={ax + v * 0.4} cy="92" rx={a.augen === 2 ? 9.5 : 8.5} ry={a.augen === 2 ? 10.5 : 9.5} fill="#fffdf8" stroke={ton(f.haut, 0.55)} strokeWidth="1.5" />
            <circle cx={ax + v} cy="93" r="6.2" fill={iris} />
            <circle cx={ax + v + 2} cy="90" r="2.2" fill="#fff" />
            <circle cx={ax + v - 2} cy="96" r="1" fill="#fff" />
          </g>
        ))}
        {a.augen === 2 && <path d={`M${72 + v * 0.4} 86l-5-4M${74 + v * 0.4} 83l-3-5M${128 + v * 0.4} 86l5-4M${126 + v * 0.4} 83l3-5`} stroke={iris} strokeWidth="2.2" strokeLinecap="round" />}
      </g>
    );
  return (
    <g>
      <ellipse cx="55" cy="94" rx="8" ry="11" fill={`url(#${f.ids.haut})`} stroke={ton(f.haut, 0.7)} strokeWidth="2" />
      <ellipse cx="145" cy="94" rx="8" ry="11" fill={`url(#${f.ids.haut})`} stroke={ton(f.haut, 0.7)} strokeWidth="2" />
      <ellipse cx="100" cy="84" rx={rx} ry={ry} fill={`url(#${f.ids.haut})`} stroke={ton(f.haut, 0.7)} strokeWidth="2.2" />
      <ellipse cx={72 + v * 0.5} cy="108" rx="8" ry="4.5" fill="#f0857a" opacity="0.35" />
      <ellipse cx={128 + v * 0.5} cy="108" rx="8" ry="4.5" fill="#f0857a" opacity="0.35" />
      {a.sommersprossen === 1 && <g fill={ton(f.haut, 0.68)}>{[[68, 102], [74, 105], [70, 109], [126, 102], [132, 105], [130, 109]].map(([cx, cy], i) => <circle key={i} cx={cx! + v * 0.5} cy={cy} r="1.5" />)}</g>}
      <path d={`M${80 + v * 0.6} 77q6-4 12 0M${108 + v * 0.6} 77q6-4 12 0`} stroke={ton(f.haar, 0.8)} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {augen}
      <path d={`M${98 + v} 102q2 4 5 0`} stroke={ton(f.haut, 0.6)} strokeWidth="2" fill="none" strokeLinecap="round" />
      <g className="fig-mund">
        <path d={`M${90 + v} 111q10 10 20 0`} stroke="#7a3b32" strokeWidth="2.8" fill="#fff4ef" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Zubehoer({ a, f, blick }: { a: AvatarKonfiguration; f: Farben; blick: "vorne" | "links" | "rechts" }) {
  const v = blick === "links" ? -5 : blick === "rechts" ? 5 : 0;
  if (a.zubehoer === 1)
    return (
      <g fill="none" stroke="#2a2a33" strokeWidth="2.6">
        <circle cx={82 + v * 0.4} cy="92" r="12.5" />
        <circle cx={118 + v * 0.4} cy="92" r="12.5" />
        <path d={`M${94.5 + v * 0.4} 92h11M69 90l-13-3M131 90l13-3`} />
      </g>
    );
  if (a.zubehoer === 2)
    return (
      <g stroke={ton(f.extra, 0.6)} strokeWidth="2.2">
        <path d="M52 72Q52 26 100 24Q148 26 148 72Z" fill={`url(#zk-${f.ids.haar})`} />
        <path d={`M${50 + v} 68Q100 58 ${150 + v} 68Q${154 + v} 78 ${144 + v} 78Q100 70 ${56 + v} 78Q${46 + v} 78 ${50 + v} 68Z`} fill={ton(f.extra, 0.78)} />
        <circle cx="100" cy="25" r="4" fill={ton(f.extra, 0.78)} />
      </g>
    );
  if (a.zubehoer === 3)
    return (
      <g transform="translate(134 40) rotate(18)" stroke={ton(f.extra, 0.6)} strokeWidth="2">
        <path d="M0 0L-18-11V11Z" fill={f.extra} />
        <path d="M0 0L18-11V11Z" fill={f.extra} />
        <circle r="5" fill={ton(f.extra, 0.85)} />
      </g>
    );
  return null;
}

export type FigurBlick = "vorne" | "links" | "rechts";

/** Die selbst gestaltete Figur. `laeuft` schaltet die Laufbewegung ein, `blick` dreht Augen und Gesicht zur Seite. */
export function Avatar({ wert, className = "", mini = false, x, y, width, height, label = "Deine selbst gestaltete Figur", laeuft = false, blick = "vorne", spricht = false }: {
  wert?: AvatarKonfiguration;
  className?: string;
  mini?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  label?: string;
  laeuft?: boolean;
  blick?: FigurBlick;
  spricht?: boolean;
}) {
  const kontext = useContext(AvatarKontext);
  const a = wert ?? kontext;
  const id = useId().replace(/[:«»]/g, "");
  const f: Farben = {
    haut: HAUT[a.haut] ?? HAUT[0]!,
    haar: HAAR[a.haar] ?? HAAR[0]!,
    ober: FARBEN[a.oberfarbe] ?? FARBEN[0]!,
    unter: FARBEN[a.unterfarbe] ?? FARBEN[0]!,
    schuh: FARBEN[a.schuhfarbe] ?? FARBEN[0]!,
    extra: FARBEN[a.zubehoerfarbe] ?? FARBEN[0]!,
    ids: { haut: `${id}h`, haar: `${id}r`, ober: `${id}o`, unter: `${id}u`, schuh: `${id}s` },
  };
  const mitKappe = a.zubehoer === 2;
  const rock = zeigtUnterteil(a) && UNTERTEILE[a.unterteil] === "Rock";
  const hosenBund = zeigtUnterteil(a) && !rock && OBERTEILE[a.oberteil] !== "Kleid";
  return (
    <svg viewBox="0 0 200 360" x={x} y={y} width={width} height={height} className={`figur2 eigener-avatar ${laeuft ? "laeuft" : ""} ${spricht ? "spricht" : ""} ${className}`} role="img" aria-label={label} focusable="false">
      <defs>
        <Verlauf id={f.ids.haut} farbe={f.haut} />
        <Verlauf id={f.ids.haar} farbe={f.haar} />
        <Verlauf id={f.ids.ober} farbe={f.ober} />
        <Verlauf id={f.ids.unter} farbe={f.unter} />
        <Verlauf id={f.ids.schuh} farbe={f.schuh} />
        <Verlauf id={`zk-${f.ids.haar}`} farbe={f.extra} />
      </defs>
      {!mini && <ellipse cx="100" cy="350" rx="52" ry="8" fill="#1c1934" opacity="0.16" />}
      <g className="fig-koerper">
        <HaarHinten a={a} f={f} mitKappe={mitKappe} />
        <Bein a={a} f={f} seite="l" />
        <Bein a={a} f={f} seite="r" />
        {hosenBund && <path d="M69 204H131L131 236H69Z" fill={`url(#${f.ids.unter})`} stroke={ton(f.unter, 0.62)} strokeWidth="2.2" />}
        {rock && <path d="M70 206H130L148 262Q100 274 52 262Z" fill={`url(#${f.ids.unter})`} stroke={ton(f.unter, 0.62)} strokeWidth="2.2" />}
        <Arm a={a} f={f} seite="l" />
        <Arm a={a} f={f} seite="r" />
        <Oberkoerper a={a} f={f} clip={`${id}c`} />
        <g className="fig-kopf" style={{ transformOrigin: "100px 130px" }}>
          <Gesicht a={a} f={f} blick={blick} />
          <HaarVorne a={a} f={f} mitKappe={mitKappe} />
          <Zubehoer a={a} f={f} blick={blick} />
        </g>
      </g>
    </svg>
  );
}

/** Adapter für die Level-Aufgabe; alle Teile kommen aus demselben Baukasten. */
export function AufgabenFigur(_props: { figur?: unknown }) {
  return (
    <g transform="translate(-18 -70)">
      <foreignObject width="46" height="76">
        <Avatar mini />
      </foreignObject>
    </g>
  );
}
