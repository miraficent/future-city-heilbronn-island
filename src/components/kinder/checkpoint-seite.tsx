"use client";

/**
 * Einrichtungsseite für Kinder als „Themenwelt“ (DESIGN.md Projektentscheidung 12):
 * leuchtender Raum in den Farben der Einrichtung, die Angebote als Kacheln kreuz und quer im Raum
 * (leichtes Wackeln), unten die gewählte Kinderfigur von hinten.
 * Kachel antippen → die Eule kommt und liest vor, worum es geht → „Da will ich hin!“ (Wunsch für die Eltern).
 */
import { useMemo, useState, type CSSProperties } from "react";
import { AppShell, BackButton, Button, EmptyState, OwlGuide } from "@/components/ui";
import { KinderFigurRuecken, type FigurArt } from "@/components/kinderreise/kinder-figuren";
import { Symbol } from "@/components/symbol";
import { useSammlung } from "@/components/sammlung";
import type { KartenOrt } from "@/lib/kinderkarte";
import { istAbends, passtZumAlter, type KinderKarte } from "@/lib/kinderkarten";
import { useKinderAlter, useKinderFigur, useMinute } from "@/lib/kinder-zustand";
import { vorlesen } from "@/lib/sprechen";
import type { Category, CategoryId } from "@/types";

const wochentag = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long" });
const kurzTag = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "numeric" });
const uhrzeit = (iso: string) => new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const alterText = (k: KinderKarte) => (k.ageMax !== null && k.ageMax < 99 ? `${k.ageMin ?? ""}–${k.ageMax}` : `ab ${k.ageMin}`);

/** Raumfarben je Einrichtung: Grund (dunkel) und Leuchtlinien */
const WELTEN: Record<string, { grund: string; licht: string }> = {
  experimenta: { grund: "#0d1640", licht: "#5BB8C4" },
  aim: { grund: "#1a0d45", licht: "#a58bff" },
  hdf: { grund: "#3a1424", licht: "#F28C6B" },
  ipai: { grund: "#04302c", licht: "#2BB3A3" },
  cosmos: { grund: "#2e1a04", licht: "#F59E0B" },
};

/** Plätze im Raum (Mitte in %, Größe, Drehung) – absichtlich unordentlich, unten Mitte bleibt frei für die Figur */
const PLAETZE: { x: number; y: number; s: number; r: number }[] = [
  { x: 18, y: 32, s: 0.9, r: -2 },
  { x: 45, y: 52, s: 1.05, r: 1.5 },
  { x: 54, y: 30, s: 0.8, r: -1 },
  { x: 73, y: 26, s: 1.0, r: 2 },
  { x: 70, y: 55, s: 0.85, r: -2.5 },
  { x: 85, y: 47, s: 1.05, r: -1.5 },
  { x: 24, y: 62, s: 0.8, r: 2.5 },
  { x: 35, y: 22, s: 0.78, r: 1 },
];

export function CheckpointSeite({ ort, karten, kategorien, bild = null }: { ort: KartenOrt; karten: KinderKarte[]; kategorien: Category[]; bild?: string | null }) {
  const [alter] = useKinderAlter();
  const [figurArt] = useKinderFigur<FigurArt>();
  const minute = useMinute();
  const merk = useSammlung("kind");
  const [kategorie, setKategorie] = useState<CategoryId | null>(null);
  const [seite, setSeite] = useState(0);
  const [offen, setOffen] = useState<KinderKarte | null>(null);

  const welt = WELTEN[ort.id] ?? { grund: "#1E2A5A", licht: ort.farbe };
  const passend = useMemo(
    () => karten.filter((k) => passtZumAlter(k, alter) && (minute === null || new Date(k.start).getTime() >= minute - 3 * 3_600_000)),
    [karten, alter, minute],
  );
  const vorhanden = kategorien
    .map((k) => ({ ...k, anzahl: passend.filter((x) => x.kategorien.includes(k.id)).length }))
    .filter((k) => k.anzahl > 0);
  const liste = kategorie ? passend.filter((k) => k.kategorien.includes(kategorie)) : passend;
  const seiten = Math.max(1, Math.ceil(liste.length / PLAETZE.length));
  const aktuelleSeite = Math.min(seite, seiten - 1);
  const sichtbar = liste.slice(aktuelleSeite * PLAETZE.length, (aktuelleSeite + 1) * PLAETZE.length);
  const kat = (k: KinderKarte) => kategorien.find((c) => c.id === k.kategorien[0]);

  function waehleKategorie(id: CategoryId | null) {
    setKategorie(id);
    setSeite(0);
  }

  function oeffne(k: KinderKarte) {
    setOffen(k);
    vorlesen(`${k.titel}. ${k.geschichte}`);
  }

  const raumStil = { "--welt-grund": welt.grund, "--welt-licht": welt.licht } as CSSProperties;

  return (
    <AppShell modus="kinder" voll>
      <div className="welt" style={raumStil}>
        {bild ? (
          <div className="welt__bild" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, eigenes Bild */}
            <img src={bild} alt="" />
          </div>
        ) : (
          <WeltRaum licht={welt.licht} />
        )}

        <div className="welt__oben">
          <BackButton href="/kinder/">Zur Karte</BackButton>
          <h1 className="welt__schild">{ort.name}</h1>
        </div>

        {vorhanden.length > 1 && (
          <div className="welt__themen" role="group" aria-label="Themen">
            <button type="button" className="welt__thema" aria-pressed={kategorie === null} onClick={() => waehleKategorie(null)}>
              <Symbol name="star" /> Alles
            </button>
            {vorhanden.map((k) => (
              <button key={k.id} type="button" className="welt__thema" aria-pressed={kategorie === k.id}
                style={{ "--farbe": k.color } as CSSProperties} onClick={() => waehleKategorie(k.id)}>
                <Symbol name={k.icon} /> {k.label_kids}
              </button>
            ))}
          </div>
        )}

        {passend.length === 0 ? (
          <div className="welt__leer">
            <EmptyState text="Hier ist gerade nichts – schau mal in einem anderen Haus!">
              <Button variante="primary" groesse="kids" icon="map" href="/kinder/">Zur Karte</Button>
            </EmptyState>
          </div>
        ) : (
          <div className="welt__kacheln" role="list" aria-label={`Angebote bei ${ort.name}`}>
            {sichtbar.map((k, i) => {
              const p = PLAETZE[i]!;
              const c = kat(k);
              const stil = {
                "--x": `${p.x}%`, "--y": `${p.y}%`, "--s": p.s, "--r": `${p.r}deg`,
                "--farbe": c?.color ?? ort.farbe, "--dauer": `${3.2 + (i % 3) * 0.6}s`, "--verz": `${-i * 0.45}s`,
                zIndex: Math.round(p.s * 10),
              } as CSSProperties;
              const gewuenscht = merk.ids.includes(k.id);
              return (
                <div key={k.id} role="listitem" className="welt__platz" style={stil}>
                  <button type="button" className={`welt__kachel${offen?.id === k.id ? " ist-offen" : ""}`} onClick={() => oeffne(k)}
                    aria-label={`${k.titel}, ${wochentag(k.start)}, ${alterText(k)} Jahre${k.gratis ? ", gratis" : ""}${gewuenscht ? ", gewünscht" : ""}`}>
                    <span className="welt__kachel-bild" aria-hidden="true">
                      <Symbol name={c?.icon ?? "star"} />
                    </span>
                    <span className="welt__kachel-titel">{k.titel}</span>
                    <span className="welt__kachel-zeit" aria-hidden="true">
                      <Symbol name={istAbends(k) ? "moon" : "sun"} /> {kurzTag(k.start)} · {alterText(k)} J.
                    </span>
                    {gewuenscht && <span className="welt__kachel-herz" aria-hidden="true"><Symbol name="heart" /></span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {seiten > 1 && (
          <>
            <button type="button" className="welt__blaettern welt__blaettern--links" aria-label="Vorherige Kacheln"
              disabled={aktuelleSeite === 0} onClick={() => setSeite(aktuelleSeite - 1)}>
              <Symbol name="back" />
            </button>
            <button type="button" className="welt__blaettern welt__blaettern--rechts" aria-label="Weitere Kacheln"
              disabled={aktuelleSeite >= seiten - 1} onClick={() => setSeite(aktuelleSeite + 1)}>
              <Symbol name="arrow" />
            </button>
          </>
        )}

        {/* Das Kind von hinten – schaut in die Themenwelt */}
        <svg className="welt__figur" viewBox="20 10 120 225" aria-hidden="true">
          <KinderFigurRuecken art={figurArt ?? "lila"} />
        </svg>

        {offen && (
          <div className="welt__eule">
            <OwlGuide text={`${offen.titel}. ${offen.geschichte}`} onSchliessen={() => setOffen(null)}>
              <p className="welt__eule-info">
                <Symbol name="calendar" /> {wochentag(offen.start)}, {uhrzeit(offen.start)} Uhr · {alterText(offen)} Jahre{offen.gratis ? " · gratis" : ""}
              </p>
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
            </OwlGuide>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/** Leuchtender Raum: Boden- und Deckengitter laufen zur Mitte, dazu ein weicher Lichtschein */
function WeltRaum({ licht }: { licht: string }) {
  const W = 1600, H = 900, FX = 800, FY = 400;
  const strahlen = Array.from({ length: 17 }, (_, i) => -1600 + i * 200);
  const boden = [430, 470, 530, 610, 720, 870];
  const decke = [370, 335, 285, 215, 125, 10];
  return (
    <svg className="welt__raum" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="welt-schein" cx="50%" cy="44%" r="55%">
          <stop offset="0" stopColor={licht} stopOpacity="0.55" />
          <stop offset="0.45" stopColor={licht} stopOpacity="0.12" />
          <stop offset="1" stopColor={licht} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--welt-grund)" />
      <rect width={W} height={H} fill="url(#welt-schein)" />
      <g stroke={licht} strokeWidth={2.5} opacity={0.75}>
        {strahlen.map((x) => <line key={`b${x}`} x1={FX} y1={FY} x2={x * 1.2 + FX} y2={H} />)}
        {strahlen.map((x) => <line key={`d${x}`} x1={FX} y1={FY} x2={x * 1.2 + FX} y2={0} />)}
        {boden.map((y) => <line key={`by${y}`} x1={0} y1={y} x2={W} y2={y} />)}
        {decke.map((y) => <line key={`dy${y}`} x1={0} y1={y} x2={W} y2={y} />)}
      </g>
      {/* dunkles Band am Horizont, damit die Kacheln davor gut lesbar sind */}
      <rect x={0} y={FY - 40} width={W} height={80} fill="var(--welt-grund)" opacity={0.85} />
    </svg>
  );
}
