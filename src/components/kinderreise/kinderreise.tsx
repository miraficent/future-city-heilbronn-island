"use client";

/**
 * Mini-Heilbronn – der Kinder-Modus (volle Breite):
 *   Titel → Hauptbahnhof (Mia fragt Alter + Thema) → „Stadt erkunden“ (Figur läuft)
 *   oder „Karte öffnen“ (Schnellreise) → im Haus: Orakel → Event-Karten → „Da will ich hin!“
 * Jedes Spiel hilft bei einer Entscheidung. Alles bleibt nur in dieser Browsersitzung.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Category, LiveEvent } from "@/types";
import { getEventsForInstitution, getUpcoming, isToday } from "@/lib/events";
import { kartenOrte, START, type KartenQuelle, type Pt } from "@/lib/kinderkarte";
import {
  KINDER_ALTER, KINDER_THEMEN, ORAKEL_FRAGEN, angeboteFuerKind, kartenFuerOrakel, passtZuThema,
  zaehleProOrt, type OrakelAntworten,
} from "@/lib/kinderreise";
import { lies, schreibe } from "@/lib/speicher";
import { Symbol } from "@/components/symbol";
import { useSammlung } from "../sammlung";
import { Gebaeude } from "./gebaeude";
import { InselKarte } from "./insel-karte";
import { KartenStapel } from "./karten-stapel";
import { Mia } from "./mia";
import { RoboSpiel, type Bewertung } from "./robo-spiel";
import { BahnhofSzene, TitelSzene } from "./szenen";
import { EventGalerie, wunschId } from "./event-galerie";

type Stand = { alter: number | null; thema: string | null; sterne: number };
type Ansicht = "titel" | "bahnhof" | "stadt" | "haus";
type Schritt = "orakel" | "karten" | "fertig";
type Fenster = null | "schnellreise" | "rucksack" | "einstellungen" | "robo";

const SCHLUESSEL = "kinderreise.v1";
const LEER: Stand = { alter: null, thema: null, sterne: 0 };
const LAUFZEIT_MS = 1300;

type Props = {
  angebote: Angebot[];
  /** Live-Events (scripts/events/), schon auf Kinder-Events gefiltert */
  events: LiveEvent[];
  kategorien: Category[];
  quellen: KartenQuelle[];
  jetzt: string;
};

export function Kinderreise({ angebote, events, kategorien, quellen, jetzt }: Props) {
  const orte = useMemo(() => kartenOrte(quellen), [quellen]);
  const merk = useSammlung("kind");

  // Gespeicherten Stand direkt lesen (der Titelbildschirm hängt nicht davon ab → kein Hydrationsproblem)
  const [stand, setStand] = useState<Stand>(() =>
    typeof window === "undefined" ? LEER : { ...LEER, ...lies<Partial<Stand>>("sitzung", SCHLUESSEL, {}) },
  );
  const [ansicht, setAnsicht] = useState<Ansicht>("titel");
  const [fenster, setFenster] = useState<Fenster>(null);
  const [naja, setNaja] = useState(false);
  const [figur, setFigur] = useState<Pt>(START);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [haus, setHaus] = useState<string | null>(null);
  const [schritt, setSchritt] = useState<Schritt>("orakel");
  const [orakel, setOrakel] = useState<OrakelAntworten>({});
  const [gemocht, setGemocht] = useState<Angebot[]>([]);
  /** Im Haus: Live-Events (Standard) oder das Orakel-Spiel */
  const [hausModus, setHausModus] = useState<"events" | "spiel">("events");
  /** Echte Uhrzeit des Geräts für „Heute!“ (die Angebotsdaten nutzen den Datenstand `jetzt`) */
  const [uhr] = useState(() => new Date());

  function aendere(neu: Partial<Stand>) {
    setStand((alt) => {
      const s = { ...alt, ...neu };
      schreibe("sitzung", SCHLUESSEL, s);
      return s;
    });
  }

  const fuerKind = useMemo(
    () => (stand.alter ? angeboteFuerKind(angebote, stand.alter, new Date(jetzt)) : []),
    [angebote, stand.alter, jetzt],
  );
  const zahlen = useMemo(() => zaehleProOrt(fuerKind, stand.thema), [fuerKind, stand.thema]);
  const aktiv = stand.thema ? new Set(Object.keys(zahlen)) : null;
  const thema = KINDER_THEMEN.find((t) => t.id === stand.thema);

  // Live-Events: kommend und (wenn bekannt) passend zum Alter des Kindes
  const liveFuerKind = useMemo(
    () =>
      getUpcoming(events, uhr).filter(
        (e) => !stand.alter || ((e.ageMin ?? 0) <= stand.alter && stand.alter <= (e.ageMax ?? 99)),
      ),
    [events, uhr, stand.alter],
  );
  /** Abzeichen am Pin: Anzahl kommender Live-Events je Einrichtung */
  const liveZahlen = useMemo(
    () => Object.fromEntries(orte.map((o) => [o.id, getEventsForInstitution(liveFuerKind, o.id).length])),
    [orte, liveFuerKind],
  );
  const heute = useMemo(() => new Set(liveFuerKind.filter((e) => isToday(e, uhr)).map((e) => e.institutionId)), [liveFuerKind, uhr]);

  const gewuenscht = [
    ...angebote.filter((a) => merk.ids.includes(a.id)).map((a) => ({ id: a.id, titel: a.titel })),
    ...events.filter((e) => merk.ids.includes(wunschId(e))).map((e) => ({ id: wunschId(e), titel: e.title_kids })),
  ];

  function betreteHaus(id: string) {
    setHausModus("events");
    setHaus(id);
    setSchritt("orakel");
    setOrakel({});
    setGemocht([]);
    setAnsicht("haus");
  }

  /** Stadt erkunden: Figur läuft hin, dann ins Haus */
  function laufeZu(id: string) {
    if (gewaehlt) return;
    const ort = orte.find((o) => o.id === id)!;
    setGewaehlt(id);
    setFigur([ort.x - 60, ort.y + 10]);
    setTimeout(() => betreteHaus(id), LAUFZEIT_MS);
  }

  /** Schnellreise: direkt ins Haus */
  function reiseZu(id: string) {
    const ort = orte.find((o) => o.id === id)!;
    setFenster(null);
    setFigur([ort.x - 60, ort.y + 10]);
    betreteHaus(id);
  }

  function zurStadt() {
    setGewaehlt(null);
    setAnsicht("stadt");
  }

  function nachRobo(b: Bewertung) {
    setFenster(null);
    if (b === "naja") setNaja(true);
    else aendere({ thema: "coding", sterne: stand.sterne + 1 });
  }

  const hud = (
    <div className="kr-hud">
      <button type="button" className="kr-hud-pille kr-hud-karte" onClick={() => setFenster("schnellreise")}><Symbol name="map" /> Karte</button>
      <span className="kr-hud-pille" aria-label={`${stand.sterne} Sterne`}><Symbol name="star" /> {stand.sterne}</span>
      <button type="button" className="kr-hud-knopf" aria-label={`Rucksack, ${merk.ids.length} Wünsche`} onClick={() => setFenster("rucksack")}>
        <Symbol name="backpack" />{merk.ids.length > 0 && <span className="kr-hud-zahl">{merk.ids.length}</span>}
      </button>
      <button type="button" className="kr-hud-knopf" aria-label="Einstellungen" onClick={() => setFenster("einstellungen")}><Symbol name="tools" /></button>
    </div>
  );

  // ---------- Bildschirme ----------
  let inhalt;
  if (ansicht === "titel") {
    inhalt = (
      <div className="kr-buehne">
        <TitelSzene />
        <div className="kr-titel">
          <div className="kr-schild">
            <h1>Mini-Heilbronn</h1>
            <p className="kr-schild-unter">Der Lern-Guide</p>
          </div>
          <p className="kr-titel-text">Entdecke die Stadt. Lerne Neues. Finde deine Angebote.</p>
          <div className="kr-titel-knoepfe">
            <button type="button" className="kr-knopf kr-gelb" onClick={() => setAnsicht("bahnhof")}><Symbol name="play" /> Spiel starten</button>
            <Link href="/eltern/" className="kr-knopf kr-weiss"><Symbol name="user" /> Für Eltern</Link>
          </div>
        </div>
      </div>
    );
  } else if (ansicht === "bahnhof") {
    inhalt = (
      <div className="kr-buehne">
        <BahnhofSzene />
        <span className="kr-ortsschild">Heilbronn Hauptbahnhof</span>
        {hud}
        <div className="kr-mia-platz">
          {!stand.alter ? (
            <Mia text="Willkommen in Mini-Heilbronn! Das ist der Hauptbahnhof. Von hier aus erkundest du die Stadt. Wie alt bist du?">
              {KINDER_ALTER.map((n) => (
                <button key={n} type="button" className="kr-zahl" onClick={() => aendere({ alter: n })}>{n}</button>
              ))}
            </Mia>
          ) : !stand.thema ? (
            <Mia text={naja ? "Kein Problem! Such dir etwas anderes aus." : "Was willst du heute entdecken?"}>
              {KINDER_THEMEN.map((t) => (
                <button key={t.id} type="button" className="kr-wahl" onClick={() => aendere({ thema: t.id })}>
                  <Symbol name={t.symbol} />{t.text}
                </button>
              ))}
              <button type="button" className="kr-wahl kr-wahl-leise" onClick={() => setFenster("robo")}>
                <Symbol name="search" />Weiß nicht – ausprobieren!
              </button>
            </Mia>
          ) : (
            <Mia text={`Super, ${thema?.text}! Lauf durch die Stadt oder reise mit der Karte direkt zu einem Ort.`}>
              <button type="button" className="kr-knopf kr-gruen" onClick={() => setAnsicht("stadt")}><Symbol name="compass" /> Stadt erkunden</button>
              <button type="button" className="kr-knopf kr-blau" onClick={() => setFenster("schnellreise")}><Symbol name="map" /> Karte öffnen</button>
            </Mia>
          )}
        </div>
      </div>
    );
  } else if (ansicht === "stadt") {
    inhalt = (
      <div className="kr-buehne kr-stadt">
        <InselKarte orte={orte} zahlen={liveZahlen} heute={heute} aktiv={aktiv} figur={figur} gewaehlt={gewaehlt} onWaehle={laufeZu} />
        <button type="button" className="kr-rund kr-oben-links" aria-label="Zurück zum Bahnhof" onClick={() => setAnsicht("bahnhof")}><Symbol name="train" /></button>
        {hud}
        {!gewaehlt && (
          <div className="kr-mia-platz kr-mia-klein">
            <Mia
              text={
                aktiv && aktiv.size > 0
                  ? "Die leuchtenden Häuser haben etwas für dich. Tipp eins an!"
                  : `Zu ${thema?.text ?? "diesem Thema"} gibt es gerade nichts für ${stand.alter} Jahre. Wähle ein anderes Thema!`
              }
            />
          </div>
        )}
      </div>
    );
  } else {
    const ort = orte.find((o) => o.id === haus)!;
    const hier = fuerKind.filter((a) => a.quelle === haus);
    const zumThema = hier.filter((a) => passtZuThema(a, stand.thema));
    const auswahl = zumThema.length > 0 ? zumThema : hier;
    const frage = ORAKEL_FRAGEN.find((f) => orakel[f.id] === undefined);
    inhalt = (
      <div className="kr-buehne kr-haus" style={{ ["--ort-farbe" as string]: ort.farbe }}>
        <button type="button" className="kr-knopf kr-weiss kr-oben-links" onClick={zurStadt}><Symbol name="compass" /> Stadt</button>
        <span className="kr-ortsschild">{ort.name}</span>
        {hud}
        <div className="kr-haus-inhalt">
          <svg viewBox="-95 -160 190 175" className="kr-haus-bild" aria-hidden="true">
            <Gebaeude art={ort.gebaeude} farbe={ort.farbe} symbol={ort.symbol} />
          </svg>
          <div className="kr-haus-spiel">
            <div className="kr-haus-modus" role="group" aria-label="Was möchtest du machen?">
              <button type="button" className="kr-knopf kr-weiss" aria-pressed={hausModus === "events"} onClick={() => setHausModus("events")}>
                <Symbol name="calendar" /> Was gibt&apos;s hier?
              </button>
              <button type="button" className="kr-knopf kr-weiss" aria-pressed={hausModus === "spiel"} onClick={() => setHausModus("spiel")}>
                <Symbol name="search" /> Was passt zu mir?
              </button>
            </div>
            {hausModus === "events" ? (
              <EventGalerie
                ortName={ort.name}
                events={getEventsForInstitution(liveFuerKind, ort.id)}
                kategorien={kategorien}
                wuensche={merk.ids}
                onWunsch={(id) => {
                  if (!merk.ids.includes(id)) aendere({ sterne: stand.sterne + 1 });
                  merk.merken(id);
                }}
                onZurKarte={() => setFenster("schnellreise")}
              />
            ) : hier.length === 0 ? (
              <Mia text={`Bei ${ort.name} gibt es gerade nichts für ${stand.alter} Jahre. Schau mal in ein anderes Haus!`}>
                <button type="button" className="kr-knopf kr-blau" onClick={() => setFenster("schnellreise")}><Symbol name="map" /> Karte öffnen</button>
              </Mia>
            ) : schritt === "orakel" && frage ? (
              <Mia text={frage.frage}>
                {frage.optionen.map((o) => (
                  <button key={o.id} type="button" className="kr-wahl" onClick={() => setOrakel({ ...orakel, [frage.id]: o.id } as OrakelAntworten)}>
                    <Symbol name={o.symbol} />{o.text}
                  </button>
                ))}
              </Mia>
            ) : schritt === "orakel" ? (
              <Mia text={`Ich habe ${Math.min(5, auswahl.length)} Karten für dich! Wisch nach rechts, wenn du hin willst.`}>
                <button type="button" className="kr-knopf kr-gelb" onClick={() => setSchritt("karten")}><Symbol name="ticket" /> Karten zeigen</button>
              </Mia>
            ) : schritt === "karten" ? (
              <KartenStapel
                karten={kartenFuerOrakel(auswahl, orakel, new Date(jetzt))}
                onFertig={(liste) => {
                  setGemocht(liste);
                  liste.forEach((a) => !merk.ids.includes(a.id) && merk.merken(a.id));
                  aendere({ sterne: stand.sterne + 1 });
                  setSchritt("fertig");
                }}
              />
            ) : gemocht.length > 0 ? (
              <Mia text="Toll! Das hast du in deinen Rucksack gepackt. Zeig es Mama oder Papa!">
                <ul className="kr-wunschliste">{gemocht.map((a) => <li key={a.id}><Symbol name="check" /> {a.titel}</li>)}</ul>
                <button type="button" className="kr-knopf kr-blau" onClick={() => setFenster("schnellreise")}><Symbol name="map" /> Nächster Ort</button>
              </Mia>
            ) : (
              <Mia text="Kein Problem! Schau dir ein anderes Haus an.">
                <button type="button" className="kr-knopf kr-blau" onClick={() => setFenster("schnellreise")}><Symbol name="map" /> Karte öffnen</button>
              </Mia>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kr-spiel">
      {inhalt}

      {fenster === "schnellreise" && (
        <div className="kr-schnellreise" role="dialog" aria-modal="true" aria-label="Mini-Heilbronn-Schnellreise">
          <InselKarte orte={orte} zahlen={liveZahlen} heute={heute} aktiv={aktiv} figur={null} gewaehlt={null} onWaehle={reiseZu} />
          <button type="button" className="kr-rund kr-oben-links kr-schliessen-gross" aria-label="Schließen" onClick={() => setFenster(null)}><Symbol name="close" /></button>
          <div className="kr-schild kr-schild-klein">Mini-Heilbronn-Schnellreise</div>
          <div className="kr-kompass" aria-hidden="true">N<span>▲</span></div>
          <p className="kr-banner">Wähle einen Ort, um direkt dorthin zu reisen.</p>
        </div>
      )}

      {fenster === "rucksack" && (
        <div className="kr-dialog" role="dialog" aria-modal="true" aria-label="Rucksack">
          <div className="kr-dialog-karte">
            <button type="button" className="kr-rund kr-schliessen" aria-label="Schließen" onClick={() => setFenster(null)}><Symbol name="close" /></button>
            <h2><Symbol name="backpack" /> Dein Rucksack</h2>
            {gewuenscht.length === 0 ? (
              <p>Noch leer. Wisch Karten nach rechts, dann landen sie hier!</p>
            ) : (
              <>
                <ul className="kr-wunschliste">{gewuenscht.map((w) => <li key={w.id}><Symbol name="check" /> {w.titel}</li>)}</ul>
                <p>Zeig das Mama oder Papa. Sie sehen es im Eltern-Bereich und melden dich an.</p>
              </>
            )}
          </div>
        </div>
      )}

      {fenster === "einstellungen" && (
        <div className="kr-dialog" role="dialog" aria-modal="true" aria-label="Einstellungen">
          <div className="kr-dialog-karte">
            <button type="button" className="kr-rund kr-schliessen" aria-label="Schließen" onClick={() => setFenster(null)}><Symbol name="close" /></button>
            <h2><Symbol name="tools" /> Einstellungen</h2>
            <div className="kr-spalte">
              <button type="button" className="kr-knopf kr-weiss" onClick={() => { aendere({ thema: null }); setAnsicht("bahnhof"); setFenster(null); }}><Symbol name="refresh" /> Anderes Thema</button>
              <button type="button" className="kr-knopf kr-weiss" onClick={() => { aendere({ alter: null, thema: null }); setAnsicht("bahnhof"); setFenster(null); }}><Symbol name="cake" /> Anderes Alter</button>
              <button type="button" className="kr-knopf kr-weiss" onClick={() => { setAnsicht("titel"); setFenster(null); }}><Symbol name="home" /> Zum Titel</button>
            </div>
          </div>
        </div>
      )}

      {fenster === "robo" && <RoboSpiel onFertig={nachRobo} onAbbrechen={() => setFenster(null)} />}
    </div>
  );
}
