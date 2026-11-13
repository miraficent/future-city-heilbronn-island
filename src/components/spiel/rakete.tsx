"use client";

import { motion } from "motion/react";

const LINIE = "#254950";

/**
 * Die COSMOS-Rakete auf dem Platz. Jedes Lernhaus liefert ein Teil.
 * Fehlende Teile sind gestrichelt – so sieht jedes Kind sofort, was noch fehlt.
 */
export function Rakete({ teile, startet }: { teile: string[]; startet: boolean }) {
  const hat = (teil: string) => teile.includes(teil);
  const geist = { fill: "#fbf7ee", fillOpacity: 0.35, stroke: LINIE, strokeDasharray: "8 6", strokeWidth: 3 };
  const voll = (farbe: string) => ({ fill: farbe, stroke: LINIE, strokeWidth: 4 });

  return (
    <g>
      <rect x="-78" y="-10" width="156" height="22" rx="6" fill="#8d8a7e" stroke={LINIE} strokeWidth="3" />
      <rect x="-60" y="-4" width="20" height="8" fill="#f2a900" />
      <rect x="40" y="-4" width="20" height="8" fill="#f2a900" />
      <motion.g
        initial={false}
        animate={startet ? { y: [0, 6, -40, -1400], rotate: [0, -1, 1, 0] } : { y: 0, rotate: 0 }}
        transition={startet ? { duration: 3.2, times: [0, 0.18, 0.45, 1], ease: "easeIn" } : { duration: 0.4 }}
      >
        {startet && (
          <motion.g animate={{ scaleY: [1, 1.4, 1, 1.5, 1.1] }} transition={{ duration: 0.4, repeat: Infinity }} style={{ originY: 0 }}>
            <path d="M-20-12 0 70 20-12Z" fill="#f2a900" />
            <path d="M-11-12 0 42 11-12Z" fill="#e8513a" />
          </motion.g>
        )}
        <path d="M-56-24-28-80v56Z" {...(hat("Flügel") ? voll("#f2a900") : geist)} />
        <path d="M56-24 28-80v56Z" {...(hat("Flügel") ? voll("#f2a900") : geist)} />
        <path d="M-22-36h44l8 26h-60Z" {...(hat("Antrieb") ? voll("#8fa3ab") : geist)} />
        <rect x="-30" y="-158" width="60" height="124" rx="10" fill="#fbf7ee" stroke={LINIE} strokeWidth="4" />
        <rect x="-30" y="-74" width="60" height="12" fill="#e8513a" opacity="0.85" />
        <circle cx="0" cy="-118" r="16" {...(hat("Fenster") ? voll("#7fe3ff") : geist)} />
        {hat("Fenster") && <rect x="-8" y="-128" width="6" height="6" fill="#fbf7ee" />}
        <path d="M-30-156Q0-226 30-156Z" {...(hat("Spitze") ? voll("#e8513a") : geist)} />
        <text x="0" y="-86" textAnchor="middle" fontSize="13" fontWeight="800" fill={LINIE} letterSpacing="1">COSMOS</text>
      </motion.g>
    </g>
  );
}
