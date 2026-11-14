"use client";

import type { Figur as FigurDaten } from "@/lib/figuren";
import type { Punkt } from "@/lib/spiel";
import type { Stadt } from "@/lib/stadt";
import { Figur } from "./figur";
import { PixelGrafik } from "./pixel-grafik";
import { ThemenSymbol } from "./themen-symbol";

/**
 * Übersichtskarte der Spielwelt mit den echten Hausbildern und Namen.
 * Klein in der Ecke – groß als eigene Ansicht mit Zoom. Antippen eines Hauses startet den Weg dorthin.
 */
export function StadtKarte({ stadt, position, erledigt, gross = false, zoom = 1, onHaus, onPlatz, figur, teile }: {
  stadt: Stadt;
  position: Punkt;
  erledigt: string[];
  gross?: boolean;
  zoom?: number;
  onHaus?: (id: string) => void;
  onPlatz?: () => void;
  figur?: FigurDaten;
  teile?: number;
}) {
  const n = new Map(stadt.knoten.map((k) => [k.id, k]));
  const breite = stadt.breite / zoom;
  const hoehe = stadt.hoehe / zoom;
  const kx = Math.max(0, Math.min(stadt.breite - breite, position.x - breite / 2));
  const ky = Math.max(0, Math.min(stadt.hoehe - hoehe, position.y - hoehe / 2));
  const { oben, unten, wende, tunnelBreite } = stadt.strasse;
  const schild = gross ? 1 : 1.5;

  return (
    <svg viewBox={`${kx} ${ky} ${breite} ${hoehe}`} className={gross ? "stadtkarte-gross" : "stadtkarte-mini"} role="img" aria-label="Karte der Spielwelt mit allen Lernhäusern, der Rakete und deiner Position">
      <defs>
        <clipPath id={gross ? "kopf-gross" : "kopf-mini"}>
          <circle r={gross ? 40 : 55} />
        </clipPath>
      </defs>
      <rect width={stadt.breite} height={stadt.hoehe} fill="#d6e5bf" />
      <ellipse cx={stadt.teich.x} cy={stadt.teich.y} rx={stadt.teich.rx} ry={stadt.teich.ry} fill="#7eb9c2" stroke="#5f9aa3" strokeWidth="8" />
      <rect x="0" y={oben} width={wende.x} height={unten - oben} fill="#5d6b6e" />
      <circle cx={wende.x} cy={wende.y} r={wende.r} fill="#5d6b6e" />
      <circle cx={wende.x} cy={wende.y} r={30} fill="#7fae62" />
      <path d={`M${tunnelBreite + 30} ${(oben + unten) / 2}H${wende.x - 70}`} stroke="#f3ecdc" strokeWidth="8" strokeDasharray="40 30" />
      <path d={`M-40 ${oben - 130} Q${tunnelBreite + 40} ${oben - 110} ${tunnelBreite + 6} ${(oben + unten) / 2} Q${tunnelBreite + 40} ${unten + 110} -40 ${unten + 130} Z`} fill="#8fb874" />
      {stadt.kanten.map((k, i) => {
        const a = n.get(k.von);
        const b = n.get(k.nach);
        if (!a || !b) return null;
        if (k.art === "zebra") {
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fbf7ee" strokeWidth={k.breite} strokeDasharray="14 12" />;
        }
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f1dfb5" strokeWidth={k.art === "platz" ? k.breite : k.breite * 0.9} strokeLinecap="round" />;
      })}

      <g
        role={onPlatz ? "button" : undefined}
        aria-label={onPlatz ? "Zur Rakete laufen" : undefined}
        onClick={onPlatz}
        className={onPlatz ? "karte-ziel" : undefined}
        transform={`translate(${stadt.platz.x} ${stadt.platz.y})`}
      >
        <circle r={stadt.platz.r} fill="#f1dfb5" stroke="#254950" strokeWidth="6" />
        <path d="M0-82c30 26 34 70 22 104h-44c-12-34-8-78 22-104Z" fill="#fbf7ee" stroke="#254950" strokeWidth="9" />
        <path d="M-22 22-44 44M22 22l22 22" stroke="#254950" strokeWidth="12" strokeLinecap="round" />
        <circle cy="-16" r="15" fill="#7fe3ff" stroke="#254950" strokeWidth="6" />
        {teile !== undefined && (
          <g transform={`translate(${stadt.platz.r * 0.75} ${-stadt.platz.r * 0.75})`}>
            <circle r={34 * schild} fill="#f2a900" stroke="#254950" strokeWidth="6" />
            <text y={13 * schild} textAnchor="middle" fontSize={38 * schild} fontWeight="800" fill="#1c1934">{teile}/{stadt.haeuser.length}</text>
          </g>
        )}
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
            <rect x={h.flaeche.x - 10} y={h.flaeche.y - 10} width={h.flaeche.breite + 20} height={h.flaeche.hoehe + 20} rx="30" fill={h.station.farbe} opacity="0.35" />
            <PixelGrafik motiv={h.station.grafik} x={h.flaeche.x} y={h.flaeche.y} breite={h.flaeche.breite} hoehe={h.flaeche.hoehe} />
            <g transform={`translate(${h.mitteX} ${h.reihe === "oben" ? h.flaeche.y - 30 : h.flaeche.y + h.flaeche.hoehe + 30})`}>
              {gross ? (
                <>
                  <rect x="-250" y={h.reihe === "oben" ? -128 : 0} width="500" height="128" rx="26" fill="#fff7df" stroke="#254950" strokeWidth="8" />
                  <g transform={`translate(-190 ${h.reihe === "oben" ? -64 : 64})`}><ThemenSymbol thema={h.station.aufgabe} groesse={70} /></g>
                  <text x="30" y={h.reihe === "oben" ? -66 : 62} textAnchor="middle" fontSize="58" fontWeight="800" fill="#1c1934">{h.station.kurz}</text>
                  <text x="30" y={h.reihe === "oben" ? -18 : 110} textAnchor="middle" fontSize="40" fill="#4a4560">{h.station.name}</text>
                </>
              ) : (
                <>
                  <rect x="-200" y={h.reihe === "oben" ? -110 : 0} width="400" height="110" rx="28" fill="#fff7df" stroke="#254950" strokeWidth="8" />
                  <text y={h.reihe === "oben" ? -36 : 76} textAnchor="middle" fontSize="70" fontWeight="800" fill="#1c1934">{h.station.kurz}</text>
                </>
              )}
            </g>
            {fertig && (
              <g transform={`translate(${h.flaeche.x + h.flaeche.breite - 10} ${h.flaeche.y + 10})`}>
                <circle r="36" fill="#5dbb63" stroke="#fbf7ee" strokeWidth="8" />
                <path d="m-16 0 10 10 20-22" fill="none" stroke="#fbf7ee" strokeWidth="10" />
              </g>
            )}
          </g>
        );
      })}

      <g transform={`translate(${position.x} ${position.y})`}>
        <circle r={gross ? 60 : 80} fill="#2f4bff" opacity="0.25" className="karte-puls" />
        <circle r={gross ? 44 : 60} fill="#ffffff" stroke="#2f4bff" strokeWidth="10" />
        {figur ? (
          <g clipPath={`url(#${gross ? "kopf-gross" : "kopf-mini"})`}>
            <g transform={`translate(0 ${gross ? 52 : 70}) scale(${gross ? 0.95 : 1.3})`}>
              <Figur figur={figur} blick="vorne" />
            </g>
          </g>
        ) : (
          <circle r="20" fill="#2f4bff" />
        )}
      </g>
    </svg>
  );
}
