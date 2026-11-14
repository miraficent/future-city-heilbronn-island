"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { AufgabenEinfuehrung } from "@/lib/lernwelt";
import { useVorlesen } from "@/lib/vorlesen";
import { Symbol } from "../symbol";
import { Avatar } from "./avatar";
import { Roboter } from "./pixel-grafik";

/*
 * Ein kurzer Erklärfilm vor jeder Aufgabe: drei Takte, die genau zeigen, was gleich zu tun ist.
 * Jeder Takt wird bei Ton an vorgelesen. Bei „Bewegung reduzieren“ steht das fertige Bild da.
 */

const TAKT_MS = 3200;
const FEDER = { type: "spring", stiffness: 140, damping: 18 } as const;

/** Zeigefinger, der auf etwas tippt. */
function Hand({ x, y, tippt }: { x: number; y: number; tippt: boolean }) {
  return (
    <motion.g initial={false} animate={{ x, y }} transition={{ duration: 0.9, ease: "easeInOut" }}>
      <motion.g animate={tippt ? { scale: [1, 0.82, 1] } : { scale: 1 }} transition={{ duration: 0.5, delay: 0.9 }}>
        {tippt && <motion.circle r="14" fill="none" stroke="#2f4bff" strokeWidth="3" initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.8, delay: 1 }} />}
        <path d="M0 0c-2-8-1-14 3-14s5 6 5 10l1-4c1-4 7-3 7 1l1-2c1-4 7-3 7 2l1-1c1-3 6-2 6 2 0 8-2 16-8 22H6C2 12 1 6 0 0Z" fill="#ffe0c2" stroke="#3a3330" strokeWidth="2" strokeLinejoin="round" />
      </motion.g>
    </motion.g>
  );
}

function Haken({ x, y, sichtbar }: { x: number; y: number; sichtbar: boolean }) {
  return (
    <motion.g initial={false} animate={{ scale: sichtbar ? 1 : 0, opacity: sichtbar ? 1 : 0 }} transition={FEDER} style={{ originX: `${x}px`, originY: `${y}px` }}>
      <circle cx={x} cy={y} r="18" fill="#5dbb63" stroke="#fffaf0" strokeWidth="3" />
      <path d={`M${x - 8} ${y} l5 6 11-12`} fill="none" stroke="#fffaf0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  );
}

/** Programmieren: Pfeile in die Leiste, Start drücken, Roboter fährt zur Fahne. */
function FilmCode({ takt }: { takt: number }) {
  const zelle = 44;
  const weg = [[0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0]];
  const pfeile = [0, 0, 270, 270, 0, 0];
  const fahrt = takt >= 2;
  return (
    <g>
      <g transform="translate(40 12)">
        {Array.from({ length: 15 }, (_, i) => <rect key={i} x={(i % 5) * zelle} y={Math.floor(i / 5) * zelle} width={zelle - 4} height={zelle - 4} rx="8" fill="#eef3df" stroke="#c9d6b0" />)}
        <path d={`M${4 * zelle + 12} 8v26`} stroke="#5a4a3a" strokeWidth="3" />
        <path d={`M${4 * zelle + 13} 8l16 6-16 6Z`} fill="#e8513a" />
        <motion.g initial={false} animate={fahrt ? { x: weg.map(([x]) => x! * zelle), y: weg.map(([, y]) => y! * zelle) } : { x: 0, y: 2 * zelle }} transition={{ duration: fahrt ? 2.4 : 0.3, ease: "linear" }}>
          <Roboter x={2} y={0} breite={36} hoehe={40} />
        </motion.g>
        <Haken x={4 * zelle + 20} y={-2} sichtbar={takt >= 3} />
      </g>
      <g transform="translate(270 20)">
        <rect width="118" height="150" rx="14" fill="#fffaf0" stroke="#254950" strokeWidth="2.5" />
        <text x="59" y="20" textAnchor="middle" fontSize="12" fontWeight="800" fill="#254950">Programm</text>
        {pfeile.map((w, i) => (
          <motion.g key={i} initial={false} animate={{ opacity: takt >= 0 ? 1 : 0, scale: 1 }} transition={{ delay: takt === 0 ? 0.3 + i * 0.35 : 0 }}>
            <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.35 }}>
              <rect x={10 + (i % 3) * 34} y={32 + Math.floor(i / 3) * 34} width="30" height="30" rx="8" fill="#d19a51" />
              <path d="M-7 0h9v-5l8 5-8 5v-5h-9Z" fill="#fffaf0" transform={`translate(${25 + (i % 3) * 34} ${47 + Math.floor(i / 3) * 34}) rotate(${w})`} />
            </motion.g>
          </motion.g>
        ))}
        <motion.g animate={takt === 1 ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.8, repeat: takt === 1 ? 2 : 0 }} style={{ originX: "59px", originY: "126px" }}>
          <rect x="24" y="108" width="70" height="34" rx="12" fill="#2f6b4f" />
          <path d="M52 116l14 9-14 9Z" fill="#fffaf0" />
        </motion.g>
      </g>
      {takt === 1 && <Hand x={310} y={150} tippt />}
      {takt === 0 && <Hand x={300} y={70} tippt={false} />}
    </g>
  );
}

/** Auswählen: Bilder anschauen, das passende antippen, Haken. */
function FilmWahl({ takt }: { takt: number }) {
  const karten = [
    { x: 40, form: <circle cx="50" cy="50" r="28" fill="#ed805c" /> },
    { x: 150, form: <rect x="24" y="24" width="52" height="52" rx="4" fill="#7bbfc4" /> },
    { x: 260, form: <g><circle cx="50" cy="50" r="28" fill="none" stroke="#5a4a3a" strokeWidth="8" /><circle cx="50" cy="50" r="6" fill="#5a4a3a" /></g> },
  ];
  return (
    <g>
      {karten.map((k, i) => {
        const richtig = i !== 1;
        const hervor = takt === 0;
        return (
          <motion.g key={i} initial={false} animate={{ y: hervor ? [0, -8, 0] : 0, opacity: takt >= 2 && !richtig ? 0.35 : 1 }} transition={{ duration: 0.6, delay: hervor ? i * 0.6 : 0 }}>
            <rect x={k.x} y="40" width="100" height="100" rx="16" fill="#fffaf0" stroke={takt >= 2 && richtig ? "#5dbb63" : "#254950"} strokeWidth={takt >= 2 && richtig ? 5 : 2.5} />
            <g transform={`translate(${k.x} 40)`}>{k.form}</g>
            {richtig && <Haken x={k.x + 92} y={44} sichtbar={takt >= 2} />}
          </motion.g>
        );
      })}
      {takt >= 1 && <Hand x={takt === 1 ? 85 : 305} y={110} tippt />}
    </g>
  );
}

/** Schalter: antippen, Strom fließt, die Lampe leuchtet. */
function FilmSchalter({ takt }: { takt: number }) {
  const zu1 = takt >= 1;
  const zu2 = takt >= 1;
  const an = takt >= 2;
  return (
    <g>
      <path d="M60 150V60h90m50 0h80m0 0h40v90H60" fill="none" stroke="#254950" strokeWidth="6" strokeLinejoin="round" />
      <rect x="40" y="88" width="40" height="44" rx="6" fill="#4c9695" stroke="#254950" strokeWidth="3" />
      <text x="60" y="116" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fffaf0">+ −</text>
      <motion.path d="M150 60l46 -26" stroke="#254950" strokeWidth="7" strokeLinecap="round" initial={false} animate={{ rotate: zu1 ? 30 : 0 }} style={{ originX: "150px", originY: "60px" }} transition={FEDER} />
      <circle cx="150" cy="60" r="7" fill="#254950" />
      <circle cx="200" cy="60" r="7" fill="#254950" />
      <motion.circle cx="320" cy="60" r="26" initial={false} animate={{ fill: an ? "#ffd84d" : "#f3ecd9" }} stroke="#254950" strokeWidth="3" />
      {an && [0, 45, 90, 135, 180, 225, 270, 315].map((w) => (
        <motion.path key={w} d="M0-34v-12" stroke="#f2a900" strokeWidth="4" strokeLinecap="round" transform={`translate(320 60) rotate(${w})`} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.6] }} transition={{ duration: 0.8 }} />
      ))}
      {an && <motion.circle r="6" fill="#ffd84d" stroke="#f2a900" strokeWidth="2" initial={{ cx: 60, cy: 150 }} animate={{ cx: [60, 60, 150, 320, 360, 360, 60], cy: [150, 60, 60, 60, 60, 150, 150] }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} />}
      {takt >= 0 && takt < 2 && <Hand x={185} y={zu2 ? 70 : 40} tippt={takt === 0} />}
      <Haken x={372} y={100} sichtbar={takt >= 3} />
      <text x="320" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#254950">{an ? "Licht an!" : "Lampe"}</text>
    </g>
  );
}

/** Bauen: Brett in die Lücke legen, Figur läuft hinüber zur Fahne. */
function FilmBauen({ takt }: { takt: number }) {
  return (
    <g>
      <rect x="20" y="130" width="140" height="50" rx="8" fill="#8db466" />
      <rect x="240" y="130" width="140" height="50" rx="8" fill="#8db466" />
      <rect x="160" y="150" width="80" height="40" fill="#6aa0c4" opacity="0.55" />
      <motion.rect x="158" y="124" width="84" height="12" rx="4" fill="#c98f55" stroke="#8a5b30" strokeWidth="2" initial={false} animate={{ y: takt >= 0 ? 0 : -60, opacity: 1 }} transition={{ ...FEDER, delay: takt === 0 ? 0.8 : 0 }} />
      <path d="M350 130V70" stroke="#5a4a3a" strokeWidth="3" />
      <path d="M351 70l22 8-22 8Z" fill="#e8513a" />
      <motion.g initial={false} animate={{ x: takt >= 1 ? 250 : 0 }} transition={{ duration: takt >= 1 ? 2.2 : 0.3, ease: "linear" }}>
        <motion.g animate={takt === 1 ? { y: [0, -6, 0, -6, 0, -6, 0] } : { y: 0 }} transition={{ duration: 2.2 }}>
          <Avatar mini x={56} y={62} width={44} height={70} label="" />
        </motion.g>
      </motion.g>
      {takt === 0 && <Hand x={200} y={110} tippt />}
      <Haken x={372} y={56} sichtbar={takt >= 2} />
    </g>
  );
}

export function ErklaerFilm({ einfuehrung: m, stumm }: { einfuehrung: AufgabenEinfuehrung; stumm: boolean }) {
  const [takt, setTakt] = useState(0);
  const [durchlauf, setDurchlauf] = useState(0);
  const { kann, sprich, stopp } = useVorlesen();
  const [ruhig] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const sichtbarerTakt = ruhig ? 3 : takt;

  useEffect(() => {
    if (ruhig || takt >= 3) return;
    const uhr = window.setTimeout(() => setTakt((t) => t + 1), TAKT_MS);
    return () => window.clearTimeout(uhr);
  }, [takt, durchlauf, ruhig]);

  useEffect(() => {
    if (stumm || !kann || ruhig) return;
    const satz = takt === 0 ? `${m.text} Erstens: ${m.schritte[0]}.` : takt === 1 ? `Zweitens: ${m.schritte[1]}.` : takt === 2 ? `Drittens: ${m.schritte[2]}.` : "";
    if (satz) sprich(satz);
  }, [takt, durchlauf, stumm, kann, ruhig, sprich, m]);
  useEffect(() => () => stopp(), [stopp]);

  const film = m.beispiel === "code" ? <FilmCode takt={sichtbarerTakt} /> : m.beispiel === "schalter" ? <FilmSchalter takt={sichtbarerTakt} /> : m.beispiel === "bauen" ? <FilmBauen takt={sichtbarerTakt} /> : <FilmWahl takt={sichtbarerTakt} />;

  return (
    <div className="erklaer-film">
      <div className="film-leinwand">
        <svg key={durchlauf} viewBox="0 0 400 200" role="img" aria-label={`Erklärfilm: ${m.schritte.join(", dann ")}`}>
          <rect width="400" height="200" rx="18" fill="#f6f1e1" />
          {film}
        </svg>
        {sichtbarerTakt >= 3 && (
          <button type="button" className="film-nochmal" onClick={() => { setTakt(0); setDurchlauf((d) => d + 1); }}>
            <Symbol name="refresh" /> Nochmal ansehen
          </button>
        )}
      </div>
      <ol className="film-schritte">
        {m.schritte.map((s, i) => (
          <li key={s} className={sichtbarerTakt === i ? "ist-jetzt" : sichtbarerTakt > i ? "ist-fertig" : ""} aria-current={sichtbarerTakt === i ? "step" : undefined}>
            <span>{sichtbarerTakt > i ? <Symbol name="check" /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
