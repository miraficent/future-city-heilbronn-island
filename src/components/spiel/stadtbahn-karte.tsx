"use client";

import { motion } from "motion/react";
import karte from "@/lib/heilbronn-karte.json";
import { SZENEN } from "@/lib/szenen";
import { Symbol } from "../symbol";

/*
 * Stadtbahn-Plan für Kinder: der echte Neckar und die echten Straßen aus den lokalen OpenStreetMap-Daten,
 * darauf eine gelbe Linie mit den vier Lernorten als Haltestellen.
 */

const BILD: Record<string, string> = { aim: "/medien/spiel/aim.webp", experimenta: "/medien/spiel/experimenta.webp", hdf: "/medien/spiel/hdf.webp", ipai: "/medien/spiel/ipai.webp" };
const SICHT = { x: 11780, y: 6180, b: 1640, h: 1900 };
const LINIE = ["ipai", "aim", "experimenta", "hdf"] as const;

export function StadtbahnKarte({ hier, erfolge, waehle }: { hier: string; erfolge: string[]; waehle: (id: string) => void }) {
  const orte = karte.orte as Record<string, { x: number; y: number }>;
  const linie = LINIE.map((id) => orte[id]!).map((p) => `${p.x} ${p.y}`).join(" L");
  return (
    <div className="bahn-karte">
      <p className="bahn-karte-text">Tippe auf eine Haltestelle. Die Stadtbahn bringt dich hin.</p>
      <svg viewBox={`${SICHT.x} ${SICHT.y} ${SICHT.b} ${SICHT.h}`} role="group" aria-label="Stadtbahn-Plan von Heilbronn mit vier Lernorten">
        <defs>
          <clipPath id="bahn-rund"><circle r="92" /></clipPath>
        </defs>
        <rect x={SICHT.x} y={SICHT.y} width={SICHT.b} height={SICHT.h} fill="#f4eedf" />
        {karte.parks.map((d, i) => <path key={`p${i}`} d={d} fill="#d3e6b8" />)}
        {karte.wald.map((d, i) => <path key={`w${i}`} d={d} fill="#bfd9a6" />)}
        {karte.hauptstrassen.map((d, i) => <path key={`h${i}`} d={d} fill="none" stroke="#e9dcc0" strokeWidth="14" strokeLinecap="round" />)}
        {karte.fluss.map((d, i) => <path key={`f${i}`} d={d} fill="none" stroke="#8cc9d3" strokeWidth="110" strokeLinecap="round" strokeLinejoin="round" />)}
        {karte.kanal.map((d, i) => <path key={`k${i}`} d={d} fill="none" stroke="#8cc9d3" strokeWidth="55" strokeLinecap="round" />)}
        <text x={karte.flussName.x - 20} y={karte.flussName.y + 260} transform={`rotate(-80 ${karte.flussName.x - 20} ${karte.flussName.y + 260})`} className="bahn-neckar">Neckar</text>
        <path d={`M${linie}`} fill="none" stroke="#5a4a1c" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${linie}`} fill="none" stroke="#f4c430" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        {(["marktplatz", "hauptbahnhof"] as const).map((id) => (
          <g key={id} transform={`translate(${orte[id]!.x} ${orte[id]!.y})`}>
            <circle r="22" fill="#fffaf0" stroke="#4a4560" strokeWidth="8" />
            <text y="70" textAnchor="middle" className="bahn-wahrzeichen">{id === "marktplatz" ? "Marktplatz" : "Hauptbahnhof"}</text>
          </g>
        ))}
        {SZENEN.map(({ station: s }) => {
          const p = orte[s.id]!;
          const ist = s.id === hier;
          const sterne = erfolge.filter((e) => e.startsWith(`${s.id}-`)).length;
          return (
            <g
              key={s.id}
              className="bahn-halt"
              transform={`translate(${p.x} ${p.y})`}
              role="button"
              tabIndex={0}
              aria-label={ist ? `${s.name} – du bist hier` : `Fahre zu ${s.name}`}
              onClick={() => waehle(s.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); waehle(s.id); } }}
            >
              {ist && <motion.circle r="120" fill="none" stroke="#2f4bff" strokeWidth="14" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />}
              <circle r="100" fill="#fffaf0" stroke={s.farbe} strokeWidth="18" />
              <g clipPath="url(#bahn-rund)">
                <rect x="-92" y="-92" width="184" height="184" fill="#cfe3ea" />
                <image href={BILD[s.id]} x="-120" y="-70" width="240" height="140" preserveAspectRatio="xMidYMid meet" />
              </g>
              <g transform="translate(0 150)">
                <rect x="-150" y="-42" width="300" height="74" rx="24" fill="#fffaf0" stroke="#254950" strokeWidth="7" />
                <text y="0" textAnchor="middle" className="bahn-name">{s.name}</text>
                <text y="24" textAnchor="middle" className="bahn-sterne">{"★".repeat(sterne)}{"☆".repeat(3 - sterne)}</text>
              </g>
              {ist && (
                <g transform="translate(0 -150)">
                  <rect x="-110" y="-36" width="220" height="56" rx="22" fill="#2f4bff" />
                  <text y="2" textAnchor="middle" className="bahn-hier">Du bist hier</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <p className="bahn-karte-fuss"><Symbol name="info" /> Kartenbild: © OpenStreetMap-Mitwirkende. Die Linie ist für das Spiel vereinfacht.</p>
    </div>
  );
}
