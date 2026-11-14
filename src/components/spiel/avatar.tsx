"use client";
import { createContext, useContext } from "react";
import { FARBEN, HAAR, HAUT, hatKappe, STANDARD_AVATAR, tuchFarbe, type AvatarKonfiguration } from "@/lib/avatar";

export const AvatarKontext = createContext<AvatarKonfiguration>(STANDARD_AVATAR);

const KONTUR = "#343e3a";

function farbe(hex: string, faktor: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(faktor >= 1 ? c + (255 - c) * (faktor - 1) : c * faktor));
  return `#${k.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

/** Unterteil: Stoffhose, Shorts, Rock, Jeans (mit Naht und Taschen) oder Jogginghose (weit, mit Bündchen). */
function Unterteil({ a, unten }: { a: AvatarKonfiguration; unten: string }) {
  const naht = farbe(unten, 0.72);
  switch (a.unterteil) {
    case 1:
      return <path d="M84 236h72l9 67h-39l-6-32-6 32H75Z" fill={unten} />;
    case 2:
      return <path d="m86 236-17 79h102l-17-79" fill={unten} />;
    case 3:
      return (
        <g>
          <path d="M84 236h72l5 99h-34l-7-64-7 64H79Z" fill={unten} />
          <path d="M86 244q10 10 24 0m20 0q14 10 24 0M84 252l-3 80m78-80 3 80" fill="none" stroke="#f2c27a" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M120 238v30" fill="none" stroke={naht} strokeWidth="2" />
        </g>
      );
    case 4:
      return (
        <g>
          <path d="M82 236h76l9 92h-41l-6-58-6 58H73Z" fill={unten} />
          <path d="M74 318h40l1 14H72Zm52 0h40l2 14h-42Z" fill={naht} />
          <path d="M112 242q-4 12-8 14m24-14q4 12 8 14" fill="none" stroke="#fff6e2" strokeWidth="2.5" />
        </g>
      );
    default:
      return <path d="M84 236h72l5 99h-34l-7-64-7 64H79Z" fill={unten} />;
  }
}

/** Oberteil-Details: Pullover mit Bündchen, Zipper-Jacke mit Reißverschluss, Hoodie mit Bändeln und Bauchtasche. */
function OberteilDetails({ a, oben }: { a: AvatarKonfiguration; oben: string }) {
  if (a.oberteil === 1) return <path d="M98 174q22 30 44 0M83 250h74" fill="none" />;
  if (a.oberteil === 2)
    return (
      <g>
        <path d="m102 174 18 24 18-24M120 198v58" fill="none" />
        <rect x="116" y="204" width="8" height="12" rx="2" fill="#d9d4c4" strokeWidth="2" />
        <path d="M85 220h23v15H85m47-15h23v15h-23" fill="#fff4dd60" />
      </g>
    );
  if (a.oberteil === 3)
    return (
      <g>
        <path d="M110 178v26m20-26v26" fill="none" stroke="#fff6e2" strokeWidth="3" />
        <circle cx="110" cy="206" r="3" fill="#fff6e2" stroke="none" />
        <circle cx="130" cy="206" r="3" fill="#fff6e2" stroke="none" />
        <path d="M94 226h52l6 24H88Z" fill={farbe(oben, 0.85)} />
      </g>
    );
  return null;
}

function Augen({ a }: { a: AvatarKonfiguration }) {
  if (a.augen === 1)
    return <path d="M88 115q8-10 16 0m32 0q8-10 16 0" fill="none" strokeWidth="3.5" strokeLinecap="round" />;
  const gross = a.augen === 2;
  const rx = gross ? 9 : 7;
  const ry = gross ? 10.5 : 8.5;
  return (
    <g>
      <ellipse cx="96" cy="112" rx={rx} ry={ry} fill="#fffaf0" strokeWidth="1.5" />
      <ellipse cx="144" cy="112" rx={rx} ry={ry} fill="#fffaf0" strokeWidth="1.5" />
      <ellipse cx="97" cy="113" rx={gross ? 5.5 : 4} ry={gross ? 7 : 5.5} fill={KONTUR} stroke="none" />
      <ellipse cx="145" cy="113" rx={gross ? 5.5 : 4} ry={gross ? 7 : 5.5} fill={KONTUR} stroke="none" />
      <circle cx="99" cy="110" r={gross ? 2.2 : 1.5} fill="#fff" stroke="none" />
      <circle cx="147" cy="110" r={gross ? 2.2 : 1.5} fill="#fff" stroke="none" />
      {gross && <path d="M86 104l-4-4m8 1-2-5m66 8 4-4m-8 1 2-5" fill="none" strokeWidth="2.2" strokeLinecap="round" />}
    </g>
  );
}

/** Haare von hinten: Der Hinterkopf verdeckt das Gesicht, Zopf und Puffs bleiben sichtbar. */
function Hinterkopf({ a, haar }: { a: AvatarKonfiguration; haar: string }) {
  if (a.frisur === 5) return <path d="M120 14C168 14 194 50 194 100C194 140 198 170 202 198L38 198C42 170 46 140 46 100C46 50 72 14 120 14Z" fill={tuchFarbe(a)} />;
  return (
    <g fill={haar}>
      <rect x="61" y="30" width="118" height={a.frisur === 0 || a.frisur === 1 ? 112 : 128} rx="50" />
      {a.frisur === 2 && <path d="M62 120q-8 20 10 30m106-30q8 20-10 30" />}
      {a.frisur === 3 && <path d="M110 140h20l-2 46q-8 8-16 0Z" />}
    </g>
  );
}

/**
 * Die selbst gestaltete Figur. `hinten` zeigt sie von hinten (beim Laufen nach oben).
 * Mit x/y/width/height lässt sie sich direkt in eine größere SVG-Szene setzen.
 */
export function Avatar({ wert, className = "", mini = false, hinten = false, x, y, width, height, label = "Deine selbst gestaltete Figur" }: {
  wert?: AvatarKonfiguration;
  className?: string;
  mini?: boolean;
  hinten?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  label?: string;
}) {
  const kontext = useContext(AvatarKontext);
  const a = wert ?? kontext;
  const haut = HAUT[a.haut] ?? HAUT[0]!;
  const haar = HAAR[a.haar] ?? HAAR[0]!;
  const oben = FARBEN[a.oberfarbe] ?? FARBEN[0]!;
  const unten = FARBEN[a.unterfarbe] ?? FARBEN[0]!;
  const schuh = FARBEN[a.schuhfarbe] ?? FARBEN[0]!;
  const kappe = hatKappe(a);
  return (
    <svg viewBox="0 0 240 380" x={x} y={y} width={width} height={height} className={`eigener-avatar ${className}`} role="img" aria-label={label} focusable="false">
      <ellipse cx="120" cy="363" rx="68" ry="10" fill="#284c3920" />
      <g stroke={KONTUR} strokeWidth="3" strokeLinejoin="round">
        {!hinten && a.frisur === 3 && <path d="M173 62q65 10 27 112l-24-43 3-64" fill={haar} />}
        {a.frisur === 4 && (
          <g fill={haar}>
            <circle cx="51" cy="68" r="29" />
            <circle cx="189" cy="68" r="29" />
          </g>
        )}
        {a.oberteil === 3 && <path d="M70 196q-14-42 50-48 64 6 50 48Z" fill={farbe(oben, 0.82)} />}
        <path d="M91 291v55h23l6-49 7 49h23v-55" fill={haut} />
        <Unterteil a={a} unten={unten} />
        <path d="M76 341h38v19H66q-6-16 10-19Zm50 0h38q17 3 10 19h-48Z" fill={schuh} />
        {a.schuhe === 1 && <path d="M76 332h38v13H76m50-13h35v13h-35" fill={schuh} />}
        {a.schuhe === 2 && <path d="M77 349h33m20 0h31" stroke="#fff6e2" strokeWidth="5" />}
        <path d="M91 172q-18-3-30 21l-17 56 22 9 25-50m58-36q22-3 32 21l17 56-22 9-25-50" fill={oben} />
        {a.oberteil === 0 && <path d="M54 217l-10 32 22 9 12-27Zm132 0 10 32-22 9-12-27Z" fill={haut} />}
        {(a.oberteil === 1 || a.oberteil === 3) && <path d="M46 244l22 9m128-9-22 9" fill="none" strokeWidth="5" stroke={farbe(oben, 0.75)} />}
        <path d="M45 245q-14 22 0 31 18 8 24-20m127-11q13 22 0 31-18 8-24-20" fill={haut} />
        <path d="M85 175h70l10 81H75Z" fill={oben} />
        <path d="M107 153v26q13 14 26 0v-26" fill={haut} />
        {!hinten && <OberteilDetails a={a} oben={oben} />}
        {a.frisur !== 5 && (
          <>
            <ellipse cx="60" cy="107" rx="13" ry="19" fill={haut} />
            <ellipse cx="180" cy="107" rx="13" ry="19" fill={haut} />
          </>
        )}
        <rect x="65" y="40" width="110" height="124" rx={a.gesicht === 0 ? 48 : a.gesicht === 1 ? 35 : 54} fill={haut} />
        {hinten ? (
          <Hinterkopf a={a} haar={haar} />
        ) : (
          <>
            {a.frisur === 5 ? (
              <g>
                <path d="M120 14C168 14 194 50 194 100C194 140 198 170 202 198L38 198C42 170 46 140 46 100C46 50 72 14 120 14ZM120 60C95 60 76 80 76 112C76 145 95 166 120 166C145 166 164 145 164 112C164 80 145 60 120 60Z" fillRule="evenodd" fill={tuchFarbe(a)} />
                <path d="M74 76Q120 46 166 76M56 150Q66 172 90 182M184 150Q174 172 150 182" fill="none" strokeWidth="2.5" opacity=".55" />
              </g>
            ) : (
              <path
                d={
                  a.frisur === 2 || a.frisur === 4
                    ? "M64 102Q38 65 64 43 60 19 88 23 112-1 131 20 164 12 175 39 199 51 177 95L164 67 145 76 125 51 102 75 84 65Z"
                    : a.frisur === 1
                      ? "M64 94Q48 27 113 23q76-4 64 73l-20-39q-29 32-76 18Z"
                      : "M63 94Q46 28 110 22q78-4 67 72l-19-34-14 8-17-13-17 14-22-9-10 35Z"
                }
                fill={haar}
              />
            )}
            <path d="M86 101q10-6 17 0m34 0q10-6 17 0" fill="none" strokeWidth="3" />
            <Augen a={a} />
            <path d="m120 119-3 11h6m-18 11q15 13 30 0" fill="none" stroke={a.haut >= 4 ? "#f3cdb8" : KONTUR} strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="83" cy="131" rx="9" ry="5" fill="#dc886350" stroke="none" />
            <ellipse cx="157" cy="131" rx="9" ry="5" fill="#dc886350" stroke="none" />
            {a.zubehoer === 1 && (
              <g fill="none">
                <rect x="79" y="103" width="33" height="23" rx="8" />
                <rect x="128" y="103" width="33" height="23" rx="8" />
                <path d="M112 111h16" />
              </g>
            )}
          </>
        )}
        {kappe && (
          <g fill={unten}>
            <path d="M60 66q0-46 60-46t60 46Z" />
            {hinten ? <path d="M104 60h32v8h-32Z" fill={farbe(unten, 0.7)} /> : <path d="M54 64h132q7 0 4 7-2 5-9 5H59q-7 0-9-5-3-7 4-7Z" fill={farbe(unten, 0.75)} />}
            <circle cx="120" cy="22" r="5" />
          </g>
        )}
      </g>
      {!mini && <path d="M87 354h20m26 0h20" stroke="#fff4dd" strokeWidth="3" />}
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
