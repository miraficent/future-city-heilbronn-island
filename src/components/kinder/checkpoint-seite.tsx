"use client";

/**
 * Einrichtungsseite für Kinder als „Themenwelt“ (DESIGN.md Projektentscheidung 12):
 * leuchtender Raum in den Farben der Einrichtung, die Angebote als Kacheln kreuz und quer im Raum
 * (leichtes Wackeln), unten die gewählte Kinderfigur von hinten.
 * Kachel antippen → die Eule kommt und liest vor, worum es geht → „Da will ich hin!“ (Wunsch für die Eltern).
 */
import { useMemo, useState, type CSSProperties } from "react";
import { AppShell, BackButton, Button, EmptyState, OwlGuide, useSprache } from "@/components/ui";
import { KinderFigurRuecken, type FigurArt } from "@/components/kinderreise/kinder-figuren";
import { Symbol } from "@/components/symbol";
import { useSammlung } from "@/components/sammlung";
import type { KartenOrt } from "@/lib/kinderkarte";
import { istAbends, passtZumAlter, type KinderKarte } from "@/lib/kinderkarten";
import { useKinderAlter, useKinderFigur, useMinute } from "@/lib/kinder-zustand";
import { autoVorlesen, vorlesen } from "@/lib/sprechen";
import { euleSagt, kartenText, kinderTageszeit, kinderWann } from "@/lib/kinder-text";
import { LOCALE } from "@/lib/eltern-suche";
import type { Category, CategoryId, Sprache } from "@/types";
import { KINDER_TEXTE, useKinderTexte } from "./texte";

const wochentag = (iso: string, sprache: Sprache) =>
  new Date(iso).toLocaleDateString(LOCALE[sprache], { timeZone: "Europe/Berlin", weekday: "long", day: "numeric", month: "long" });
const uhrzeit = (iso: string, sprache: Sprache) =>
  new Date(iso).toLocaleTimeString(LOCALE[sprache], { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const alterSpanne = (k: KinderKarte, ab: (alter: number | null) => string) =>
  k.ageMax !== null && k.ageMax < 99 ? `${k.ageMin ?? ""}–${k.ageMax}` : ab(k.ageMin);

/** Raumfarben je Einrichtung: Grund (dunkel) und Leuchtlinien */
const WELTEN: Record<string, { grund: string; licht: string }> = {
  experimenta: { grund: "#0d1640", licht: "#5BB8C4" },
  aim: { grund: "#1a0d45", licht: "#a58bff" },
  hdf: { grund: "#3a1424", licht: "#F28C6B" },
  ipai: { grund: "#04302c", licht: "#2BB3A3" },
  cosmos: { grund: "#2e1a04", licht: "#F59E0B" },
};

/**
 * Plätze im Raum (Mitte in %, Größe, Drehung) – absichtlich unordentlich, unten Mitte bleibt frei für die Figur.
 * Reihenfolge so gewählt, dass auch wenige Kacheln (z. B. 3–5) gut verteilt sind und sich kaum überdecken.
 */
const PLAETZE: { x: number; y: number; s: number; r: number }[] = [
  { x: 18, y: 32, s: 0.9, r: -2 },
  { x: 73, y: 26, s: 1.0, r: 2 },
  { x: 45, y: 44, s: 1.05, r: 1.5 },
  { x: 24, y: 62, s: 0.8, r: 2.5 },
  { x: 85, y: 50, s: 1.05, r: -1.5 },
  { x: 58, y: 18, s: 0.85, r: -1 },
];

/** Höchstens so viele Themen-Knöpfe (die häufigsten) – mehr überfordert Kleine */
const MAX_THEMEN = 4;

/**
 * laedt: die Live-Events sind noch unterwegs – der Raum bleibt leer (keine Platzhalter-Kacheln).
 * bild: Hintergrundbild der Themenwelt (public/welten/<id>.jpg), sonst Leuchtgitter.
 */
export function CheckpointSeite({ ort, karten, kategorien, laedt = false, bild = null }: {
  ort: KartenOrt; karten: KinderKarte[]; kategorien: Category[]; laedt?: boolean; bild?: string | null;
}) {
  const [alter] = useKinderAlter();
  const [figurArt] = useKinderFigur<FigurArt>();
  const minute = useMinute();
  const sprache = useSprache();
  const t = useKinderTexte();
  const alterText = (k: KinderKarte) => alterSpanne(k, t.welt.ab);
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
    .filter((k) => k.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl)
    .slice(0, MAX_THEMEN);
  const liste = kategorie ? passend.filter((k) => k.kategorien.includes(kategorie)) : passend;
  const seiten = Math.max(1, Math.ceil(liste.length / PLAETZE.length));
  const aktuelleSeite = Math.min(seite, seiten - 1);
  const sichtbar = liste.slice(aktuelleSeite * PLAETZE.length, (aktuelleSeite + 1) * PLAETZE.length);
  const kat = (k: KinderKarte) => kategorien.find((c) => c.id === k.kategorien[0]);

  const jetzt = minute === null ? new Date() : new Date(minute);
  const wann = (k: KinderKarte) => `${kinderWann(k.start, jetzt, sprache)} ${kinderTageszeit(k.start, sprache)}`;
  const sagt = (k: KinderKarte) => {
    const text = kartenText(k, sprache);
    return euleSagt(text.titel, text.satz);
  };

  function waehleKategorie(id: CategoryId | null, name: string) {
    setKategorie(id);
    setSeite(0);
    if (autoVorlesen()) vorlesen(name, sprache);
  }

  function oeffne(k: KinderKarte) {
    setOffen(k);
    // Mit „Eule spricht von selbst“ liest der OwlGuide; sonst einmal hier (das Antippen erlaubt die Sprache)
    if (!autoVorlesen()) vorlesen(sagt(k), sprache);
  }

  const raumStil = { "--welt-grund": welt.grund, "--welt-licht": welt.licht } as CSSProperties;

  return (
    <AppShell modus="kinder" voll>
      <div className="welt" style={raumStil} aria-busy={laedt}>
        {bild ? (
          <div className="welt__bild" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, eigenes Bild */}
            <img src={bild} alt="" />
          </div>
        ) : (
          <WeltRaum licht={welt.licht} />
        )}

        <div className="welt__oben">
          <BackButton href="/kinder/">{t.welt.zurKarte}</BackButton>
          <h1 className="welt__schild">{ort.name}</h1>
        </div>

        {laedt && <p role="status" className="sr-only">{t.welt.laedt}</p>}

        {!laedt && vorhanden.length > 1 && (
          <div className="welt__themen" role="group" aria-label={t.welt.themen}>
            <button type="button" className="welt__thema" aria-pressed={kategorie === null} onClick={() => waehleKategorie(null, t.welt.alles)}>
              <span className="welt__thema-rund"><Symbol name="star" /></span>
              <span className="welt__thema-name">{t.welt.alles}</span>
            </button>
            {vorhanden.map((k) => (
              <button key={k.id} type="button" className="welt__thema" aria-pressed={kategorie === k.id}
                style={{ "--farbe": k.color } as CSSProperties} onClick={() => waehleKategorie(k.id, t.welt.themaLang(k))}>
                <span className="welt__thema-rund"><Symbol name={k.icon} /></span>
                <span className="welt__thema-name">{t.welt.thema(k)}</span>
              </button>
            ))}
          </div>
        )}

        {laedt ? null : passend.length === 0 ? (
          <div className="welt__leer">
            <EmptyState text={t.welt.leer}>
              <Button variante="primary" groesse="kids" icon="map" href="/kinder/">{t.welt.zurKarte}</Button>
            </EmptyState>
          </div>
        ) : (
          <div className="welt__kacheln" role="list" aria-label={t.welt.angeboteBei(ort.name)}>
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
                    aria-label={t.welt.kachel({ titel: kartenText(k, sprache).titel, wann: wann(k), alter: alterText(k), gratis: k.gratis, gewuenscht })}>
                    {k.bild ? (
                      // Plain <img>: kommt von der eigenen Mobilizon-Instanz, next/image bräuchte Server oder remotePatterns
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="welt__kachel-foto" src={k.bild} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
                        onError={(ev) => { ev.currentTarget.hidden = true; }} />
                    ) : (
                      <span className="welt__kachel-bild" aria-hidden="true">
                        <Symbol name={c?.icon ?? "star"} />
                      </span>
                    )}
                    <span className="welt__kachel-titel">{kartenText(k, sprache).titel}</span>
                    <span className="welt__kachel-zeit" aria-hidden="true">
                      <Symbol name={istAbends(k) ? "moon" : "sun"} /> {kinderWann(k.start, jetzt, sprache)}
                    </span>
                    <span className="welt__kachel-alter" aria-hidden="true">{t.welt.alterKurz(alterText(k))}</span>
                    {gewuenscht && <span className="welt__kachel-herz" aria-hidden="true"><Symbol name="heart" /></span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!laedt && seiten > 1 && (
          <>
            <button type="button" className="welt__blaettern welt__blaettern--links" aria-label={t.welt.vorherige}
              disabled={aktuelleSeite === 0} onClick={() => setSeite(aktuelleSeite - 1)}>
              <Symbol name="back" />
            </button>
            <button type="button" className="welt__blaettern welt__blaettern--rechts" aria-label={t.welt.weitere}
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
            <OwlGuide text={sagt(offen)} onSchliessen={() => setOffen(null)}>
              <ErwartetDich karte={offen} thema={kat(offen)} alter={alterText(offen)} sprache={sprache} />
              <p className="welt__eule-info">
                <Symbol name="calendar" /> {wann(offen)} · {wochentag(offen.start, sprache)}, {t.welt.uhrzeit(uhrzeit(offen.start, sprache))}{offen.gratis ? ` · ${t.welt.gratis}` : ""}
              </p>
              <Button
                variante="wish"
                groesse="kids"
                icon={merk.ids.includes(offen.id) ? "check" : "heart"}
                ariaPressed={merk.ids.includes(offen.id)}
                onClick={() => merk.merken(offen.id)}
              >
                {merk.ids.includes(offen.id) ? t.welt.gewuenscht : t.welt.wunsch}
              </Button>
              <Button variante="ghost" groesse="kids" onClick={() => setOffen(null)}>{t.welt.andere}</Button>
            </OwlGuide>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/** Art der Veranstaltung als Bild-Hinweis: Was macht das Kind dort? */
const ART_SYMBOL: Record<string, string> = { workshop: "tools", show: "sparkles", course: "calendar", event: "star" };

/** „Was erwartet dich?“ – große Bild-Hinweise statt Text: Art, Thema, Alter, mit Familie, kostenlos */
function ErwartetDich({ karte, thema, alter, sprache }: { karte: KinderKarte; thema?: Category; alter: string; sprache: Sprache }) {
  const t = KINDER_TEXTE[sprache].welt;
  const hinweise = [
    karte.art && { icon: ART_SYMBOL[karte.art] ?? "star", text: t.art[karte.art], farbe: "var(--primary)" },
    thema && { icon: thema.icon, text: t.thema(thema), farbe: thema.color },
    { icon: "cake", text: t.jahre(alter), farbe: "var(--accent-dark)" },
    karte.kategorien.includes("family") && { icon: "users", text: t.mitFamilie, farbe: "var(--wish-dark)" },
    karte.gratis && { icon: "heart", text: t.kostenlos, farbe: "var(--success)" },
  ].filter((h): h is { icon: string; text: string; farbe: string } => !!h);
  return (
    <ul className="welt__erwartet" aria-label={t.erwartet}>
      {hinweise.map((h) => (
        <li key={h.text} style={{ "--farbe": h.farbe } as CSSProperties}>
          <span className="welt__erwartet-rund"><Symbol name={h.icon} /></span>
          {h.text}
        </li>
      ))}
    </ul>
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
