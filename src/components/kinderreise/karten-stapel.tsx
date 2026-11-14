"use client";

/**
 * Event-Karten wischen: nach rechts = „Will ich!“, nach links = „Nein danke“.
 * Wischen per Finger/Maus oder mit den großen Knöpfen (auch per Tastatur).
 */
import { useState } from "react";
import type { Angebot } from "@/lib/angebot";
import { Symbol } from "@/components/symbol";
import { vorlesen } from "./mia";

const SCHWELLE = 110;
const THEMEN_SYMBOL: Record<string, string> = { coding: "robot", ki: "bulb", gaming: "controller" };

const datum = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "short" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const alterText = (a: Angebot) => (a.alterMax !== undefined ? `${a.alterMin ?? ""}–${a.alterMax} Jahre` : `ab ${a.alterMin} Jahren`);

export function KartenStapel({ karten, onFertig }: { karten: Angebot[]; onFertig: (gemocht: Angebot[]) => void }) {
  const [index, setIndex] = useState(0);
  const [gemocht, setGemocht] = useState<Angebot[]>([]);
  const [dx, setDx] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [weg, setWeg] = useState<"links" | "rechts" | null>(null);

  const karte = karten[index];

  function entscheide(magIch: boolean) {
    if (!karte || weg) return;
    setWeg(magIch ? "rechts" : "links");
    const neu = magIch ? [...gemocht, karte] : gemocht;
    setTimeout(() => {
      setGemocht(neu);
      setWeg(null);
      setDx(0);
      if (index + 1 >= karten.length) onFertig(neu);
      else setIndex(index + 1);
    }, 260);
  }

  if (!karte) return null;
  const termin = karte.termine[0]!;
  const vorlesetext = `${karte.titel}. ${alterText(karte)}. Am ${datum(termin.start)}.`;
  const verschiebung = weg === "rechts" ? 600 : weg === "links" ? -600 : dx;

  return (
    <div className="kr-stapel">
      <p className="kr-leise kr-mitte">Karte {index + 1} von {karten.length}</p>
      <article
        className={`kr-event-karte${dx > 40 ? " zeigt-ja" : dx < -40 ? " zeigt-nein" : ""}`}
        style={{ transform: `translateX(${verschiebung}px) rotate(${verschiebung / 25}deg)`, transition: startX === null ? "transform 0.25s" : "none" }}
        onPointerDown={(e) => { setStartX(e.clientX); e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => startX !== null && setDx(e.clientX - startX)}
        onPointerUp={() => {
          setStartX(null);
          if (dx > SCHWELLE) entscheide(true);
          else if (dx < -SCHWELLE) entscheide(false);
          else setDx(0);
        }}
      >
        <div className="kr-event-symbol"><Symbol name={THEMEN_SYMBOL[karte.themen[0] ?? ""] ?? "star"} /></div>
        <h3>{karte.titel}</h3>
        <ul className="kr-fakten">
          <li><Symbol name="calendar" /> {datum(termin.start)}, {uhrzeit(termin.start)} Uhr</li>
          <li><Symbol name="user" /> {alterText(karte)}</li>
          <li><Symbol name="pin" /> {karte.ort.name}</li>
          <li><Symbol name="euro" /> {karte.kosten.text}</li>
        </ul>
        <button type="button" className="kr-vorlesen" aria-label="Karte vorlesen" onPointerDown={(e) => e.stopPropagation()} onClick={() => vorlesen(vorlesetext)}>
          <Symbol name="volume" />
        </button>
        <span className="kr-stempel kr-stempel-ja" aria-hidden="true"><Symbol name="check" /></span>
        <span className="kr-stempel kr-stempel-nein" aria-hidden="true"><Symbol name="close" /></span>
      </article>
      <div className="kr-reihe">
        <button type="button" className="kr-knopf kr-nein" onClick={() => entscheide(false)}><Symbol name="close" /> Nein danke</button>
        <button type="button" className="kr-knopf kr-ja" onClick={() => entscheide(true)}><Symbol name="check" /> Will ich!</button>
      </div>
    </div>
  );
}
