"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AUFGABEN_TITEL, empfehlungen, neuerSpielstand, pruefeSpielstand, stufeFuerAlter, WUENSCHE, type Spielstand } from "@/lib/abenteuer";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { fuerModus } from "@/lib/entdecken";
import { alterAvatar, figurAusAvatar, pruefeAvatar, STANDARD_AVATAR, type AvatarKonfiguration } from "@/lib/avatar";
import { bewohnerFuer, SPRECH_RADIUS, type Bewohner } from "@/lib/bewohner";
import { fotoFuer } from "@/lib/fotos";
import { abstand, passendeSpielAngebote, STATIONEN, type Punkt } from "@/lib/spiel";
import { lies, loesche, schreibe } from "@/lib/speicher";
import { amPlatz, bewege, bewegeAutos, erzeugeStadt, hausAn, nahesHaus, neueAutos, planeRoute, TEMPO_FIGUR, wahrzeichenAn, type Auto } from "@/lib/stadt";
import { klang, klangIstAus, setzeKlangAus } from "@/lib/klang";
import { useVorlesen } from "@/lib/vorlesen";
import { useSammlung } from "../sammlung";
import { FotoZoom } from "../foto-zoom";
import { OrtsBild } from "../ortsbild";
import { Symbol } from "../symbol";
import { AufgabenEinstieg } from "./aufgaben-einstieg";
import { OrtSzene } from "./ortsszene";
import { Avatar, AvatarKontext } from "./avatar";
import type { Blick } from "./figur";
import { Lernaufgabe } from "./lernaufgabe";
import { PixelBild, Roboter } from "./pixel-grafik";
import { Sammelkarte } from "./sammelkarte";
import { StadtKulisse, StadtLeben, TunnelHuegel } from "./stadt-grafik";
import { StartAuswahl, type StartSchritt } from "./start-auswahl";
import { Anleitung } from "./anleitung";
import { ThemenSymbol } from "./themen-symbol";
import { ZeigEltern } from "./zeig-eltern";

const TASTEN: Record<string, Punkt> = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};
const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.6;
const SPEICHER_STAND = "abenteuer.v2";
const SPEICHER_FIGUR = "spielwelt.figur";
const SPEICHER_AVATAR = "spielwelt.avatar";
const SPEICHER_GESPRAECHE = "spielwelt.gespraeche";
const SPEICHER_BESUCHT = "spielwelt.besucht";
const HALTEN_MS = 3000;
const SPEICHER_RAKETE = "spielwelt.rakete";

export type RaketenZustand = "bereit" | "startet" | "weg";

type Fenster = "haus" | "rucksack" | "finale" | "tor" | "erwachsene" | undefined;
type ZielAktion = { art: "haus"; id: string } | { art: "rakete" } | { art: "bewohner"; id: string } | null;
/** Ein laufendes Gespräch: erst die Sätze, dann die Frage, dann die Rückmeldung zur gewählten Antwort. */
type GespraechStand = { id: string; zeile: number; antwort: number | null };

/** Kurze Sätze für kleine Leser:innen (6–8) und etwas mehr für Größere (9–11). */
const GESCHICHTE: Record<string, [klein: string, gross: string]> = {
  aim: ["Hilf dem Roboter ans Ziel!", "Die Lieferroboter haben ihren Weg vergessen. Programmiere ihnen eine Route."],
  experimenta: ["Mach das Licht an!", "Abends bleibt die Stadt dunkel. Finde heraus, wie Strom zum Licht kommt."],
  hdf: ["Bau einen Weg zum Ziel!", "Der Weg zum Fest hat Lücken. Baue ein Level, das deine Figur schafft."],
  ipai: ["Hilf Pico beim Sortieren!", "Pico verwechselt Bilder. Zeig ihm, wie man Muster erkennt und prüft."],
};

function naechsterBewohner(liste: Bewohner[], p: Punkt): Bewohner | undefined {
  let bester: Bewohner | undefined;
  for (const b of liste) if (abstand(b.ort, p) < SPRECH_RADIUS && (!bester || abstand(b.ort, p) < abstand(bester.ort, p))) bester = b;
  return bester;
}

function Fensterrahmen({ titel, kennung, offen, schliessen, kopfbild, children, breit = false }: {
  titel: string;
  kennung: string;
  offen: boolean;
  schliessen: () => void;
  kopfbild?: ReactNode;
  children: ReactNode;
  breit?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const schliessenRef = useRef(schliessen);
  schliessenRef.current = schliessen;
  useEffect(() => {
    if (!offen) return;
    const vorher = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") schliessenRef.current();
    };
    window.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("keydown", taste);
      vorher?.focus?.({ preventScroll: true });
    };
  }, [offen]);
  return (
    <AnimatePresence>
      {offen && (
        <motion.div className="fenster-hintergrund" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && schliessen()}>
          <motion.div
            ref={box}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={kennung}
            className={`spiel-fenster ${breit ? "spiel-fenster-breit" : ""}`}
            initial={{ y: 60, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="spiel-fenster-kopf">
              {kopfbild}
              <h2 id={kennung}>{titel}</h2>
              <button className="rund-knopf" onClick={schliessen} aria-label="Schließen">
                <Symbol name="close" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Spielwelt({ angebote, meta, jetzt: startJetzt }: { angebote: Angebot[]; meta: Meta; jetzt: string }) {
  const stadt = useMemo(() => erzeugeStadt(STATIONEN), []);
  const [bereit, setBereit] = useState(false);
  const [avatar, setAvatar] = useState<AvatarKonfiguration>(STANDARD_AVATAR);
  const [startSchritt, setStartSchritt] = useState<StartSchritt>("alter");
  const [eingefuehrt, setEingefuehrt] = useState(false);
  const [besucht, setBesucht] = useState<string[]>([]);
  const [szeneFertig, setSzeneFertig] = useState(true);
  const [gespraech, setGespraech] = useState<GespraechStand | null>(null);
  const [gesprochen, setGesprochen] = useState<string[]>([]);
  const [halten, setHalten] = useState(false);
  const halteUhr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stand, setStand] = useState<Spielstand>(() => neuerSpielstand());
  const [position, setPosition] = useState<Punkt>(stadt.start);
  const [blick, setBlick] = useState<Blick>("vorne");
  const [spiegeln, setSpiegeln] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [autos, setAutos] = useState<Auto[]>(() => neueAutos(stadt));
  const [ziel, setZiel] = useState<Punkt>();
  const [zoom, setZoom] = useState(1);
  const [vollbild, setVollbild] = useState(false);
  const [pausiert, setPausiert] = useState(false);
  const [fenster, setFenster] = useState<Fenster>();
  const [hausId, setHausId] = useState(STATIONEN[0]!.id);
  const [phase, setPhase] = useState(0);
  const [belohnung, setBelohnung] = useState<string | null>(null);
  const [rakete, setRakete] = useState<RaketenZustand>("bereit");
  const startet = rakete === "startet";
  const [tonAus, setTonAus] = useState(false);
  const [hinweis, setHinweis] = useState("Tippe auf ein Haus!");
  // Eine neue Nachricht ist immer erst offen; eingeklappt wird sie per Zeitgeber oder Antippen.
  const [picoStand, setPicoStand] = useState({ text: "", offen: true, ungelesen: false });
  const picoAktuell = picoStand.text === hinweis;
  const picoOffen = picoAktuell ? picoStand.offen : true;
  const picoUngelesen = picoAktuell && picoStand.ungelesen;
  const [jetzt, setJetzt] = useState(startJetzt);
  const [verhaeltnis, setVerhaeltnis] = useState(1.6);
  const [alleKurse, setAlleKurse] = useState(false);
  const [neuFrage, setNeuFrage] = useState(false);
  const [anleitung, setAnleitung] = useState(false);

  const pos = useRef<Punkt>(stadt.start);
  const laeuftRef = useRef(false);
  const stillSeit = useRef(0);
  const blickRef = useRef<{ blick: Blick; spiegeln: boolean }>({ blick: "vorne", spiegeln: false });
  /** Setzt die Blickrichtung mit etwas Spielraum: Fast-diagonale Eingaben behalten die alte Richtung. */
  const schaue = useCallback((r: Punkt) => {
    const ax = Math.abs(r.x);
    const ay = Math.abs(r.y);
    const alt = blickRef.current;
    const seitlich = ax > ay * 1.3 || (ay <= ax * 1.3 && alt.blick === "seite");
    const neu = seitlich ? { blick: "seite" as const, spiegeln: r.x < 0 } : { blick: r.y < 0 ? ("hinten" as const) : ("vorne" as const), spiegeln: alt.spiegeln };
    if (neu.blick === alt.blick && neu.spiegeln === alt.spiegeln) return;
    blickRef.current = neu;
    setBlick(neu.blick);
    setSpiegeln(neu.spiegeln);
  }, []);
  const raketeRef = useRef<RaketenZustand>("bereit");
  const gespraechOffen = useRef(false);
  useEffect(() => {
    gespraechOffen.current = Boolean(gespraech);
  }, [gespraech]);
  const warAmPlatz = useRef(false);
  const autosRef = useRef<Auto[]>(autos);
  const tasten = useRef(new Set<string>());
  const route = useRef<Punkt[]>([]);
  const zielAktion = useRef<ZielAktion>(null);
  const gesperrteTuer = useRef<string | null>(null);
  const rahmen = useRef<HTMLDivElement>(null);
  const welt = useRef<SVGSVGElement>(null);

  const figur = useMemo(() => figurAusAvatar(avatar), [avatar]);
  const bewohner = useMemo(() => bewohnerFuer(stadt), [stadt]);
  const stufe = stufeFuerAlter(stand.alter);
  const erfolge = stand.fortschritt[stufe];
  const mitTeil = useMemo(() => STATIONEN.filter((s) => erfolge.some((id) => id.startsWith(`${s.id}-`))), [erfolge]);
  const mitTeilIds = useMemo(() => mitTeil.map((s) => s.id), [mitTeil]);
  const teile = useMemo(() => mitTeil.map((s) => s.teil), [mitTeil]);
  const alleTeile = teile.length === STATIONEN.length;
  const nah = nahesHaus(stadt, position);
  const nachbar = useMemo(() => naechsterBewohner(bewohner, position), [bewohner, position]);
  const imGespraech = gespraech ? bewohner.find((b) => b.id === gespraech.id) : undefined;
  const station = STATIONEN.find((s) => s.id === hausId) ?? STATIONEN[0]!;
  const klein = stand.alter <= 8;
  const merk = useSammlung("kind");
  const vorlesen = useVorlesen();
  const jetztDatum = useMemo(() => new Date(jetzt), [jetzt]);

  /* ---------- Spielstand ---------- */

  useEffect(() => {
    const geladen = pruefeSpielstand(lies<unknown>("sitzung", SPEICHER_STAND, null));
    if (geladen.alter > 11) geladen.alter = 11;
    setStand(geladen);
    const gespeicherteRakete = lies<RaketenZustand>("sitzung", SPEICHER_RAKETE, "bereit");
    if (gespeicherteRakete === "weg") {
      raketeRef.current = "weg";
      setRakete("weg");
    }
    setTonAus(klangIstAus());
    // Die eigene Figur aus dem Baukasten. Eine Figur aus der alten Auswahl dient nur als Vorlage.
    const gespeicherterAvatar = lies<unknown>("sitzung", SPEICHER_AVATAR, null);
    const alteFigur = lies<string>("sitzung", SPEICHER_FIGUR, "");
    if (gespeicherterAvatar) {
      setAvatar(pruefeAvatar(gespeicherterAvatar));
      setBereit(true);
    } else if (alteFigur) {
      setAvatar(alterAvatar(alteFigur));
    }
    setGesprochen(lies<string[]>("sitzung", SPEICHER_GESPRAECHE, []).filter((x) => typeof x === "string"));
    setBesucht(lies<string[]>("sitzung", SPEICHER_BESUCHT, []).filter((x) => typeof x === "string"));
    setJetzt(new Date().toISOString());
    const uhr = setInterval(() => setJetzt(new Date().toISOString()), 60_000);
    return () => clearInterval(uhr);
  }, []);

  const speichere = useCallback((neu: Spielstand) => {
    setStand(neu);
    schreibe("sitzung", SPEICHER_STAND, neu);
  }, []);

  /* ---------- Steuerung ---------- */

  const stoppen = useCallback(() => {
    tasten.current.clear();
    route.current = [];
    zielAktion.current = null;
    setZiel(undefined);
  }, []);

  const oeffneHaus = useCallback(
    (id: string) => {
      stoppen();
      const erste = [0, 1, 2].find((n) => !stand.fortschritt[stufeFuerAlter(stand.alter)].includes(`${id}-${n}`));
      setHausId(id);
      setPhase(erste ?? 0);
      setBelohnung(null);
      setAlleKurse(false);
      setEingefuehrt(false);
      setSzeneFertig(besucht.includes(id));
      setFenster("haus");
      klang.tuer();
      gesperrteTuer.current = id;
    },
    [stand, stoppen, besucht],
  );

  const laufeZu = useCallback(
    (p: Punkt, aktion: ZielAktion) => {
      tasten.current.clear();
      const weg = planeRoute(stadt, pos.current, p);
      if (!weg.length) return;
      route.current = weg;
      zielAktion.current = aktion;
      setZiel(weg.at(-1));
    },
    [stadt],
  );

  const zumHaus = useCallback(
    (id: string) => {
      const h = stadt.haeuser.find((x) => x.station.id === id);
      if (!h) return;
      if (abstand(pos.current, h.tuer) < 30) oeffneHaus(id);
      else laufeZu(h.tuer, { art: "haus", id });
    },
    [stadt, laufeZu, oeffneHaus],
  );

  const zurRakete = useCallback(() => laufeZu(stadt.platz, { art: "rakete" }), [stadt, laufeZu]);

  const sprichMit = useCallback(
    (id: string) => {
      stoppen();
      setGespraech({ id, zeile: 0, antwort: null });
      klang.klick();
    },
    [stoppen],
  );

  const zuBewohner = useCallback(
    (b: Bewohner) => {
      if (abstand(pos.current, b.ort) < SPRECH_RADIUS) sprichMit(b.id);
      // Seitlich neben die Person laufen, nicht direkt davor – sonst verdecken sich die beiden Figuren.
      else laufeZu({ x: b.ort.x + (pos.current.x < b.ort.x ? -58 : 58), y: b.ort.y }, { art: "bewohner", id: b.id });
    },
    [laufeZu, sprichMit],
  );

  const raketeStarten = useCallback(() => {
    if (raketeRef.current === "startet") return;
    raketeRef.current = "startet";
    setRakete("startet");
    setHinweis("3 … 2 … 1 … Start!");
    klang.countdown();
    window.setTimeout(() => klang.start(), 2400);
    window.setTimeout(() => {
      setFenster("finale");
      klang.jubel();
    }, 3600);
  }, []);

  /** Wird nur beim Ankommen bzw. Betreten des Platzes ausgelöst – nie dauerhaft, solange man dort steht. */
  const raketeErreicht = useCallback(() => {
    if (raketeRef.current === "startet") return;
    if (raketeRef.current === "weg") {
      setHinweis("Die Rakete ist im All! Du hast es geschafft.");
      return;
    }
    if (alleTeile) raketeStarten();
    else {
      const fehlt = STATIONEN.filter((s) => !teile.includes(s.teil));
      setHinweis(`Noch ${fehlt.length} Teil${fehlt.length === 1 ? "" : "e"}: ${fehlt.map((s) => s.kurz).join(", ")}`);
    }
  }, [alleTeile, teile, raketeStarten]);

  function weltPunkt(e: React.PointerEvent<SVGSVGElement>): Punkt | null {
    const m = e.currentTarget.getScreenCTM()?.inverse();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  }

  function weltAntippen(e: React.PointerEvent<SVGSVGElement>) {
    if (pausiert || fenster || !bereit || gespraech) return;
    const p = weltPunkt(e);
    if (!p) return;
    const getroffen = bewohner.find((b) => Math.abs(p.x - b.ort.x) < 34 && p.y > b.ort.y - 110 && p.y < b.ort.y + 14);
    if (getroffen) return zuBewohner(getroffen);
    const haus = hausAn(stadt, p);
    if (haus) return zumHaus(haus.station.id);
    const wahrzeichen = wahrzeichenAn(stadt, p);
    if (wahrzeichen) {
      setHinweis(wahrzeichen.fakt);
      setPicoStand({ text: wahrzeichen.fakt, offen: true, ungelesen: false });
      if (!tonAus && vorlesen.kann) vorlesen.sprich(wahrzeichen.fakt);
      klang.klick();
      return;
    }
    if (abstand(p, { x: stadt.platz.x, y: stadt.platz.y - 60 }) < stadt.platz.r) return zurRakete();
    laufeZu(p, null);
  }

  // Tastatur: Pfeile/WASD bewegen, Enter/E öffnet ein nahes Haus.
  useEffect(() => {
    if (!bereit || fenster || gespraech) return;
    const eingabe = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
    const imSpiel = () => {
      const aktiv = document.activeElement;
      return !aktiv || aktiv === document.body || Boolean(rahmen.current?.contains(aktiv));
    };
    const runter = (e: KeyboardEvent) => {
      if (eingabe(e.target) || !imSpiel()) return;
      const taste = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (TASTEN[taste]) {
        e.preventDefault();
        route.current = [];
        zielAktion.current = null;
        setZiel(undefined);
        tasten.current.add(taste);
      } else if ((e.key === "Enter" || taste === "e") && nahesHaus(stadt, pos.current)) {
        e.preventDefault();
        oeffneHaus(nahesHaus(stadt, pos.current)!.station.id);
      } else if ((e.key === "Enter" || taste === "e") && naechsterBewohner(bewohner, pos.current)) {
        e.preventDefault();
        sprichMit(naechsterBewohner(bewohner, pos.current)!.id);
      }
    };
    const hoch = (e: KeyboardEvent) => tasten.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const weg = () => tasten.current.clear();
    window.addEventListener("keydown", runter);
    window.addEventListener("keyup", hoch);
    window.addEventListener("blur", weg);
    return () => {
      window.removeEventListener("keydown", runter);
      window.removeEventListener("keyup", hoch);
      window.removeEventListener("blur", weg);
    };
  }, [bereit, fenster, gespraech, stadt, oeffneHaus, bewohner, sprichMit]);

  /* ---------- Spielschleife ---------- */

  const ankunft = useRef<() => void>(() => {});
  ankunft.current = () => {
    const aktion = zielAktion.current;
    zielAktion.current = null;
    setZiel(undefined);
    if (aktion?.art === "haus") oeffneHaus(aktion.id);
    if (aktion?.art === "rakete") raketeErreicht();
    if (aktion?.art === "bewohner") sprichMit(aktion.id);
  };

  useEffect(() => {
    if (!bereit) return;
    let rahmenId = 0;
    let vorher = 0;
    const tick = (zeit: number) => {
      const dt = vorher ? Math.min((zeit - vorher) / 1000, 0.05) : 0;
      vorher = zeit;
      if (!pausiert && !fenster && !anleitung && !gespraechOffen.current) {
        let richtung: Punkt = { x: 0, y: 0 };
        let dauer = dt;
        for (const t of tasten.current) {
          const d = TASTEN[t];
          if (d) richtung = { x: richtung.x + d.x, y: richtung.y + d.y };
        }
        if (!richtung.x && !richtung.y && route.current.length) {
          const naechster = route.current[0]!;
          const rest = abstand(pos.current, naechster);
          if (rest < 2) {
            pos.current = naechster;
            route.current.shift();
            if (!route.current.length) ankunft.current();
          } else {
            richtung = { x: naechster.x - pos.current.x, y: naechster.y - pos.current.y };
            dauer = Math.min(dt, rest / TEMPO_FIGUR);
          }
        }
        let bewegt = false;
        if (richtung.x || richtung.y) {
          // Die Blickrichtung folgt der gewollten Richtung, nicht den kleinen Ausweichschritten am Bordstein.
          schaue(richtung);
          const neu = bewege(stadt, pos.current, richtung, dauer);
          bewegt = abstand(neu, pos.current) > 0.05;
          if (bewegt) {
            pos.current = neu;
            setPosition(neu);
            klang.schritt();
          } else if (route.current.length) {
            // Sicherheitsnetz: Ein Wegpunkt ist nicht erreichbar → Route neu planen statt stehen zu bleiben.
            const endpunkt = route.current.at(-1)!;
            route.current = planeRoute(stadt, pos.current, endpunkt);
          }
        }
        // Laufen erst nach einer kurzen Pause beenden – sonst springt die Animation bei jedem Mini-Stopp neu an.
        if (bewegt) stillSeit.current = zeit;
        const laeuftJetzt = bewegt || zeit - stillSeit.current < 140;
        if (laeuftJetzt !== laeuftRef.current) {
          laeuftRef.current = laeuftJetzt;
          setLaeuft(laeuftJetzt);
        }

        // Tür erreicht (auch mit Tastatur): Haus öffnet sich – erst wieder, wenn man sich entfernt hat.
        const tuer = nahesHaus(stadt, pos.current, 22);
        if (tuer && gesperrteTuer.current !== tuer.station.id && !route.current.length) oeffneHaus(tuer.station.id);
        if (gesperrteTuer.current) {
          const h = stadt.haeuser.find((x) => x.station.id === gesperrteTuer.current);
          if (!h || abstand(pos.current, h.tuer) > 70) gesperrteTuer.current = null;
        }

        autosRef.current = bewegeAutos(stadt, autosRef.current, dt, pos.current);
        setAutos(autosRef.current);
      } else if (laeuftRef.current) {
        laeuftRef.current = false;
        setLaeuft(false);
      }
      rahmenId = requestAnimationFrame(tick);
    };
    rahmenId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rahmenId);
  }, [bereit, pausiert, fenster, anleitung, stadt, oeffneHaus, schaue]);

  // Hinweistexte passend zur Situation
  useEffect(() => {
    if (startet) return;
    const jetztAmPlatz = amPlatz(stadt, position);
    const betreten = jetztAmPlatz && !warAmPlatz.current;
    warAmPlatz.current = jetztAmPlatz;
    if (nah) setHinweis(`${nah.station.kurz} – tippe auf die Tür!`);
    else if (nachbar && !gesprochen.includes(nachbar.id)) setHinweis(`Da ist ${nachbar.name}. Sag Hallo!`);
    else if (betreten) raketeErreicht();
    else if (!jetztAmPlatz && rakete === "bereit") {
      const fehlt = STATIONEN.filter((s) => !teile.includes(s.teil));
      setHinweis(fehlt.length ? `Hol ${fehlt.length === STATIONEN.length ? "die" : "noch"} ${fehlt.length} Raketenteil${fehlt.length === 1 ? "" : "e"} aus den Häusern!` : "Alle Teile da! Lauf zur Rakete!");
    }
  }, [nah, nachbar, gesprochen, position, stadt, teile, rakete, startet, raketeErreicht]);

  useEffect(() => {
    const zu = setTimeout(() => setPicoStand({ text: hinweis, offen: false, ungelesen: true }), 5500);
    return () => clearTimeout(zu);
  }, [hinweis]);

  /* ---------- Ansicht ---------- */

  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const beobachter = new ResizeObserver(([e]) => {
      const r = e?.contentRect;
      if (r && r.height > 0) setVerhaeltnis(r.width / r.height);
    });
    beobachter.observe(el);
    const voll = () => setVollbild(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", voll);
    return () => {
      beobachter.disconnect();
      document.removeEventListener("fullscreenchange", voll);
    };
  }, []);

  async function vollbildUmschalten() {
    if (vollbild) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      setVollbild(false);
      return;
    }
    setVollbild(true);
    await rahmen.current?.parentElement?.requestFullscreen?.().catch(() => {});
  }

  // Sichtbreite: auf dem Handy nah dran, am großen Bildschirm fast die ganze Stadt.
  const basis = verhaeltnis < 1 ? 860 : verhaeltnis < 1.4 ? 980 : 1380;
  const sichtBreite = Math.min(stadt.breite, basis / zoom);
  const sichtHoehe = Math.min(stadt.hoehe, sichtBreite / verhaeltnis);
  const kamera = {
    x: Math.max(0, Math.min(stadt.breite - sichtBreite, position.x - sichtBreite / 2)),
    y: Math.max(0, Math.min(stadt.hoehe - sichtHoehe, position.y - sichtHoehe * 0.6)),
  };

  /* ---------- Aufgaben & Belohnung ---------- */

  function geschafft() {
    const id = `${station.id}-${phase}`;
    if (erfolge.includes(id)) return;
    const neuesTeil = !erfolge.some((e) => e.startsWith(`${station.id}-`));
    speichere({ ...stand, fortschritt: { ...stand.fortschritt, [stufe]: [...erfolge, id] } });
    setBelohnung(neuesTeil ? station.teil : "Stern");
    klang.richtig();
    window.setTimeout(() => (neuesTeil ? klang.teil() : klang.stern()), 350);
  }

  const passende = useMemo(() => passendeSpielAngebote(angebote, station.thema, stand.alter, jetztDatum), [angebote, station.thema, stand.alter, jetztDatum]);
  const gesammelt = useMemo(() => fuerModus(angebote, "kind").filter((a) => merk.ids.includes(a.id)), [angebote, merk.ids]);
  const gesammeltIds = useMemo(() => gesammelt.map((a) => a.id), [gesammelt]);
  const vorschlaege = useMemo(() => empfehlungen(angebote, stand, jetztDatum), [angebote, stand, jetztDatum]);

  function neuAnfangen() {
    loesche("sitzung", SPEICHER_STAND);
    loesche("sitzung", SPEICHER_FIGUR);
    loesche("sitzung", SPEICHER_AVATAR);
    loesche("sitzung", SPEICHER_GESPRAECHE);
    setAvatar(STANDARD_AVATAR);
    setGesprochen([]);
    setGespraech(null);
    setStartSchritt("alter");
    setFenster(undefined);
    merk.leeren();
    stoppen();
    pos.current = stadt.start;
    setPosition(stadt.start);
    setStand(neuerSpielstand());
    loesche("sitzung", SPEICHER_RAKETE);
    loesche("sitzung", "spielwelt.anleitung");
    raketeRef.current = "bereit";
    setRakete("bereit");
    warAmPlatz.current = false;
    setNeuFrage(false);
    setBereit(false);
    setHinweis("Tippe auf ein Haus!");
  }

  function einpacken(id: string) {
    if (!merk.ids.includes(id)) klang.einpacken();
    merk.merken(id);
  }

  function tonUmschalten() {
    const neu = !tonAus;
    setTonAus(neu);
    setzeKlangAus(neu);
    if (!neu) klang.klick();
  }

  /* ---------- Gespräche ---------- */

  const zeilen = imGespraech ? (klein ? imGespraech.gespraech.klein : imGespraech.gespraech.gross) : [];
  const frage = imGespraech?.gespraech.frage;
  const gewaehlt = gespraech?.antwort != null ? frage?.antworten[gespraech.antwort] : undefined;
  const gespraechText = !gespraech || !imGespraech ? "" : gewaehlt ? gewaehlt.rueckmeldung : gespraech.zeile < zeilen.length ? zeilen[gespraech.zeile]! : frage?.text ?? "";
  const { kann: kannVorlesen, sprich, stopp: stoppVorlesen } = vorlesen;

  // Bei Ton an liest die Stimme des Geräts jede neue Gesprächszeile vor.
  useEffect(() => {
    if (!gespraechText) return;
    if (!tonAus && kannVorlesen) sprich(gespraechText);
  }, [gespraechText, tonAus, kannVorlesen, sprich]);

  function gespraechWeiter() {
    if (!gespraech) return;
    klang.klick();
    setGespraech({ ...gespraech, zeile: gespraech.zeile + 1 });
  }

  function antworte(i: number) {
    if (!gespraech || !frage) return;
    const a = frage.antworten[i];
    if (!a) return;
    if (a.richtig) klang.richtig();
    else klang.falsch();
    setGespraech({ ...gespraech, antwort: i });
  }

  function gespraechEnde() {
    if (gespraech && gewaehlt?.richtig && !gesprochen.includes(gespraech.id)) {
      const neu = [...gesprochen, gespraech.id];
      setGesprochen(neu);
      schreibe("sitzung", SPEICHER_GESPRAECHE, neu);
      klang.stern();
    }
    stoppVorlesen();
    setGespraech(null);
  }

  /* ---------- Bereich für Erwachsene: drei Sekunden halten ---------- */

  function haltenStart() {
    if (halteUhr.current) return;
    setHalten(true);
    halteUhr.current = setTimeout(() => {
      halteUhr.current = null;
      setHalten(false);
      setFenster("erwachsene");
      klang.tuer();
    }, HALTEN_MS);
  }
  function haltenEnde() {
    if (halteUhr.current) clearTimeout(halteUhr.current);
    halteUhr.current = null;
    setHalten(false);
  }
  useEffect(() => () => { if (halteUhr.current) clearTimeout(halteUhr.current); }, []);

  function steuerDruck(taste: string, an: boolean) {
    if (an) {
      route.current = [];
      zielAktion.current = null;
      setZiel(undefined);
      tasten.current.add(taste);
    } else tasten.current.delete(taste);
  }

  return (
    <AvatarKontext.Provider value={avatar}>
    <main id="inhalt" className={`spielwelt ${vollbild ? "ist-vollbild" : ""}`}>
      <section className="spielwelt-kopf">
        <div>
          <p className="spiel-kennung">Spielwelt · 6 bis 11 Jahre</p>
          <h1>Bau die COSMOS-Rakete!</h1>
        </div>
        <div className="kopf-knoepfe">
          <button className="spiel-knopf erwachsene-knopf" onClick={() => { stoppen(); setFenster("tor"); }}>
            <Symbol name="user" />
            Für Erwachsene
          </button>
          <button className="spiel-knopf rucksack-knopf" onClick={() => { stoppen(); setFenster("rucksack"); }}>
            <Symbol name="backpack" />
            Rucksack
            <span className="spiel-zaehler">{gesammelt.length}</span>
          </button>
        </div>
      </section>

      <div className="spielwelt-buehne">
        <div ref={rahmen} className="spielwelt-rahmen" aria-describedby="spiel-erklaerung">
          <svg
            ref={welt}
            className="spielwelt-svg"
            viewBox={`${kamera.x.toFixed(1)} ${kamera.y.toFixed(1)} ${sichtBreite.toFixed(1)} ${sichtHoehe.toFixed(1)}`}
            preserveAspectRatio="xMidYMid slice"
            onPointerDown={weltAntippen}
            role="img"
            aria-label="Spielwelt: eine kleine Stadt mit vier Lernhäusern, einer Straße mit Zebrastreifen und einer Rakete auf dem Platz."
          >
            <StadtKulisse stadt={stadt} teile={teile} erledigt={mitTeilIds} nahesHausId={nah?.station.id} rakete={rakete} />
            <StadtLeben stadt={stadt} avatar={avatar} position={position} blick={blick} spiegeln={spiegeln} laeuft={laeuft} autos={autos} ziel={ziel} bewohner={bewohner} sprichtMit={gespraech?.id} nahBei={nachbar?.id} gesprochen={gesprochen} />
            <TunnelHuegel stadt={stadt} />
          </svg>

          {/* Kopfleiste im Spiel: nur Symbole */}
          <div className="hud-oben">
            <button className="hud-figur" onClick={() => { stoppen(); setGespraech(null); setStartSchritt("figur"); setBereit(false); }} aria-label="Meine Figur ändern">
              <Avatar wert={avatar} className="hud-portrait" mini />
              <span className="hud-sterne" aria-label={`${erfolge.length} von 12 Sternen`}>
                <Symbol name="star" />
                {erfolge.length}
              </span>
            </button>
            <ol className="hud-teile" aria-label={`Raketenteile: ${teile.length} von ${STATIONEN.length}`}>
              {STATIONEN.map((s) => (
                <li key={s.id} className={teile.includes(s.teil) ? "hat-teil" : ""} title={`${s.teil} aus ${s.kurz}`} style={{ ["--teil-farbe" as string]: s.farbe }}>
                  <svg viewBox="-16 -16 32 32" aria-hidden="true"><ThemenSymbol thema={s.aufgabe} groesse={22} /></svg>
                </li>
              ))}
              <li className={`hud-rakete ${alleTeile ? "hat-teil" : ""}`}>
                <Symbol name="rocket" />
              </li>
            </ol>
            <div className="hud-knoepfe">
              <button className="rund-knopf" onClick={() => { stoppen(); setAnleitung(true); }} aria-label="So geht's">
                <Symbol name="info" />
              </button>
              <button className="rund-knopf" onClick={tonUmschalten} aria-label={tonAus ? "Ton an" : "Ton aus"} aria-pressed={!tonAus}>
                <Symbol name={tonAus ? "mute" : "volume"} />
              </button>
              <button className="rund-knopf" onClick={() => { stoppen(); setPausiert(!pausiert); }} aria-label={pausiert ? "Weiterspielen" : "Pause"} aria-pressed={pausiert}>
                <Symbol name={pausiert ? "play" : "pause"} />
              </button>
              <button className="rund-knopf" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.2).toFixed(2)))} disabled={zoom >= ZOOM_MAX} aria-label="Näher heran">
                <Symbol name="plus" />
              </button>
              <button className="rund-knopf" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.2).toFixed(2)))} disabled={zoom <= ZOOM_MIN} aria-label="Weiter weg">
                <Symbol name="minus" />
              </button>
              <button className="rund-knopf" onClick={vollbildUmschalten} aria-label={vollbild ? "Vollbild verlassen" : "Vollbild"} aria-pressed={vollbild}>
                <Symbol name={vollbild ? "shrink" : "expand"} />
              </button>
            </div>
          </div>

          {/* Pico funkt aus der Ecke: Die Nachricht klappt kurz auf und wird dann wieder klein – so bleiben die Autos im Blick. */}
          <p className="sr-only" role="status">{hinweis}</p>
          {bereit && !pausiert && !gespraech && (
            <div className="pico-funk">
              <AnimatePresence mode="wait">
                {picoOffen && (
                  <motion.div
                    key={hinweis}
                    className="pico-blase"
                    initial={{ opacity: 0, scale: 0.5, x: 30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: 30 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    style={{ originX: 1, originY: 1 }}
                  >
                    <span>{hinweis}</span>
                    {vorlesen.kann && (
                      <button className="rund-knopf rund-klein" onClick={() => vorlesen.sprich(hinweis)} aria-label="Vorlesen">
                        <Symbol name="volume" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                key={`pico-${hinweis}`}
                className="pico-knopf"
                onClick={() => setPicoStand({ text: hinweis, offen: !picoOffen, ungelesen: false })}
                aria-label={picoOffen ? "Pico-Nachricht einklappen" : "Pico-Nachricht zeigen"}
                aria-expanded={picoOffen}
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -14, 12, -6, 0], y: [0, -8, 0] }}
                transition={{ duration: 0.6 }}
              >
                <PixelBild motiv="roboter" />
                {picoUngelesen && !picoOffen && <span className="pico-punkt" aria-hidden="true" />}
              </motion.button>
            </div>
          )}

          <div className="steuerkreuz" role="group" aria-label="Figur bewegen">
            {([
              ["ArrowUp", "oben", 270, "Nach oben"],
              ["ArrowLeft", "links", 180, "Nach links"],
              ["ArrowRight", "rechts", 0, "Nach rechts"],
              ["ArrowDown", "unten", 90, "Nach unten"],
            ] as const).map(([taste, klasse, drehung, text]) => (
              <button
                key={taste}
                className={`steuer-${klasse}`}
                aria-label={text}
                disabled={pausiert}
                onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); steuerDruck(taste, true); }}
                onPointerUp={() => steuerDruck(taste, false)}
                onPointerCancel={() => steuerDruck(taste, false)}
                onLostPointerCapture={() => steuerDruck(taste, false)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const d = TASTEN[taste]!; laufeZu({ x: pos.current.x + d.x * 120, y: pos.current.y + d.y * 120 }, null); } }}
              >
                <Symbol name="arrow" style={{ transform: `rotate(${drehung}deg)` }} />
              </button>
            ))}
          </div>

          <AnimatePresence>
            {nah && !fenster && (
              <motion.button
                key="haus"
                className="aktion-knopf"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={() => oeffneHaus(nah.station.id)}
              >
                <Symbol name="home" />
                {nah.station.kurz}
              </motion.button>
            )}
            {!nah && !fenster && !gespraech && nachbar && (
              <motion.button
                key={`bewohner-${nachbar.id}`}
                className="aktion-knopf aktion-reden"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={() => sprichMit(nachbar.id)}
              >
                <Symbol name="story" />
                Mit {nachbar.name} sprechen
              </motion.button>
            )}
            {!nah && !nachbar && !fenster && amPlatz(stadt, position) && (rakete === "weg" || (alleTeile && rakete === "bereit")) && (
              <motion.button
                key="rakete"
                className="aktion-knopf aktion-rakete"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={raketeStarten}
              >
                <Symbol name="rocket" />
                {rakete === "weg" ? "Nochmal fliegen" : "Rakete starten"}
              </motion.button>
            )}
          </AnimatePresence>


          <AnimatePresence>
            {imGespraech && gespraech && (
              <motion.section
                key="gespraech"
                className="gespraech"
                aria-labelledby="gespraech-name"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                onKeyDown={(e) => { if (e.key === "Escape") gespraechEnde(); }}
              >
                {imGespraech.aussehen === "roboter" ? <svg className="gespraech-portrait" viewBox="0 0 120 140" aria-hidden="true"><Roboter /></svg> : <Avatar wert={imGespraech.aussehen} className="gespraech-portrait" mini label={imGespraech.name} />}
                <div className="gespraech-inhalt">
                  <h2 id="gespraech-name">{imGespraech.name}</h2>
                  <p className="gespraech-text" aria-live="polite">{gespraechText}</p>
                  <div className="gespraech-knoepfe">
                    {gewaehlt ? (
                      gewaehlt.richtig ? (
                        <button className="spiel-knopf spiel-knopf-dunkel" onClick={gespraechEnde} autoFocus><Symbol name="check" /> Tschüss, {imGespraech.name}!</button>
                      ) : (
                        <button className="spiel-knopf spiel-knopf-dunkel" onClick={() => setGespraech({ ...gespraech, antwort: null })} autoFocus><Symbol name="refresh" /> Nochmal überlegen</button>
                      )
                    ) : gespraech.zeile < zeilen.length ? (
                      <button className="spiel-knopf spiel-knopf-dunkel" onClick={gespraechWeiter} autoFocus><Symbol name="arrow" /> Weiter</button>
                    ) : (
                      frage?.antworten.map((a, i) => (
                        <button key={a.text} className="spiel-knopf" onClick={() => antworte(i)} autoFocus={i === 0}>{a.text}</button>
                      ))
                    )}
                    {kannVorlesen && (
                      <button className="rund-knopf rund-klein" onClick={() => sprich(gespraechText)} aria-label="Nochmal vorlesen">
                        <Symbol name="volume" />
                      </button>
                    )}
                  </div>
                </div>
                <button className="rund-knopf gespraech-zu" onClick={gespraechEnde} aria-label="Gespräch beenden">
                  <Symbol name="close" />
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          {pausiert && (
            <div className="pause-flaeche">
              <PixelBild motiv="roboter" />
              <button className="spiel-knopf spiel-knopf-dunkel" onClick={() => setPausiert(false)}>
                <Symbol name="play" />
                Weiter
              </button>
            </div>
          )}

          <AnimatePresence>
            {!bereit && (
              <StartAuswahl
                schritt={startSchritt}
                setSchritt={setStartSchritt}
                avatar={avatar}
                setAvatar={setAvatar}
                alter={stand.alter}
                waehleAlter={(alter) => speichere({ ...stand, alter })}
                los={() => {
                  schreibe("sitzung", SPEICHER_AVATAR, avatar);
                  loesche("sitzung", SPEICHER_FIGUR);
                  setBereit(true);
                  klang.klick();
                  if (!lies<boolean>("sitzung", "spielwelt.anleitung", false)) setAnleitung(true);
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {bereit && anleitung && (
              <Anleitung
                weiter={() => {
                  schreibe("sitzung", "spielwelt.anleitung", true);
                  setAnleitung(false);
                  klang.klick();
                }}
              />
            )}
          </AnimatePresence>
        </div>
        <p id="spiel-erklaerung" className="spiel-erklaerung">
          <Symbol name="info" /> Tippe auf ein Haus oder einen Weg. Oder nutze die Pfeile. Straße nur am Zebrastreifen!
        </p>
      </div>

      <section className="haus-leiste" aria-labelledby="haeuser-titel">
        <h2 id="haeuser-titel"><Symbol name="map" /> Die Lernhäuser</h2>
        <div className="haus-karten">
          {STATIONEN.map((s, i) => {
            const geschafftAnzahl = erfolge.filter((id) => id.startsWith(`${s.id}-`)).length;
            return (
              <motion.button key={s.id} className="haus-karte" onClick={() => zumHaus(s.id)} style={{ ["--haus-farbe" as string]: s.farbe }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}>
                <PixelBild motiv={s.grafik} />
                <strong>{s.kurz}</strong>
                <span className="haus-karte-ort">{s.name}</span>
                <span className="haus-karte-sterne" aria-label={`${geschafftAnzahl} von 3 Aufgaben`}>
                  {[0, 1, 2].map((n) => (
                    <Symbol key={n} name="star" className={n < geschafftAnzahl ? "stern-an" : "stern-aus"} />
                  ))}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="neu-anfangen">
          {neuFrage ? (
            <>
              <span>Figur, Sterne und Rucksack löschen?</span>
              <button className="spiel-knopf spiel-knopf-dunkel" onClick={neuAnfangen}><Symbol name="check" /> Ja, neu anfangen</button>
              <button className="spiel-knopf" onClick={() => setNeuFrage(false)}><Symbol name="close" /> Nein</button>
            </>
          ) : (
            <button className="spiel-knopf" onClick={() => setNeuFrage(true)}><Symbol name="refresh" /> Neu anfangen</button>
          )}
        </div>
        <p className="haus-leiste-fuss">
          Die Häuser zeigen echte Heilbronner Lernorte, die Aufgaben sind ausgedachte Lernspiele. Echte Kurse findest du in jedem Haus. Mehr zeigen dir deine Eltern über „Für Erwachsene“.
        </p>
      </section>

      {/* ---------- Fenster ---------- */}

      <Fensterrahmen
        offen={fenster === "haus"}
        schliessen={() => setFenster(undefined)}
        kennung="haus-titel"
        titel={station.titel}
        breit
        kopfbild={<PixelBild motiv={station.grafik} className="fenster-kopfbild" />}
      >
        {!szeneFertig ? (
          <OrtSzene
            station={station}
            avatar={avatar}
            klein={klein}
            stumm={tonAus}
            fertig={() => {
              setSzeneFertig(true);
              const neu = besucht.includes(station.id) ? besucht : [...besucht, station.id];
              setBesucht(neu);
              schreibe("sitzung", SPEICHER_BESUCHT, neu);
            }}
          />
        ) : (
        <div className="haus-inhalt">
          <p className="haus-geschichte">
            <span className="haus-ort" style={{ background: station.farbe }}>{station.kurz} · {station.name}</span>
            {GESCHICHTE[station.id]?.[klein ? 0 : 1]}
            {vorlesen.kann && (
              <button className="rund-knopf rund-klein" onClick={() => vorlesen.sprich(GESCHICHTE[station.id]?.[klein ? 0 : 1] ?? "")} aria-label="Vorlesen">
                <Symbol name="volume" />
              </button>
            )}
          </p>
          {fotoFuer(station.id) ? (
            <div className="haus-echt">
              <FotoZoom foto={fotoFuer(station.id)!} links={false} />
              <div>
                <h3>So sieht es in echt aus</h3>
                <p>{fotoFuer(station.id)!.zeigt}</p>
                <p className="haus-echt-tipp">Tippe aufs Foto, dann wird es groß.</p>
              </div>
            </div>
          ) : (
            <div className="haus-echt">
              <figure className="haus-echt-zeichnung"><OrtsBild id={station.id} name={station.name} farbe={station.farbe} /></figure>
              <div>
                <h3>Der echte Ort</h3>
                <p>Das {station.name} ist in Heilbronn. Ein Foto fehlt uns noch – das hier ist eine Zeichnung.</p>
              </div>
            </div>
          )}
          <nav className="aufgaben-reiter" aria-label="Aufgaben in diesem Haus">
            {[0, 1, 2].map((n) => {
              const fertig = erfolge.includes(`${station.id}-${n}`);
              return (
                <button key={n} aria-current={phase === n ? "step" : undefined} className={fertig ? "ist-fertig" : ""} onClick={() => { setPhase(n); setBelohnung(null); setEingefuehrt(false); }} aria-label={`Aufgabe ${n + 1}: ${AUFGABEN_TITEL[station.id]?.[n] ?? ""}${fertig ? ", geschafft" : ""}`}>
                  {fertig ? <Symbol name="star" /> : n + 1}
                </button>
              );
            })}
            {eingefuehrt && (
              <button className="aufgabe-erklaerung" onClick={() => setEingefuehrt(false)}>
                <Symbol name="info" /> Erklärung
              </button>
            )}
          </nav>
          <div className="aufgabe-flaeche">
            {eingefuehrt ? (
              <Lernaufgabe key={`${station.id}-${stufe}-${phase}`} art={station.aufgabe} stufe={stufe} phase={phase} geschafft={geschafft} fehler={() => klang.falsch()} figur={figur} />
            ) : (
              <AufgabenEinstieg key={`einstieg-${station.id}-${stufe}-${phase}`} art={station.aufgabe} stufe={stufe} phase={phase} stumm={tonAus} starten={() => { setEingefuehrt(true); klang.klick(); }} />
            )}
            <AnimatePresence>
              {belohnung && (
                <motion.div className="belohnung" initial={{ scale: 0.4, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <motion.span key={i} className="funke" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos((i / 8) * Math.PI * 2) * 90, y: Math.sin((i / 8) * Math.PI * 2) * 70, opacity: 0 }} transition={{ duration: 0.9, delay: 0.1 }}>
                      <Symbol name="star" />
                    </motion.span>
                  ))}
                  <div className="belohnung-bild" style={{ background: station.farbe }}>
                    {belohnung === "Stern" ? <Symbol name="star" /> : <Symbol name="rocket" />}
                  </div>
                  <strong>{belohnung === "Stern" ? "Ein Stern für dich!" : `Raketenteil: ${belohnung}!`}</strong>
                  <div className="belohnung-knoepfe">
                    {phase < 2 && (
                      <button className="spiel-knopf spiel-knopf-dunkel" onClick={() => { setPhase(phase + 1); setBelohnung(null); setEingefuehrt(false); }}>
                        <Symbol name="arrow" /> Nächste Aufgabe
                      </button>
                    )}
                    <button className="spiel-knopf" onClick={() => { setBelohnung(null); setFenster(undefined); }}>
                      <Symbol name="map" /> Zurück in die Stadt
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <section className="echte-kurse" aria-labelledby="kurse-titel">
            <h3 id="kurse-titel">
              <Symbol name="ticket" /> Echte Kurse für {stand.alter} Jahre
              <span className="spiel-zaehler">{passende.length}</span>
            </h3>
            {passende.length ? (
              <>
                <div className="sammelkarten">
                  {(alleKurse ? passende : passende.slice(0, 3)).map((a, i) => (
                    <Sammelkarte key={a.id} angebot={a} meta={meta} gesammelt={merk.ids.includes(a.id)} sammeln={einpacken} jetzt={jetzt} index={i} />
                  ))}
                </div>
                {passende.length > 3 && (
                  <button className="spiel-knopf" onClick={() => setAlleKurse(!alleKurse)}>
                    {alleKurse ? "Weniger zeigen" : `Alle ${passende.length} zeigen`}
                  </button>
                )}
              </>
            ) : (
              <p className="leer-hinweis">
                <Symbol name="info" /> Gerade kein passender Kurs für {stand.alter} Jahre. Deine Eltern finden mehr über „Für Erwachsene“.
              </p>
            )}
          </section>
        </div>
        )}
      </Fensterrahmen>

      <Fensterrahmen offen={fenster === "tor"} schliessen={() => { haltenEnde(); setFenster(undefined); }} kennung="tor-titel" titel="Für Erwachsene" kopfbild={<Symbol name="user" className="fenster-symbol" />}>
        <div className="erwachsenen-tor">
          <p>Hier geht es zu Kursen, Einstellungen und Seiten außerhalb des Spiels.</p>
          <p>Halten Sie den Knopf drei Sekunden gedrückt. Mit der Tastatur: Leertaste oder Enter gedrückt halten.</p>
          <button
            className={`spiel-knopf spiel-knopf-dunkel halteknopf ${halten ? "haelt" : ""}`}
            style={{ ["--halten-ms" as string]: `${HALTEN_MS}ms` }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); haltenStart(); }}
            onPointerUp={haltenEnde}
            onPointerCancel={haltenEnde}
            onLostPointerCapture={haltenEnde}
            onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); haltenStart(); } }}
            onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); haltenEnde(); } }}
            onBlur={haltenEnde}
          >
            {halten ? "Bitte halten …" : "Gedrückt halten"}
          </button>
          <small>Schutz vor versehentlichem Öffnen, keine Altersprüfung.</small>
        </div>
      </Fensterrahmen>

      <Fensterrahmen offen={fenster === "erwachsene"} schliessen={() => setFenster(undefined)} kennung="erwachsene-titel" titel="Für Eltern und Begleitpersonen" breit kopfbild={<Symbol name="user" className="fenster-symbol" />}>
        <div className="erwachsenen-bereich">
          <p>Das Kind spielt ohne Konto und ohne Namen. Figur, Sterne, Gespräche und Rucksack liegen nur in dieser Browsersitzung.</p>
          <div className="erwachsenen-links">
            <Link className="spiel-knopf spiel-knopf-dunkel" href="/eltern/#spielbericht"><Symbol name="star" /> Entdeckungen & passende Kurse</Link>
            <Link className="spiel-knopf" href="/einrichtungen/"><Symbol name="map" /> Lernorte auf der Karte</Link>
            <Link className="spiel-knopf" href="/datenschutz/"><Symbol name="info" /> Datenschutz</Link>
            <Link className="spiel-knopf" href="/impressum/"><Symbol name="info" /> Impressum</Link>
            <Link className="spiel-knopf" href="/"><Symbol name="home" /> Startseite</Link>
          </div>
          <div className="erwachsenen-loeschen">
            <h3>Alles löschen</h3>
            <p>Löscht Figur, Alter, Sterne, Gespräche, Wünsche und Rucksack aus dieser Sitzung.</p>
            <button className="spiel-knopf" onClick={neuAnfangen}><Symbol name="refresh" /> Jetzt löschen und neu beginnen</button>
          </div>
        </div>
      </Fensterrahmen>

      <Fensterrahmen offen={fenster === "rucksack"} schliessen={() => setFenster(undefined)} kennung="rucksack-titel" titel="Mein Rucksack" breit kopfbild={<Symbol name="backpack" className="fenster-symbol" />}>
        {gesammelt.length ? (
          <>
            <div className="sammelkarten">
              {gesammelt.map((a, i) => (
                <Sammelkarte key={a.id} angebot={a} meta={meta} gesammelt sammeln={einpacken} jetzt={jetzt} index={i} />
              ))}
            </div>
            <ZeigEltern ids={gesammeltIds} />
            <button className="spiel-knopf mt-4" onClick={merk.leeren}>
              <Symbol name="refresh" /> Rucksack leeren
            </button>
          </>
        ) : (
          <div className="leer-rucksack">
            <Symbol name="backpack" className="leer-symbol" />
            <p>Noch leer! Löse eine Aufgabe in einem Haus und pack echte Kurse ein.</p>
          </div>
        )}
      </Fensterrahmen>


      <Fensterrahmen
        offen={fenster === "finale"}
        schliessen={() => { setFenster(undefined); raketeRef.current = "weg"; setRakete("weg"); schreibe("sitzung", SPEICHER_RAKETE, "weg"); setHinweis("Die Rakete ist im All! Pack dir echte Kurse ein."); }}
        kennung="finale-titel"
        titel="Die Rakete fliegt!"
        breit
        kopfbild={<Symbol name="rocket" className="fenster-symbol" />}
      >
        <div className="entdecker-pass">
          <div className="pass-kopf">
            <Avatar wert={avatar} className="pass-portrait" mini />
            <div>
              <p className="spiel-kennung">Entdecker-Pass</p>
              <strong>{erfolge.length} Sterne · {gesprochen.length} Gespräche</strong>
            </div>
          </div>
          <div className="pass-stempel">
            {STATIONEN.map((s, i) => (
              <motion.div key={s.id} className="stempel" initial={{ scale: 2, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: i % 2 ? 6 : -6 }} transition={{ delay: 0.25 + i * 0.2, type: "spring", stiffness: 300, damping: 15 }} style={{ ["--haus-farbe" as string]: s.farbe }}>
                <PixelBild motiv={s.grafik} />
                <span>{s.kurz}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <h3 className="finale-frage"><Symbol name="star" /> Was willst du in echt ausprobieren?</h3>
        <div className="wunsch-knoepfe">
          {WUENSCHE.map((w) => (
            <button key={w.id} className="spiel-knopf" aria-pressed={stand.wuensche.includes(w.id)} onClick={() => speichere({ ...stand, wuensche: stand.wuensche.includes(w.id) ? stand.wuensche.filter((x) => x !== w.id) : [...stand.wuensche, w.id] })}>
              <svg viewBox="-14 -14 28 28" className="symbol" aria-hidden="true"><ThemenSymbol thema={w.id} groesse={20} /></svg>
              {w.titel}
            </button>
          ))}
        </div>
        {vorschlaege.length > 0 && (
          <div className="sammelkarten">
            {vorschlaege.flatMap((v) => v.angebote.slice(0, 2)).slice(0, 4).map((a, i) => (
              <Sammelkarte key={a.id} angebot={a} meta={meta} gesammelt={merk.ids.includes(a.id)} sammeln={einpacken} jetzt={jetzt} index={i} />
            ))}
          </div>
        )}
        <ZeigEltern ids={gesammeltIds} />
      </Fensterrahmen>
    </main>
    </AvatarKontext.Provider>
  );
}
