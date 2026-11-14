"use client";

import { motion } from "motion/react";
import { ThemenSymbol } from "./themen-symbol";

const LINIE = "#254950";

type TeilInfo = { teil: string; farbe: string; aufgabe: string };

/**
 * Die COSMOS-Rakete auf dem Platz. Jedes Lernhaus liefert ein Teil.
 * Fehlende Teile sind gestrichelt, und die Tafel daneben zeigt, aus welchem Haus sie kommen.
 */
export function Rakete({ teile, zustand, stationen }: { teile: string[]; zustand: "bereit" | "startet" | "weg"; stationen: TeilInfo[] }) {
  const hat = (teil: string) => teile.includes(teil);
  const geist = { fill: "#fbf7ee", fillOpacity: 0.4, stroke: LINIE, strokeDasharray: "8 6", strokeWidth: 3 };
  const voll = (farbe: string) => ({ fill: farbe, stroke: LINIE, strokeWidth: 4 });
  const startet = zustand === "startet";

  return (
    <g>
      {/* Startrampe */}
      <rect x="-82" y="-10" width="164" height="24" rx="6" fill="#8d8a7e" stroke={LINIE} strokeWidth="3" />
      {[-60, 40].map((x) => <rect key={x} x={x} y="-4" width="20" height="9" fill="#f2a900" />)}
      <path d="M-70-10v-70M70-10v-70" stroke="#6f6c62" strokeWidth="6" />
      <path d="M-70-50h22M70-50H48" stroke="#6f6c62" strokeWidth="5" />

      {zustand !== "weg" && (
        <motion.g
          initial={false}
          animate={startet ? { y: [0, 4, -6, -1500], x: [0, -2, 2, 0] } : { y: 0, x: 0 }}
          transition={startet ? { duration: 3.4, times: [0, 0.6, 0.7, 1], ease: "easeIn" } : { duration: 0.4 }}
        >
          {startet && (
            <motion.g animate={{ scaleY: [1, 1.5, 0.9, 1.6, 1.1] }} transition={{ duration: 0.35, repeat: Infinity }} style={{ originY: 0 }}>
              <path d="M-22-12 0 80 22-12Z" fill="#f2a900" />
              <path d="M-12-12 0 50 12-12Z" fill="#e8513a" />
              <path d="M-5-12 0 24 5-12Z" fill="#fff4b0" />
            </motion.g>
          )}
          <path d="M-58-24-30-82v58Z" {...(hat("Flügel") ? voll("#f2a900") : geist)} />
          <path d="M58-24 30-82v58Z" {...(hat("Flügel") ? voll("#f2a900") : geist)} />
          <path d="M-22-36h44l8 26h-60Z" {...(hat("Antrieb") ? voll("#8fa3ab") : geist)} />
          <rect x="-30" y="-160" width="60" height="126" rx="12" fill="#fbf7ee" stroke={LINIE} strokeWidth="4" />
          <rect x="-30" y="-76" width="60" height="12" fill="#e8513a" opacity="0.85" />
          <circle cx="0" cy="-120" r="17" {...(hat("Fenster") ? voll("#7fe3ff") : geist)} />
          {hat("Fenster") && <rect x="-9" y="-130" width="6" height="6" fill="#fff" />}
          <path d="M-30-158Q0-232 30-158Z" {...(hat("Spitze") ? voll("#e8513a") : geist)} />
          <text x="0" y="-88" textAnchor="middle" fontSize="13" fontWeight="800" fill={LINIE} letterSpacing="1">COSMOS</text>
        </motion.g>
      )}

      {zustand === "weg" && (
        <g>
          <motion.g animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <ellipse cx="0" cy="-20" rx="60" ry="18" fill="#ffffff" />
          </motion.g>
          <path d="m0-150 10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3Z" fill="#f2c94c" stroke={LINIE} strokeWidth="4" />
          <text x="0" y="-60" textAnchor="middle" fontSize="20" fontWeight="800" fill={LINIE}>Im All!</text>
        </g>
      )}

      {/* Tafel: welche Teile fehlen noch – mit den Symbolen der Häuser */}
      <g transform="translate(118 -150)">
        <rect x="-6" y="-6" width="98" height="112" rx="12" fill="#fff7df" stroke={LINIE} strokeWidth="3" />
        <path d="M43 106v40" stroke={LINIE} strokeWidth="6" />
        {stationen.map((s, i) => {
          const x = (i % 2) * 46;
          const y = Math.floor(i / 2) * 50;
          const da = hat(s.teil);
          return (
            <g key={s.teil} transform={`translate(${x} ${y})`}>
              <rect width="40" height="44" rx="8" fill={da ? s.farbe : "#efe9da"} stroke={LINIE} strokeWidth="2.5" strokeDasharray={da ? undefined : "5 4"} />
              <g transform="translate(20 22)" opacity={da ? 1 : 0.45}>
                <ThemenSymbol thema={s.aufgabe} groesse={24} />
              </g>
              {da && (
                <g transform="translate(34 6)">
                  <circle r="9" fill="#5dbb63" stroke="#fff" strokeWidth="2" />
                  <path d="m-4 0 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
}
