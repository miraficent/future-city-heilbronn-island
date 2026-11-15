"use client";

/**
 * Die Kinderfiguren (Vorlagen des Teams: kid-boy-purple, kid-girl-teal, kid-curly-orange) und die eigene Figur
 * aus dem Baukasten („eigen“, src/lib/eigene-figur.ts). Gemeinsamer Körper – Farben, Haare, Augen, Mund
 * und Tasche unterscheiden sich. Raum 160 × 240, Füße bei (80, 216). Verläufe sind hier erlaubt (DESIGN.md Entscheidung 11).
 */
import { useId } from "react";
import { beschreibe, HAUT, toene, type Aussehen, type Frisur, type Mund } from "@/lib/eigene-figur";
import { useEigeneFigur } from "@/lib/eigene-figur-zustand";

export type FigurArt = "lila" | "tuerkis" | "orange" | "eigen";
/** Die fertigen Figuren zur Auswahl; „eigen“ kommt aus dem Baukasten. */
export const FIGUR_ARTEN: Exclude<FigurArt, "eigen">[] = ["lila", "tuerkis", "orange"];

const LINIE = "#1f2559";

type Stil = {
  label: string;
  pulli: [string, string]; dunkel: string;
  haut: [string, string];
  /** null = ohne Tasche */
  tasche: [string, string] | null; gurt: string; kordel: string; schuh: string;
  hose: [string, string];
  frisur: Frisur; haar: string; glanz: string; spange: string;
  augen: string; mund: Mund;
};

const STIL: Record<Exclude<FigurArt, "eigen">, Stil> = {
  lila: {
    label: "Kind mit lila Pulli und oranger Tasche",
    pulli: ["#8a6cf0", "#6c4ce0"], dunkel: "#5236be", haut: ["#fbd7b5", "#eeb48e"],
    tasche: ["#f5a524", "#dc8a12"], gurt: "#f5a524", kordel: "#f5a524", schuh: "#f5a524", hose: ["#2b3170", "#232862"],
    frisur: "kurz", haar: "#3a2a4a", glanz: "#5e4a72", spange: "#f27a6a", augen: LINIE, mund: "lachen",
  },
  tuerkis: {
    label: "Kind mit Zöpfen und türkisem Pulli",
    pulli: ["#45cdb8", "#22b3a0"], dunkel: "#178f80", haut: ["#fbd7b5", "#eeb48e"],
    tasche: ["#f27a6a", "#d85e50"], gurt: "#f27a6a", kordel: "#f27a6a", schuh: "#6c4ce0", hose: ["#3c4aa0", "#323e8c"],
    frisur: "zoepfe", haar: "#8a4b2a", glanz: "#b06a3e", spange: "#f27a6a", augen: LINIE, mund: "lachen",
  },
  orange: {
    label: "Kind mit Locken und orangem Pulli",
    pulli: ["#fbb84e", "#f59a24"], dunkel: "#d97c0c", haut: ["#b97a52", "#9a603d"],
    tasche: ["#3b6fe0", "#2c58bd"], gurt: "#3b6fe0", kordel: "#3b6fe0", schuh: "#22b3a0", hose: ["#2b3170", "#232862"],
    frisur: "locken", haar: "#2a1d24", glanz: "#4a3540", spange: "#f27a6a", augen: LINIE, mund: "lachen",
  },
};

/** Baukasten-Werte → Zeichenstil: Licht und Schatten werden aus der gewählten Farbe gemischt. */
function stilAus(a: Aussehen): Stil {
  const dunkel = toene(a.pulli, -0.28);
  return {
    label: beschreibe(a),
    pulli: [toene(a.pulli, 0.2), a.pulli], dunkel,
    haut: HAUT[a.haut]?.farben ?? HAUT[0]!.farben,
    tasche: a.tasche ? [toene(a.tasche, 0.12), toene(a.tasche, -0.12)] : null,
    gurt: a.tasche ?? dunkel, kordel: a.tasche ?? toene(a.pulli, 0.5), schuh: a.schuh,
    hose: [a.hose, toene(a.hose, -0.12)],
    frisur: a.frisur, haar: a.haar, glanz: toene(a.haar, 0.28), spange: a.tasche ?? a.schuh,
    augen: a.augen, mund: a.mund,
  };
}

/** Stil einer Figur; „eigen“ liest die gespeicherte Figur (oder einen Entwurf aus dem Baukasten). */
function useStil(art: FigurArt, entwurf?: Aussehen): Stil {
  const [eigen] = useEigeneFigur();
  return art === "eigen" ? stilAus(entwurf ?? eigen) : STIL[art];
}

export function figurLabel(art: FigurArt) {
  return art === "eigen" ? "Eigene Figur" : STIL[art].label;
}

/** Haare vorne auf dem Kopf */
function Haare({ s }: { s: Stil }) {
  if (s.frisur === "kurz") {
    return (
      <>
        <path d="M44 76 Q38 34 80 32 Q122 34 116 76 Q113 60 105 55 Q101 63 92 59 Q87 50 80 56 Q72 48 66 59 Q58 54 54 61 Q48 64 44 76Z" fill={s.haar} stroke={LINIE} strokeWidth={3.5} />
        <path d="M74 34 Q76 18 92 20 Q84 25 86 34Z" fill={s.haar} stroke={LINIE} strokeWidth={3} />
        <path d="M58 44 Q68 37 80 38" fill="none" stroke={s.glanz} strokeWidth={3} />
      </>
    );
  }
  if (s.frisur === "zoepfe" || s.frisur === "lang") {
    return (
      <>
        <path d="M44 78 Q38 32 80 32 Q122 32 116 78 Q114 62 108 56 Q98 60 88 54 Q84 60 74 58 Q64 60 56 56 Q48 62 44 78Z" fill={s.haar} stroke={LINIE} strokeWidth={3.5} />
        <path d="M58 42 Q70 36 82 37" fill="none" stroke={s.glanz} strokeWidth={3} />
        {s.frisur === "zoepfe" && <path d="M100 44 L103 38 L106 44 L112 45 L107 49 L109 55 L103 52 L97 55 L99 49 L94 45Z" fill="#f5c542" stroke={LINIE} strokeWidth={2} />}
      </>
    );
  }
  const umriss: [number, number, number][] = [[48, 62, 10], [54, 46, 11], [66, 36, 12], [80, 32, 12], [94, 36, 12], [106, 46, 11], [112, 62, 10]];
  const fuellung: [number, number, number][] = [[60, 52, 12], [80, 46, 14], [100, 52, 12], [70, 44, 10], [90, 44, 10]];
  return (
    <>
      {umriss.map(([cx, cy, r]) => <circle key={`u${cx}${cy}`} cx={cx} cy={cy} r={r} fill={s.haar} stroke={LINIE} strokeWidth={3} />)}
      {fuellung.map(([cx, cy, r]) => <circle key={`f${cx}${cy}`} cx={cx} cy={cy} r={r} fill={s.haar} />)}
      <path d="M70 34 Q76 30 82 31" fill="none" stroke={s.glanz} strokeWidth={2.5} />
    </>
  );
}

/** Haare hinter dem Kopf (Zöpfe, lange Haare) – vorne und hinten fast gleich */
function HaareHinterKopf({ s, versatz }: { s: Stil; versatz: number }) {
  if (s.frisur === "zoepfe") {
    return (
      <>
        <path d={`M${42 + versatz} 66 Q${24 + versatz} 72 ${26 + versatz} 98 Q${28 + versatz} 112 ${36 + versatz} 116 Q${34 + versatz} 100 ${46 + versatz} 86Z`} fill={s.haar} stroke={LINIE} strokeWidth={3.5} />
        <path d={`M${118 - versatz} 66 Q${136 - versatz} 72 ${134 - versatz} 98 Q${132 - versatz} 112 ${124 - versatz} 116 Q${126 - versatz} 100 ${114 - versatz} 86Z`} fill={s.haar} stroke={LINIE} strokeWidth={3.5} />
      </>
    );
  }
  if (s.frisur === "lang") {
    return <path d="M42 62 Q30 100 38 132 Q58 140 80 138 Q102 140 122 132 Q130 100 118 62Z" fill={s.haar} stroke={LINIE} strokeWidth={3.5} />;
  }
  return null;
}

function Mundform({ mund }: { mund: Mund }) {
  if (mund === "laecheln") return <path d="M70 95 Q80 104 90 95" fill="none" stroke={LINIE} strokeWidth={3} />;
  if (mund === "staunen") {
    return (
      <>
        <ellipse cx={80} cy={98} rx={5.5} ry={7} fill={LINIE} />
        <ellipse cx={80} cy={101} rx={3.2} ry={2.6} fill="#f2777a" />
      </>
    );
  }
  return (
    <>
      <path d="M70 94 Q80 106 90 94 Q80 97 70 94Z" fill={LINIE} stroke={LINIE} strokeWidth={2.4} />
      <path d="M75 99.5 Q80 97 85 99.5 Q80 103 75 99.5Z" fill="#f2777a" />
    </>
  );
}

/** Eine Kinderfigur. Ursprung wie in der Vorlage (0,0 oben links). `entwurf` zeigt eine noch nicht gespeicherte eigene Figur. */
export function KinderFigur({ art, entwurf }: { art: FigurArt; entwurf?: Aussehen }) {
  const s = useStil(art, entwurf);
  const id = useId().replace(/:/g, "");
  const pulli = `${id}-pulli`, haut = `${id}-haut`, tasche = `${id}-tasche`;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <linearGradient id={pulli} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={s.pulli[0]} /><stop offset="1" stopColor={s.pulli[1]} /></linearGradient>
        <radialGradient id={haut} cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor={s.haut[0]} /><stop offset="1" stopColor={s.haut[1]} /></radialGradient>
        {s.tasche && <linearGradient id={tasche} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.tasche[0]} /><stop offset="1" stopColor={s.tasche[1]} /></linearGradient>}
      </defs>
      <ellipse cx={80} cy={224} rx={40} ry={8} fill={LINIE} opacity={0.18} />

      {/* Rucksack */}
      {s.tasche && (
        <>
          <rect x={38} y={112} width={84} height={68} rx={22} fill={`url(#${tasche})`} stroke={LINIE} strokeWidth={3.5} />
          <path d="M60 112 Q80 98 100 112" fill="none" stroke={LINIE} strokeWidth={8} />
          <path d="M60 112 Q80 98 100 112" fill="none" stroke={s.tasche[1]} strokeWidth={4} />
        </>
      )}

      {/* Zöpfe bzw. lange Haare hinter dem Kopf */}
      <HaareHinterKopf s={s} versatz={0} />
      {s.frisur === "zoepfe" && (
        <>
          <circle cx={40} cy={74} r={5} fill={s.spange} stroke={LINIE} strokeWidth={2.5} />
          <circle cx={120} cy={74} r={5} fill={s.spange} stroke={LINIE} strokeWidth={2.5} />
        </>
      )}

      {/* Beine */}
      <path d="M68 172 L63 204" stroke={LINIE} strokeWidth={20} />
      <path d="M68 172 L63 204" stroke={s.hose[0]} strokeWidth={14} />
      <path d="M93 172 L97 203" stroke={LINIE} strokeWidth={20} />
      <path d="M93 172 L97 203" stroke={s.hose[1]} strokeWidth={14} />
      <path d="M56 199 L70 200 M90 198 L104 198" stroke={s.pulli[0]} strokeWidth={5} />

      {/* Turnschuhe */}
      <path d="M48 214 Q47 202 58 201 L68 201 Q74 203 74 212 L74 216 L50 216 Q48 216 48 214Z" fill="#ffffff" stroke={LINIE} strokeWidth={3.5} />
      <path d="M49 212 L74 212 L74 216 L50 216Z" fill={s.schuh} stroke={LINIE} strokeWidth={3} />
      <path d="M58 205 L64 205 M57 208 L64 208" stroke={LINIE} strokeWidth={1.8} />
      <path d="M112 213 Q113 201 102 200 L92 200 Q86 202 86 211 L86 215 L110 215 Q112 215 112 213Z" fill="#ffffff" stroke={LINIE} strokeWidth={3.5} />
      <path d="M111 211 L86 211 L86 215 L110 215Z" fill={s.schuh} stroke={LINIE} strokeWidth={3} />
      <path d="M96 204 L102 204 M96 207 L103 207" stroke={LINIE} strokeWidth={1.8} />

      {/* linker Arm */}
      <path d="M56 124 Q44 146 52 164" fill="none" stroke={LINIE} strokeWidth={19} />
      <path d="M56 124 Q44 146 52 164" fill="none" stroke={s.pulli[1]} strokeWidth={13} />
      <path d="M47 158 L57 160" stroke={s.dunkel} strokeWidth={4} />

      {/* Pulli */}
      <path d="M54 116 Q80 104 106 116 Q114 146 108 178 Q80 186 52 178 Q46 146 54 116Z" fill={`url(#${pulli})`} stroke={LINIE} strokeWidth={3.5} />
      <path d="M50 170 Q80 178 110 170 L108 178 Q80 186 52 178Z" fill={s.dunkel} />
      <path d="M64 154 Q80 150 96 154 L99 170 Q80 174 61 170Z" fill={s.dunkel} stroke={LINIE} strokeWidth={2.5} opacity={0.9} />
      <path d="M60 113 Q80 128 100 113 Q98 104 80 104 Q62 104 60 113Z" fill={s.dunkel} stroke={LINIE} strokeWidth={3} />
      <path d="M73 121 L72 136 M87 121 L88 136" stroke="#ffffff" strokeWidth={2.2} />
      <circle cx={72} cy={138} r={2.2} fill={s.kordel} stroke={LINIE} strokeWidth={1.5} />
      <circle cx={88} cy={138} r={2.2} fill={s.kordel} stroke={LINIE} strokeWidth={1.5} />
      {s.tasche && (
        <>
          <path d="M60 114 Q56 134 60 156 M100 114 Q104 134 100 156" fill="none" stroke={LINIE} strokeWidth={8} />
          <path d="M60 114 Q56 134 60 156 M100 114 Q104 134 100 156" fill="none" stroke={s.gurt} strokeWidth={4.5} />
        </>
      )}

      {/* Eulen-Anstecker */}
      <circle cx={94} cy={134} r={6.5} fill="#6c4ce0" stroke={LINIE} strokeWidth={2} />
      <circle cx={91.6} cy={133} r={2.3} fill="#ffffff" />
      <circle cx={96.4} cy={133} r={2.3} fill="#ffffff" />
      <circle cx={91.8} cy={133.2} r={1} fill={LINIE} />
      <circle cx={96.2} cy={133.2} r={1} fill={LINIE} />
      <path d="M93 136 L94 137.6 L95 136Z" fill="#f5a524" />

      <circle cx={54} cy={166} r={8} fill={`url(#${haut})`} stroke={LINIE} strokeWidth={3} />

      {/* winkender Arm (Animation: .kf-winken, Drehpunkt Schulter) */}
      <g className="kf-winken">
      <path d="M104 122 Q122 110 128 84" fill="none" stroke={LINIE} strokeWidth={19} />
      <path d="M104 122 Q122 110 128 84" fill="none" stroke={s.pulli[1]} strokeWidth={13} />
      <path d="M123 88 L133 90" stroke={s.dunkel} strokeWidth={4} />
      <path d="M121 78 Q119 66 126 64 L127 72 Q129 60 134 62 Q137 64 135 72 Q140 70 140 76 Q138 86 128 86 Q122 85 121 78Z" fill={`url(#${haut})`} stroke={LINIE} strokeWidth={3} />
      </g>

      {/* Ohren, Hals, Kopf */}
      <circle cx={45} cy={78} r={8} fill={s.haut[1]} stroke={LINIE} strokeWidth={3.5} />
      <circle cx={115} cy={78} r={8} fill={s.haut[1]} stroke={LINIE} strokeWidth={3.5} />
      <rect x={72} y={98} width={16} height={12} rx={5} fill={s.haut[1]} />
      <circle cx={80} cy={70} r={36} fill={`url(#${haut})`} stroke={LINIE} strokeWidth={3.5} />
      <Haare s={s} />

      {/* Gesicht */}
      <path d="M60 70 Q66 66 72 69 M88 69 Q94 66 100 70" fill="none" stroke={LINIE} strokeWidth={2.6} />
      <ellipse cx={66} cy={81} rx={5.2} ry={6.6} fill={s.augen} stroke={LINIE} strokeWidth={s.augen === LINIE ? 0 : 1.6} />
      <ellipse cx={94} cy={81} rx={5.2} ry={6.6} fill={s.augen} stroke={LINIE} strokeWidth={s.augen === LINIE ? 0 : 1.6} />
      <circle cx={68} cy={78.5} r={2.2} fill="#ffffff" />
      <circle cx={96} cy={78.5} r={2.2} fill="#ffffff" />
      <circle cx={64.6} cy={84} r={1} fill="#ffffff" />
      <circle cx={92.6} cy={84} r={1} fill="#ffffff" />
      <ellipse cx={56} cy={92} rx={6} ry={3.6} fill="#f2777a" opacity={0.45} />
      <ellipse cx={104} cy={92} rx={6} ry={3.6} fill="#f2777a" opacity={0.45} />
      <path d="M78 88 Q80 90 82 88" fill="none" stroke={LINIE} strokeWidth={2} opacity={0.6} />
      <Mundform mund={s.mund} />
    </g>
  );
}

/** Figur als eigenes kleines Bild (für die Auswahl). `ausschnitt` = viewBox, z. B. nur der Kopf. */
export function KinderFigurBild({ art, entwurf, className = "", ausschnitt = "20 10 130 225" }: { art: FigurArt; entwurf?: Aussehen; className?: string; ausschnitt?: string }) {
  return (
    <svg viewBox={ausschnitt} className={className} aria-hidden="true" focusable="false">
      <KinderFigur art={art} entwurf={entwurf} />
    </svg>
  );
}

/** Haare von hinten: bedecken fast den ganzen Kopf */
function HaareHinten({ s }: { s: Stil }) {
  if (s.frisur === "locken") {
    const locken: [number, number, number][] = [
      [50, 60, 11], [56, 44, 12], [68, 34, 12], [80, 31, 12], [92, 34, 12], [104, 44, 12], [110, 60, 11],
      [50, 78, 11], [62, 92, 12], [80, 98, 12], [98, 92, 12], [110, 78, 11],
    ];
    return (
      <>
        {locken.map(([cx, cy, r]) => <circle key={`l${cx}${cy}`} cx={cx} cy={cy} r={r} fill={s.haar} stroke={LINIE} strokeWidth={3} />)}
        <circle cx={80} cy={64} r={30} fill={s.haar} />
        <circle cx={66} cy={74} r={14} fill={s.haar} />
        <circle cx={94} cy={74} r={14} fill={s.haar} />
      </>
    );
  }
  if (s.frisur === "lang") {
    return (
      <>
        <path d="M44 76 Q40 30 80 32 Q120 30 116 76 Q122 108 112 124 Q80 130 48 124 Q38 108 44 76Z" fill={s.haar} stroke={LINIE} strokeWidth={3.5} />
        <path d="M62 44 Q72 38 84 40" fill="none" stroke={s.glanz} strokeWidth={3} />
        <path d="M80 34 V124" fill="none" stroke={s.glanz} strokeWidth={2} opacity={0.6} />
      </>
    );
  }
  return (
    <>
      <path d="M44 76 Q40 30 80 32 Q120 30 116 76 Q118 96 104 102 Q80 108 56 102 Q42 96 44 76Z" fill={s.haar} stroke={LINIE} strokeWidth={3.5} />
      <path d="M62 44 Q72 38 84 40" fill="none" stroke={s.glanz} strokeWidth={3} />
      <path d="M80 34 V100" fill="none" stroke={s.glanz} strokeWidth={2} opacity={0.6} />
      {s.frisur === "kurz" && <path d="M74 34 Q76 18 92 20 Q84 25 86 34Z" fill={s.haar} stroke={LINIE} strokeWidth={3} />}
    </>
  );
}

/** Dieselbe Figur von hinten (für die Themenwelt: das Kind schaut auf die Kacheln) */
export function KinderFigurRuecken({ art }: { art: FigurArt }) {
  const s = useStil(art);
  const id = useId().replace(/:/g, "");
  const pulli = `${id}-pulli`, tasche = `${id}-tasche`;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <linearGradient id={pulli} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={s.pulli[0]} /><stop offset="1" stopColor={s.pulli[1]} /></linearGradient>
        {s.tasche && <linearGradient id={tasche} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.tasche[0]} /><stop offset="1" stopColor={s.tasche[1]} /></linearGradient>}
      </defs>
      <ellipse cx={80} cy={224} rx={42} ry={8} fill={LINIE} opacity={0.25} />

      {/* Zöpfe */}
      {s.frisur === "zoepfe" && <HaareHinterKopf s={s} versatz={2} />}

      {/* Beine und Schuhe (Fersen) */}
      <path d="M68 172 L66 204 M92 172 L94 204" stroke={LINIE} strokeWidth={20} />
      <path d="M68 172 L66 204" stroke={s.hose[0]} strokeWidth={14} />
      <path d="M92 172 L94 204" stroke={s.hose[1]} strokeWidth={14} />
      <path d="M54 216 Q53 202 66 201 Q78 202 78 216Z" fill="#ffffff" stroke={LINIE} strokeWidth={3.5} />
      <path d="M82 216 Q82 202 94 201 Q107 202 106 216Z" fill="#ffffff" stroke={LINIE} strokeWidth={3.5} />
      <path d="M58 211 H74 M86 211 H102" stroke={s.schuh} strokeWidth={4} />

      {/* Arme hängen locker */}
      <path d="M56 124 Q46 146 50 166 M104 124 Q114 146 110 166" fill="none" stroke={LINIE} strokeWidth={19} />
      <path d="M56 124 Q46 146 50 166" fill="none" stroke={s.pulli[1]} strokeWidth={13} />
      <path d="M104 124 Q114 146 110 166" fill="none" stroke={s.pulli[1]} strokeWidth={13} />
      <circle cx={50} cy={170} r={8} fill={s.haut[1]} stroke={LINIE} strokeWidth={3} />
      <circle cx={110} cy={170} r={8} fill={s.haut[1]} stroke={LINIE} strokeWidth={3} />

      {/* Pulli mit Kapuze */}
      <path d="M54 116 Q80 104 106 116 Q114 146 108 178 Q80 186 52 178 Q46 146 54 116Z" fill={`url(#${pulli})`} stroke={LINIE} strokeWidth={3.5} />
      <path d="M50 170 Q80 178 110 170 L108 178 Q80 186 52 178Z" fill={s.dunkel} />
      <path d="M58 112 Q80 142 102 112 Q80 102 58 112Z" fill={s.dunkel} stroke={LINIE} strokeWidth={3} />

      {/* Rucksack von hinten */}
      {s.tasche && (
        <>
          <path d="M62 112 Q60 122 62 128 M98 112 Q100 122 98 128" fill="none" stroke={LINIE} strokeWidth={8} />
          <path d="M62 112 Q60 122 62 128 M98 112 Q100 122 98 128" fill="none" stroke={s.gurt} strokeWidth={4.5} />
          <rect x={50} y={124} width={60} height={56} rx={16} fill={`url(#${tasche})`} stroke={LINIE} strokeWidth={3.5} />
          <path d="M50 142 Q80 134 110 142 L110 136 Q110 124 94 124 H66 Q50 124 50 136Z" fill={s.tasche[1]} stroke={LINIE} strokeWidth={3} />
          <rect x={62} y={152} width={36} height={20} rx={7} fill={s.tasche[0]} stroke={LINIE} strokeWidth={2.5} />
          <circle cx={80} cy={142} r={4} fill="#6c4ce0" stroke={LINIE} strokeWidth={2} />
        </>
      )}

      {/* Kopf von hinten */}
      <circle cx={45} cy={76} r={8} fill={s.haut[1]} stroke={LINIE} strokeWidth={3.5} />
      <circle cx={115} cy={76} r={8} fill={s.haut[1]} stroke={LINIE} strokeWidth={3.5} />
      <rect x={72} y={98} width={16} height={12} rx={5} fill={s.haut[1]} />
      <circle cx={80} cy={70} r={36} fill={s.haut[1]} stroke={LINIE} strokeWidth={3.5} />
      <HaareHinten s={s} />
      {s.frisur === "zoepfe" && (
        <>
          <circle cx={42} cy={74} r={5} fill={s.spange} stroke={LINIE} strokeWidth={2.5} />
          <circle cx={118} cy={74} r={5} fill={s.spange} stroke={LINIE} strokeWidth={2.5} />
        </>
      )}
    </g>
  );
}
