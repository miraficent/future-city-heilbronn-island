"use client";

/**
 * Live-Events einer Einrichtung im Kinder-Modus:
 *   Mia fragt → Kategorie-Knöpfe (nur Kategorien mit kommenden Events) → Karten-Galerie (scroll-snap)
 *   → Karte antippen: Mia liest die Geschichte vor → „Da will ich hin!“ (Wunsch für die Eltern).
 * Bekommt nur Events, die für Kinder freigegeben sind (isForKids, nicht needsReview).
 */
import { useRef, useState } from "react";
import type { Category, CategoryId, LiveEvent } from "@/types";
import { groupByCategory, isEvening, isFree } from "@/lib/events";
import { Symbol } from "@/components/symbol";
import { Mia, vorlesen } from "./mia";

const wochentag = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const alterBadge = (e: LiveEvent) => (e.ageMax !== null && e.ageMin !== null ? `${e.ageMin}–${e.ageMax}` : `ab ${e.ageMin}`);

/** Kleine Sonne / kleiner Mond (keine Emojis – Teamregel) */
function Tageszeit({ abends }: { abends: boolean }) {
  return abends ? (
    <svg viewBox="0 0 24 24" className="kr-tageszeit" aria-label="abends" role="img">
      <path d="M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3Z" fill="#5b6b8a" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="kr-tageszeit" aria-label="tagsüber" role="img">
      <circle cx={12} cy={12} r={5} fill="#F59E0B" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  ortName: string;
  events: LiveEvent[];
  kategorien: Category[];
  wuensche: string[];
  onWunsch: (id: string) => void;
  onZurKarte: () => void;
};

export const wunschId = (e: LiveEvent) => `ev:${e.id}`;

export function EventGalerie({ ortName, events, kategorien, wuensche, onWunsch, onZurKarte }: Props) {
  const gruppen = groupByCategory(events);
  const vorhanden = kategorien.filter((k) => (gruppen[k.id]?.length ?? 0) > 0);
  const [kategorie, setKategorie] = useState<CategoryId | null>(null);
  const [gewaehlt, setGewaehlt] = useState<LiveEvent | null>(null);
  const leiste = useRef<HTMLDivElement>(null);

  if (events.length === 0) {
    return (
      <Mia text="Hier ist gerade nichts – schau mal in einem anderen Haus!">
        <button type="button" className="kr-knopf kr-blau" onClick={onZurKarte}><Symbol name="map" /> Zurück zur Karte</button>
      </Mia>
    );
  }

  const liste = kategorie ? gruppen[kategorie] ?? [] : events;
  const farbe = (e: LiveEvent) => kategorien.find((k) => k.id === e.categories[0])?.color ?? "#3d7be8";
  const symbol = (e: LiveEvent) => kategorien.find((k) => k.id === e.categories[0])?.icon ?? "star";

  function blaettern(richtung: 1 | -1) {
    const el = leiste.current;
    if (!el) return;
    const sanft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: richtung * el.clientWidth * 0.8, behavior: sanft ? "smooth" : "auto" });
  }

  function waehle(e: LiveEvent) {
    setGewaehlt(e);
    vorlesen(`${e.title_kids}. ${e.story_kids}`);
  }

  return (
    <div className="kr-galerie">
      {gewaehlt ? (
        <Mia text={`${gewaehlt.title_kids}. ${gewaehlt.story_kids}`}>
          <button
            type="button"
            className={`kr-knopf ${wuensche.includes(wunschId(gewaehlt)) ? "kr-gruen" : "kr-gelb"} kr-gross-knopf`}
            aria-pressed={wuensche.includes(wunschId(gewaehlt))}
            onClick={() => onWunsch(wunschId(gewaehlt))}
          >
            <Symbol name={wuensche.includes(wunschId(gewaehlt)) ? "check" : "star"} />
            {wuensche.includes(wunschId(gewaehlt)) ? "Im Rucksack!" : "Da will ich hin!"}
          </button>
          <button type="button" className="kr-knopf kr-weiss" onClick={() => setGewaehlt(null)}>Andere ansehen</button>
        </Mia>
      ) : (
        <Mia text={`Hallo! Was magst du heute bei ${ortName} entdecken?`} />
      )}

      {/* Kategorien – nur die, zu denen es hier gerade etwas gibt */}
      <div className="kr-kategorien" role="group" aria-label="Themen">
        <button type="button" className="kr-kategorie" aria-pressed={kategorie === null} onClick={() => setKategorie(null)} style={{ ["--k-farbe" as string]: "#1f2937" }}>
          <span className="kr-kategorie-rund"><Symbol name="star" /><span className="kr-kategorie-zahl">{events.length}</span></span>
          Alles
        </button>
        {vorhanden.map((k) => (
          <button key={k.id} type="button" className="kr-kategorie" aria-pressed={kategorie === k.id} onClick={() => setKategorie(k.id)} style={{ ["--k-farbe" as string]: k.color }}>
            <span className="kr-kategorie-rund"><Symbol name={k.icon} /><span className="kr-kategorie-zahl">{gruppen[k.id]!.length}</span></span>
            {k.label_kids}
          </button>
        ))}
      </div>

      {/* Karten-Galerie: wischen, scrollen oder Pfeile */}
      <div className="kr-galerie-rahmen">
        <button type="button" className="kr-rund kr-blaettern" aria-label="Zurück blättern" onClick={() => blaettern(-1)}>
          <Symbol name="arrow" style={{ transform: "rotate(180deg)" }} />
        </button>
        <div ref={leiste} className="kr-leiste" role="list" aria-label="Veranstaltungen">
          {liste.map((e) => (
            <button
              key={e.id}
              type="button"
              role="listitem"
              className={`kr-galerie-karte${gewaehlt?.id === e.id ? " ist-gewaehlt" : ""}`}
              style={{ ["--k-farbe" as string]: farbe(e) }}
              onClick={() => waehle(e)}
              aria-label={`${e.title_kids}, ${wochentag(e.start)}, ${alterBadge(e)} Jahre${isFree(e) ? ", gratis" : ""}`}
            >
              <span className="kr-galerie-bild" aria-hidden="true">
                <Symbol name={symbol(e)} />
                {wuensche.includes(wunschId(e)) && <span className="kr-galerie-wunsch"><Symbol name="check" /></span>}
              </span>
              <span className="kr-galerie-titel">{e.title_kids}</span>
              <span className="kr-galerie-zeit">
                <Tageszeit abends={isEvening(e)} /> {wochentag(e.start).split(",")[0]}, {uhrzeit(e.start)}
              </span>
              <span className="kr-galerie-badges">
                <span className="kr-badge-alter">{alterBadge(e)}</span>
                {isFree(e) && <span className="kr-badge-gratis">gratis</span>}
                {e.isDummy && <span className="kr-badge-demo">Beispiel</span>}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="kr-rund kr-blaettern" aria-label="Weiter blättern" onClick={() => blaettern(1)}>
          <Symbol name="arrow" />
        </button>
      </div>
    </div>
  );
}
