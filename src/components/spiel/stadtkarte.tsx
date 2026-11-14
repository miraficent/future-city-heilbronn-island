"use client";

import type { Punkt } from "@/lib/spiel";
import type { Stadt } from "@/lib/stadt";
import { ThemenSymbol } from "./themen-symbol";

/**
 * Übersichtskarte der Spielwelt mit beschrifteten Lernhäusern.
 * Klein in der Ecke – groß als eigene Ansicht mit Zoom. Antippen eines Hauses startet den Weg dorthin.
 */
export function StadtKarte({ stadt, position, erledigt, gross = false, zoom = 1, onHaus, onPlatz }: {
  stadt: Stadt;
  position: Punkt;
  erledigt: string[];
  gross?: boolean;
  zoom?: number;
  onHaus?: (id: string) => void;
  onPlatz?: () => void;
}) {
  const n = new Map(stadt.knoten.map((k) => [k.id, k]));
  const breite = stadt.breite / zoom;
  const hoehe = stadt.hoehe / zoom;
  const kx = Math.max(0, Math.min(stadt.breite - breite, position.x - breite / 2));
  const ky = Math.max(0, Math.min(stadt.hoehe - hoehe, position.y - hoehe / 2));
  const schrift = gross ? 1 : 1.6;

  return (
    <svg viewBox={`${kx} ${ky} ${breite} ${hoehe}`} className={gross ? "stadtkarte-gross" : "stadtkarte-mini"} role="img" aria-label="Karte der Spielwelt mit allen Lernhäusern und deiner Position">
      <rect width={stadt.breite} height={stadt.hoehe} fill="#cfe0b4" />
      <ellipse cx={stadt.teich.x} cy={stadt.teich.y} rx={stadt.teich.rx} ry={stadt.teich.ry} fill="#7eb9c2" />
      <rect x="0" y={stadt.strasse.oben} width={stadt.strasse.wende.x} height={stadt.strasse.unten - stadt.strasse.oben} fill="#5d6b6e" />
      <circle cx={stadt.strasse.wende.x} cy={stadt.strasse.wende.y} r={stadt.strasse.wende.r} fill="#5d6b6e" />
      <rect x="0" y={stadt.strasse.oben - 30} width={stadt.strasse.tunnelBreite} height={stadt.strasse.unten - stadt.strasse.oben + 60} fill="#4f4c45" />
      {stadt.kanten.map((k, i) => {
        const a = n.get(k.von);
        const b = n.get(k.nach);
        if (!a || !b) return null;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={k.art === "zebra" ? "#fbf7ee" : "#f1dfb5"} strokeWidth={k.art === "platz" ? k.breite : k.breite * 0.8} strokeLinecap="round" />;
      })}
      <g
        role={onPlatz ? "button" : undefined}
        aria-label={onPlatz ? "Zur Rakete laufen" : undefined}
        onClick={onPlatz}
        className={onPlatz ? "karte-ziel" : undefined}
        transform={`translate(${stadt.platz.x} ${stadt.platz.y})`}
      >
        <circle r={stadt.platz.r * 0.9} fill="#f1dfb5" stroke="#254950" strokeWidth="6" />
        <path d="M0-70c26 22 30 60 20 92h-40c-10-32-6-70 20-92Z" fill="#fbf7ee" stroke="#254950" strokeWidth="8" />
        <circle cy="-10" r="14" fill="#7fe3ff" stroke="#254950" strokeWidth="5" />
        {gross && <text y={stadt.platz.r + 70} textAnchor="middle" fontSize="60" fontWeight="800" fill="#1c1934">Rakete</text>}
      </g>
      {stadt.haeuser.map((h) => {
        const fertig = erledigt.includes(h.station.id);
        return (
          <g
            key={h.station.id}
            role={onHaus ? "button" : undefined}
            aria-label={onHaus ? `Zu ${h.station.kurz} (${h.station.name}) laufen` : undefined}
            className={onHaus ? "karte-ziel" : undefined}
            onClick={onHaus ? () => onHaus(h.station.id) : undefined}
          >
            <rect x={h.flaeche.x} y={h.flaeche.y} width={h.flaeche.breite} height={h.flaeche.hoehe} rx="24" fill={h.station.farbe} stroke="#254950" strokeWidth="10" />
            <g transform={`translate(${h.mitteX} ${h.flaeche.y + h.flaeche.hoehe * 0.42})`}>
              <ThemenSymbol thema={h.station.symbol} groesse={gross ? 150 : 120} />
            </g>
            {gross ? (
              <g transform={`translate(${h.mitteX} ${h.reihe === "oben" ? h.flaeche.y - 20 : h.flaeche.y + h.flaeche.hoehe + 20})`}>
                <rect x="-250" y={h.reihe === "oben" ? -128 : 0} width="500" height="128" rx="26" fill="#fff7df" stroke="#254950" strokeWidth="8" />
                <text y={h.reihe === "oben" ? -66 : 62} textAnchor="middle" fontSize="62" fontWeight="800" fill="#1c1934">{h.station.kurz}</text>
                <text y={h.reihe === "oben" ? -18 : 110} textAnchor="middle" fontSize="40" fill="#4a4560">{h.station.name}</text>
              </g>
            ) : (
              <text x={h.mitteX} y={h.flaeche.y + h.flaeche.hoehe - 26} textAnchor="middle" fontSize={34 * schrift} fontWeight="800" fill="#1c1934">
                {h.station.kurz}
              </text>
            )}
            {fertig && <circle cx={h.flaeche.x + h.flaeche.breite - 10} cy={h.flaeche.y + 10} r="30" fill="#5dbb63" stroke="#fbf7ee" strokeWidth="8" />}
          </g>
        );
      })}
      <g transform={`translate(${position.x} ${position.y})`}>
        <circle r={gross ? 30 : 46} fill="#2f4bff" opacity="0.25" className="karte-puls" />
        <circle r={gross ? 18 : 28} fill="#2f4bff" stroke="#fbf7ee" strokeWidth="8" />
      </g>
    </svg>
  );
}
