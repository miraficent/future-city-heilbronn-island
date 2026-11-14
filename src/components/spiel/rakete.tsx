"use client";

import { motion } from "motion/react";

const LINIE = "#254950";

/**
 * Die COSMOS-Rakete auf dem Platz. Jedes Lernhaus liefert ein Teil (Spitze, Antrieb, Flügel, Fenster).
 * Fehlende Teile sind gestrichelt – welche noch fehlen, zeigt die Leiste oben im Spiel.
 */
export function Rakete({ teile, zustand }: { teile: string[]; zustand: "bereit" | "startet" | "weg" }) {
  const hat = (teil: string) => teile.includes(teil);
  const geist = { fill: "#fbf7ee", fillOpacity: 0.45, stroke: LINIE, strokeDasharray: "7 6", strokeWidth: 3 };
  const voll = (farbe: string) => ({ fill: farbe, stroke: LINIE, strokeWidth: 4, strokeLinejoin: "round" as const });
  const startet = zustand === "startet";
  const komplett = ["Spitze", "Antrieb", "Flügel", "Fenster"].every(hat);

  return (
    <g>
      {/* Startturm mit Gitter und Blinklicht */}
      <path d="M-104-10v-196M-84-10v-196" stroke="#6f6c62" strokeWidth="6" strokeLinecap="round" />
      <path d="M-104-10-84-38-104-66-84-94-104-122-84-150-104-178-84-206" fill="none" stroke="#8d8a7e" strokeWidth="3" />
      <rect x="-110" y="-214" width="32" height="10" rx="3" fill="#6f6c62" />
      <motion.circle cx="-94" cy="-222" r="6" fill="#e8513a" animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
      {!startet && zustand !== "weg" && <rect x="-84" y="-140" width="52" height="7" rx="3" fill="#8d8a7e" stroke={LINIE} strokeWidth="2" />}

      {/* Startrampe mit Warnstreifen */}
      <rect x="-96" y="-12" width="192" height="26" rx="7" fill="#9b988c" stroke={LINIE} strokeWidth="3" />
      <rect x="-92" y="2" width="184" height="8" fill="#f2c94c" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${-90 + i * 15} 10l7-8h6l-7 8Z`} fill="#2f2f2f" />
      ))}

      {zustand !== "weg" && (
        <motion.g
          initial={false}
          animate={startet ? { y: [0, 4, -6, -1500], x: [0, -2, 2, 0] } : { y: 0, x: 0 }}
          transition={startet ? { duration: 3.4, times: [0, 0.6, 0.7, 1], ease: "easeIn" } : { duration: 0.4 }}
        >
          {startet && (
            <motion.g animate={{ scaleY: [1, 1.5, 0.9, 1.6, 1.1] }} transition={{ duration: 0.35, repeat: Infinity }} style={{ originY: 0 }}>
              <path d="M-26-14C-22 30-8 60 0 92 8 60 22 30 26-14Z" fill="#f2a900" />
              <path d="M-15-14C-12 16-4 40 0 60 4 40 12 16 15-14Z" fill="#e8513a" />
              <path d="M-6-14 0 28 6-14Z" fill="#fff4b0" />
            </motion.g>
          )}

          {/* Flügel (links, rechts, Mittelflosse) */}
          <g {...(hat("Flügel") ? voll("#f2a900") : geist)}>
            <path d="M-30-96C-50-84-66-58-68-20L-50-24-30-46Z" />
            <path d="M30-96C50-84 66-58 68-20L50-24 30-46Z" />
          </g>

          {/* Antrieb: Düse mit Rillen */}
          <g>
            <path d="M-20-46h40l9 32h-58Z" {...(hat("Antrieb") ? voll("#8fa3ab") : geist)} />
            {hat("Antrieb") && <path d="M-22-36h44M-25-25h50" stroke="#5f7680" strokeWidth="3" />}
          </g>

          {/* Rumpf mit Schattenseite und Nieten */}
          <path d="M-30-44C-35-92-34-140-28-162h56c6 22 7 70 2 118Z" fill="#fbf7ee" />
          <path d="M12-162h16c6 22 7 70 2 118H12Z" fill="#ded7c6" />
          <path d="M-30-44C-35-92-34-140-28-162h56c6 22 7 70 2 118Z" fill="none" stroke={LINIE} strokeWidth="4" strokeLinejoin="round" />
          <path d="M-31-62h62" stroke={LINIE} strokeWidth="2" opacity="0.35" />
          {[-24, -12, 0, 12, 24].map((x) => <circle key={x} cx={x} cy="-55" r="1.8" fill={LINIE} opacity="0.45" />)}
          <rect x="-33" y="-82" width="66" height="10" fill="#e8513a" />
          <text x="0" y="-89" textAnchor="middle" fontSize="11" fontWeight="900" fill={LINIE} letterSpacing="1.5">COSMOS</text>
          {hat("Flügel") && <rect x="-4" y="-70" width="8" height="58" rx="3" fill="#d48f00" stroke={LINIE} strokeWidth="3" />}

          {/* Fenster: Bullauge mit Metallring */}
          <circle cx="0" cy="-124" r="20" {...(hat("Fenster") ? voll("#b7c3c8") : geist)} />
          {hat("Fenster") && (
            <g>
              <circle cx="0" cy="-124" r="13" fill="#7fe3ff" stroke={LINIE} strokeWidth="2.5" />
              <path d="M-8-128a9 9 0 0 1 8-7" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              {Array.from({ length: 8 }, (_, i) => {
                const w = (i / 8) * Math.PI * 2;
                return <circle key={i} cx={Math.cos(w) * 16.5} cy={-124 + Math.sin(w) * 16.5} r="1.4" fill={LINIE} />;
              })}
            </g>
          )}

          {/* Spitze mit Glanzlicht */}
          <path d="M-28-162C-26-202-12-230 0-242 12-230 26-202 28-162Z" {...(hat("Spitze") ? voll("#e8513a") : geist)} />
          {hat("Spitze") && (
            <g>
              <path d="M-15-170c1-24 7-42 13-54" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
              <circle cx="0" cy="-244" r="4.5" fill="#f2c94c" stroke={LINIE} strokeWidth="2" />
            </g>
          )}
        </motion.g>
      )}

      {/* Bereit zum Start: kleine Dampfwolken an der Rampe */}
      {komplett && zustand === "bereit" &&
        [-50, 50].map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="-16"
            r="12"
            fill="#ffffff"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1.4, 1.8], y: [0, -14, -26] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1 }}
          />
        ))}

      {startet &&
        [-70, -35, 35, 70].map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="0"
            r="20"
            fill="#f4efe4"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.3, 2, 2.6], x: [0, x * 0.6, x] }}
            transition={{ duration: 2.4, delay: 1.6 + i * 0.12 }}
          />
        ))}

      {zustand === "weg" && (
        <g>
          <motion.g animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <ellipse cx="0" cy="-20" rx="60" ry="18" fill="#ffffff" />
          </motion.g>
          <path d="m0-150 10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3Z" fill="#f2c94c" stroke={LINIE} strokeWidth="4" />
          <text x="0" y="-60" textAnchor="middle" fontSize="20" fontWeight="800" fill={LINIE}>Im All!</text>
        </g>
      )}
    </g>
  );
}
