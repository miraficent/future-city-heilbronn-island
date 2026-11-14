"use client";

/**
 * Einrichtungsseite für Kinder (DESIGN.md § Pages 3 + 4):
 * Banner in Einrichtungsfarbe mit Gebäude → Eule → Kategorie-Blasen (nur mit Angeboten)
 * → Karten-Galerie zum Wischen → Antippen: Eule liest vor, „Da will ich hin!“ (Wunsch für die Eltern).
 */
import { useMemo, useRef, useState } from "react";
import { AppShell, BackButton, Banner, BottomSheet, Button, CategoryBubble, EmptyState, EventCard, OwlGuide } from "@/components/ui";
import { Gebaeude } from "@/components/kinderreise/gebaeude";
import { Symbol } from "@/components/symbol";
import { useSammlung } from "@/components/sammlung";
import type { KartenOrt } from "@/lib/kinderkarte";
import { istAbends, passtZumAlter, type KinderKarte } from "@/lib/kinderkarten";
import { useKinderAlter, useMinute } from "@/lib/kinder-zustand";
import { vorlesen } from "@/lib/sprechen";
import type { Category, CategoryId } from "@/types";

const wochentag = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const alterText = (k: KinderKarte) => (k.ageMax !== null && k.ageMax < 99 ? `${k.ageMin ?? ""}–${k.ageMax}` : `ab ${k.ageMin}`);

export function CheckpointSeite({ ort, karten, kategorien }: { ort: KartenOrt; karten: KinderKarte[]; kategorien: Category[] }) {
  const [alter] = useKinderAlter();
  const minute = useMinute();
  const merk = useSammlung("kind");
  const [kategorie, setKategorie] = useState<CategoryId | null>(null);
  const [offen, setOffen] = useState<KinderKarte | null>(null);
  const leiste = useRef<HTMLDivElement>(null);

  const passend = useMemo(
    () => karten.filter((k) => passtZumAlter(k, alter) && (minute === null || new Date(k.start).getTime() >= minute - 3 * 3_600_000)),
    [karten, alter, minute],
  );
  const vorhanden = kategorien
    .map((k) => ({ ...k, anzahl: passend.filter((x) => x.kategorien.includes(k.id)).length }))
    .filter((k) => k.anzahl > 0);
  const liste = kategorie ? passend.filter((k) => k.kategorien.includes(kategorie)) : passend;
  const kat = (k: KinderKarte) => kategorien.find((c) => c.id === k.kategorien[0]);

  function blaettern(richtung: 1 | -1) {
    const el = leiste.current;
    if (!el) return;
    const sanft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: richtung * el.clientWidth * 0.8, behavior: sanft ? "smooth" : "auto" });
  }

  function oeffne(k: KinderKarte) {
    setOffen(k);
    vorlesen(`${k.titel}. ${k.geschichte}`);
  }

  return (
    <AppShell modus="kinder">
      <div className="checkpoint">
        <div className="checkpoint__oben">
          <BackButton href="/kinder/">Zur Karte</BackButton>
        </div>
        <Banner
          titel={ort.name}
          farbe={ort.farbe}
          bild={
            <svg viewBox="-95 -160 190 175" aria-hidden="true">
              <Gebaeude art={ort.gebaeude} farbe={ort.farbe} symbol={ort.symbol} />
            </svg>
          }
        />

        <div className="checkpoint__inhalt">
          {passend.length === 0 ? (
            <EmptyState text="Hier ist gerade nichts – schau mal in einem anderen Haus!">
              <Button variante="primary" groesse="kids" icon="map" href="/kinder/">Zur Karte</Button>
            </EmptyState>
          ) : (
            <>
              <OwlGuide text={ort.id === "cosmos" ? "Hier siehst du alles, was in Heilbronn los ist. Was magst du entdecken?" : "Hallo! Was magst du heute entdecken?"} />

              <div className="checkpoint__kategorien" role="group" aria-label="Themen">
                <CategoryBubble icon="star" label="Alles" anzahl={passend.length} farbe="var(--night)" aktiv={kategorie === null} onClick={() => setKategorie(null)} />
                {vorhanden.map((k) => (
                  <CategoryBubble key={k.id} icon={k.icon} label={k.label_kids} anzahl={k.anzahl} farbe={k.color} aktiv={kategorie === k.id} onClick={() => setKategorie(k.id)} />
                ))}
              </div>

              <div className="checkpoint__galerie">
                <button type="button" className="checkpoint__blaettern" aria-label="Zurück blättern" onClick={() => blaettern(-1)}>
                  <Symbol name="back" />
                </button>
                <div ref={leiste} className="checkpoint__leiste" role="list" aria-label="Angebote">
                  {liste.map((k) => (
                    <div key={k.id} role="listitem" style={{ display: "contents" }}>
                      <EventCard
                        titel={k.titel}
                        icon={kat(k)?.icon ?? "star"}
                        farbe={kat(k)?.color ?? ort.farbe}
                        wochentag={`${wochentag(k.start).split(",")[0]}, ${uhrzeit(k.start)}`}
                        abends={istAbends(k)}
                        alter={alterText(k)}
                        gratis={k.gratis}
                        beispiel={k.beispiel}
                        gewuenscht={merk.ids.includes(k.id)}
                        onClick={() => oeffne(k)}
                      />
                    </div>
                  ))}
                </div>
                <button type="button" className="checkpoint__blaettern" aria-label="Weiter blättern" onClick={() => blaettern(1)}>
                  <Symbol name="arrow" />
                </button>
              </div>
            </>
          )}
        </div>

        <BottomSheet offen={offen !== null} onSchliessen={() => setOffen(null)} titel={offen?.titel ?? ""}>
          {offen && (
            <>
              <h2 className="checkpoint__sheet-titel">{offen.titel}</h2>
              <p>{wochentag(offen.start)}, {uhrzeit(offen.start)} Uhr · {alterText(offen)} Jahre{offen.gratis ? " · gratis" : ""}</p>
              <OwlGuide text={offen.geschichte} />
              <div className="checkpoint__sheet-knoepfe">
                <Button
                  variante="wish"
                  groesse="kids"
                  icon={merk.ids.includes(offen.id) ? "check" : "heart"}
                  ariaPressed={merk.ids.includes(offen.id)}
                  onClick={() => merk.merken(offen.id)}
                >
                  {merk.ids.includes(offen.id) ? "Deine Eltern sehen es!" : "Da will ich hin!"}
                </Button>
                <Button variante="ghost" groesse="kids" onClick={() => setOffen(null)}>Andere ansehen</Button>
              </div>
            </>
          )}
        </BottomSheet>
      </div>
    </AppShell>
  );
}
