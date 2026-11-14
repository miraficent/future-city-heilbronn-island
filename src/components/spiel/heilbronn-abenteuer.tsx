"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AUFGABEN_TITEL, empfehlungen, neuerSpielstand, pruefeSpielstand, stufeFuerAlter, WUENSCHE, type Spielstand } from "@/lib/abenteuer";
import type { Angebot } from "@/lib/angebot";
import { alterAvatar, pruefeAvatar, STANDARD_AVATAR, type AvatarKonfiguration } from "@/lib/avatar";
import { aussehenVon, gespraechVon, ORT_GESCHICHTE } from "@/lib/bewohner";
import type { Meta } from "@/lib/daten";
import { fuerModus } from "@/lib/entdecken";
import { fotoFuer } from "@/lib/fotos";
import { klang, klangIstAus, setzeKlangAus } from "@/lib/klang";
import { passendeSpielAngebote, STATIONEN } from "@/lib/spiel";
import { lies, loesche, schreibe } from "@/lib/speicher";
import { figurHoehe, frei, schritt, SPRECH_ABSTAND, SZENE_BREITE, SZENE_HOEHE, SZENEN, szeneVon, TUER_ABSTAND, type SzenenFigur } from "@/lib/szenen";
import { useVorlesen } from "@/lib/vorlesen";
import { FotoZoom } from "../foto-zoom";
import { OrtsBild } from "../ortsbild";
import { useSammlung } from "../sammlung";
import { Symbol } from "../symbol";
import { Anleitung } from "./anleitung";
import { AufgabenEinstieg } from "./aufgaben-einstieg";
import { Avatar, AvatarKontext, type FigurBlick } from "./avatar";
import { Fensterrahmen } from "./fensterrahmen";
import { Lernaufgabe } from "./lernaufgabe";
import { PixelBild, Roboter } from "./pixel-grafik";
import { Rakete } from "./rakete";
import { Sammelkarte } from "./sammelkarte";
import { StadtbahnKarte } from "./stadtbahn-karte";
import { StartAuswahl, type StartSchritt } from "./start-auswahl";
import { ThemenSymbol } from "./themen-symbol";
import { ZeigEltern } from "./zeig-eltern";

const TASTEN: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};
/** Bildpunkte pro Sekunde; in die Tiefe geht es langsamer. */
const TEMPO = 380;
const TIEFE = 0.55;
const HALTEN_MS = 3000;
const SPEICHER = {
  stand: "abenteuer.v2",
  avatar: "spielwelt.avatar",
  alteFigur: "spielwelt.figur",
  gespraeche: "spielwelt.gespraeche",
  besucht: "spielwelt.besucht",
  ort: "spielwelt.ort",
  rakete: "spielwelt.rakete",
  anleitung: "spielwelt.anleitung",
};

type Punkt = { x: number; y: number };
type Fenster = "aufgaben" | "rucksack" | "finale" | "tor" | "erwachsene" | "bahn" | undefined;
type ZielAktion = { art: "tuer" } | { art: "figur"; id: string } | null;
/** Gespräch: erst die Sätze (bei der Begrüßung die Ortsgeschichte), dann die Frage, dann die Rückmeldung. */
type GespraechStand = { id: string; zeile: number; antwort: number | null; geschichte: boolean };

/** Eine Figur auf dem Platz: hinten kleiner, vorne größer. Füße stehen genau auf dem Punkt. */
function SzenenPerson({ aussehen, punkt, blick, laeuft, spricht, name }: { aussehen: AvatarKonfiguration | "roboter"; punkt: Punkt; blick: FigurBlick; laeuft: boolean; spricht: boolean; name: string }) {
  const h = figurHoehe(punkt.y);
  const b = (h * 200) / 360;
  return (
    <g transform={`translate(${punkt.x.toFixed(1)} ${punkt.y.toFixed(1)})`}>
      <ellipse rx={b * 0.34} ry={h * 0.03} fill="#1c1934" opacity="0.28" />
      {aussehen === "roboter" ? (
        <g className={spricht ? "roboter-spricht" : "roboter-schwebt"}>
          <Roboter x={-h * 0.27} y={-h * 0.66} breite={h * 0.54} hoehe={h * 0.63} />
        </g>
      ) : (
        <Avatar wert={aussehen} x={-b / 2} y={-h * (349 / 360)} width={b} height={h} laeuft={laeuft} blick={blick} spricht={spricht} label={name} mini />
      )}
    </g>
  );
}

export function HeilbronnAbenteuer({ angebote, meta, jetzt: startJetzt }: { angebote: Angebot[]; meta: Meta; jetzt: string }) {
  const [bereit, setBereit] = useState(false);
  const [startSchritt, setStartSchritt] = useState<StartSchritt>("alter");
  const [anleitung, setAnleitung] = useState(false);
  const [avatar, setAvatar] = useState<AvatarKonfiguration>(STANDARD_AVATAR);
  const [stand, setStand] = useState<Spielstand>(() => neuerSpielstand());
  const [ortId, setOrtId] = useState(SZENEN[0]!.station.id);
  const szene = szeneVon(ortId);
  const station = szene.station;
  const [position, setPosition] = useState<Punkt>(szene.start);
  const [blick, setBlick] = useState<FigurBlick>("vorne");
  const [laeuft, setLaeuft] = useState(false);
  const [ziel, setZiel] = useState<Punkt>();
  const [fenster, setFenster] = useState<Fenster>();
  const [phase, setPhase] = useState(0);
  const [eingefuehrt, setEingefuehrt] = useState(false);
  const [belohnung, setBelohnung] = useState<string | null>(null);
  const [gespraech, setGespraech] = useState<GespraechStand | null>(null);
  const [gesprochen, setGesprochen] = useState<string[]>([]);
  const [besucht, setBesucht] = useState<string[]>([]);
  const [rakete, setRakete] = useState<"bereit" | "startet" | "weg">("bereit");
  const [tonAus, setTonAus] = useState(false);
  const [vollbild, setVollbild] = useState(false);
  const [verhaeltnis, setVerhaeltnis] = useState(16 / 9);
  const [hinweis, setHinweis] = useState("Lauf herum und sprich mit den Leuten!");
  const [picoStand, setPicoStand] = useState({ text: "", offen: true, ungelesen: false });
  const [alleKurse, setAlleKurse] = useState(false);
  const [halten, setHalten] = useState(false);
  const [fahrt, setFahrt] = useState<string | null>(null);
  const [jetzt, setJetzt] = useState(startJetzt);

  const pos = useRef<Punkt>(szene.start);
  const tasten = useRef(new Set<string>());
  const zielRef = useRef<Punkt | null>(null);
  const zielAktion = useRef<ZielAktion>(null);
  const laeuftRef = useRef(false);
  const stillSeit = useRef(0);
  const blickRef = useRef<FigurBlick>("vorne");
  const angehalten = useRef(false);
  const halteUhr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rahmen = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  const merk = useSammlung("kind");
  const vorlesen = useVorlesen();
  const stufe = stufeFuerAlter(stand.alter);
  const erfolge = stand.fortschritt[stufe];
  const klein = stand.alter <= 8;
  const teile = useMemo(() => STATIONEN.filter((s) => erfolge.some((id) => id.startsWith(`${s.id}-`))).map((s) => s.teil), [erfolge]);
  const alleTeile = teile.length === STATIONEN.length;
  const figuren = useMemo<SzenenFigur[]>(() => [szene.gastgeber, ...(szene.gast ? [szene.gast] : [])], [szene]);
  const jetztDatum = useMemo(() => new Date(jetzt), [jetzt]);

  const nahFigur = figuren.find((f) => Math.abs(f.x - position.x) < SPRECH_ABSTAND && Math.abs(f.y - position.y) < 90);
  const amEingang = Math.abs(position.x - szene.tuer.x) < TUER_ABSTAND && position.y < szene.boden.hinten + 70;
  const imGespraech = gespraech ? aussehenVon(gespraech.id) : undefined;
  const pausiert = Boolean(!bereit || fenster || anleitung || gespraech || fahrt);
  useEffect(() => {
    angehalten.current = pausiert;
    if (pausiert) tasten.current.clear();
  }, [pausiert]);

  /* ---------- Laden & Speichern ---------- */

  useEffect(() => {
    const geladen = pruefeSpielstand(lies<unknown>("sitzung", SPEICHER.stand, null));
    if (geladen.alter > 11) geladen.alter = 11;
    setStand(geladen);
    const gespeichert = lies<unknown>("sitzung", SPEICHER.avatar, null);
    if (gespeichert) {
      setAvatar(pruefeAvatar(gespeichert));
      setBereit(true);
    } else {
      const alt = lies<string>("sitzung", SPEICHER.alteFigur, "");
      if (alt) setAvatar(alterAvatar(alt));
    }
    const ort = lies<string>("sitzung", SPEICHER.ort, "");
    if (SZENEN.some((s) => s.station.id === ort)) {
      setOrtId(ort);
      const start = szeneVon(ort).start;
      pos.current = start;
      setPosition(start);
    }
    setGesprochen(lies<string[]>("sitzung", SPEICHER.gespraeche, []).filter((x) => typeof x === "string"));
    setBesucht(lies<string[]>("sitzung", SPEICHER.besucht, []).filter((x) => typeof x === "string"));
    if (lies<string>("sitzung", SPEICHER.rakete, "bereit") === "weg") setRakete("weg");
    setTonAus(klangIstAus());
    setJetzt(new Date().toISOString());
  }, []);

  const speichere = useCallback((neu: Spielstand) => {
    setStand(neu);
    schreibe("sitzung", SPEICHER.stand, neu);
  }, []);

  /* ---------- Steuerung ---------- */

  const stoppen = useCallback(() => {
    tasten.current.clear();
    zielRef.current = null;
    zielAktion.current = null;
    setZiel(undefined);
  }, []);

  const sprichMit = useCallback(
    (id: string, geschichte = false) => {
      stoppen();
      setGespraech({ id, zeile: 0, antwort: null, geschichte });
      klang.klick();
    },
    [stoppen],
  );

  const oeffneAufgaben = useCallback(() => {
    stoppen();
    const erste = [0, 1, 2].find((n) => !erfolge.includes(`${station.id}-${n}`));
    setPhase(erste ?? 0);
    setBelohnung(null);
    setEingefuehrt(false);
    setAlleKurse(false);
    setFenster("aufgaben");
    klang.tuer();
  }, [erfolge, station.id, stoppen]);

  const geheZu = useCallback((p: Punkt, aktion: ZielAktion) => {
    tasten.current.clear();
    zielRef.current = p;
    zielAktion.current = aktion;
    setZiel(p);
  }, []);

  const zurFigur = useCallback(
    (f: SzenenFigur) => {
      if (Math.abs(f.x - pos.current.x) < SPRECH_ABSTAND && Math.abs(f.y - pos.current.y) < 90) return sprichMit(f.id);
      const seite = pos.current.x < f.x ? -1 : 1;
      geheZu({ x: f.x + seite * 110, y: Math.min(szene.boden.vorne - 5, f.y + 25) }, { art: "figur", id: f.id });
    },
    [geheZu, sprichMit, szene.boden.vorne],
  );

  const zurTuer = useCallback(() => {
    if (Math.abs(pos.current.x - szene.tuer.x) < TUER_ABSTAND && pos.current.y < szene.boden.hinten + 70) return oeffneAufgaben();
    geheZu({ x: szene.tuer.x, y: szene.boden.hinten + 8 }, { art: "tuer" });
  }, [geheZu, oeffneAufgaben, szene]);

  function weltPunkt(e: React.PointerEvent<SVGSVGElement>): Punkt | null {
    const m = e.currentTarget.getScreenCTM()?.inverse();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  }

  function erzaehle(text: string) {
    setHinweis(text);
    setPicoStand({ text, offen: true, ungelesen: false });
    if (!tonAus && vorlesen.kann) vorlesen.sprich(text);
  }

  function antippen(e: React.PointerEvent<SVGSVGElement>) {
    if (angehalten.current) return;
    const p = weltPunkt(e);
    if (!p) return;
    const figur = figuren.find((f) => Math.abs(p.x - f.x) < 70 && p.y < f.y + 20 && p.y > f.y - figurHoehe(f.y));
    if (figur) return zurFigur(figur);
    if (p.y < szene.boden.hinten - 10) {
      if (Math.abs(p.x - szene.tuer.x) < 230) return zurTuer();
      return erzaehle(szene.fakt);
    }
    const b = szene.boden;
    const ziel = { x: Math.max(b.links, Math.min(b.rechts, p.x)), y: Math.max(b.hinten, Math.min(b.vorne, p.y)) };
    if (frei(szene, ziel, figuren)) geheZu(ziel, null);
  }

  // Tastatur: Pfeile/WASD laufen, Enter/E spricht oder geht hinein.
  useEffect(() => {
    if (!bereit) return;
    const eingabe = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
    const runter = (e: KeyboardEvent) => {
      if (angehalten.current || eingabe(e.target)) return;
      const aktiv = document.activeElement;
      if (aktiv && aktiv !== document.body && !rahmen.current?.contains(aktiv)) return;
      const taste = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (TASTEN[taste]) {
        e.preventDefault();
        zielRef.current = null;
        zielAktion.current = null;
        setZiel(undefined);
        tasten.current.add(taste);
      } else if (e.key === "Enter" || taste === "e") {
        const f = figuren.find((x) => Math.abs(x.x - pos.current.x) < SPRECH_ABSTAND && Math.abs(x.y - pos.current.y) < 90);
        if (f) { e.preventDefault(); sprichMit(f.id); }
        else if (Math.abs(pos.current.x - szene.tuer.x) < TUER_ABSTAND && pos.current.y < szene.boden.hinten + 70) { e.preventDefault(); oeffneAufgaben(); }
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
  }, [bereit, figuren, szene, sprichMit, oeffneAufgaben]);

  /* ---------- Spielschleife ---------- */

  const ankunft = useRef<() => void>(() => {});
  useEffect(() => {
    ankunft.current = () => {
      const aktion = zielAktion.current;
      zielAktion.current = null;
      zielRef.current = null;
      setZiel(undefined);
      if (aktion?.art === "tuer") oeffneAufgaben();
      if (aktion?.art === "figur") sprichMit(aktion.id);
    };
  }, [oeffneAufgaben, sprichMit]);

  useEffect(() => {
    if (!bereit) return;
    let id = 0;
    let vorher = 0;
    const tick = (zeit: number) => {
      const dt = vorher ? Math.min((zeit - vorher) / 1000, 0.05) : 0;
      vorher = zeit;
      let bewegt = false;
      if (!angehalten.current && dt) {
        let rx = 0;
        let ry = 0;
        for (const t of tasten.current) {
          rx += TASTEN[t]?.x ?? 0;
          ry += TASTEN[t]?.y ?? 0;
        }
        const z = zielRef.current;
        if (!rx && !ry && z) {
          const dx = z.x - pos.current.x;
          const dy = (z.y - pos.current.y) / TIEFE;
          const rest = Math.hypot(dx, dy);
          if (rest < 6) ankunft.current();
          else {
            rx = dx / rest;
            ry = dy / rest;
          }
        }
        const laenge = Math.hypot(rx, ry);
        if (laenge) {
          const s = (TEMPO * dt) / laenge;
          const neu = schritt(szene, pos.current, rx * s, ry * s * TIEFE, figuren);
          bewegt = neu.x !== pos.current.x || neu.y !== pos.current.y;
          if (bewegt) {
            const richtung: FigurBlick = Math.abs(rx) > 0.25 ? (rx < 0 ? "links" : "rechts") : blickRef.current;
            if (richtung !== blickRef.current) {
              blickRef.current = richtung;
              setBlick(richtung);
            }
            pos.current = neu;
            setPosition(neu);
            klang.schritt();
          } else if (z) {
            // Ziel nicht erreichbar (Hindernis): stehen bleiben, aber Aktion trotzdem auslösen, wenn man nah genug ist.
            ankunft.current();
          }
        }
      }
      if (bewegt) stillSeit.current = zeit;
      const jetztLaeuft = bewegt || zeit - stillSeit.current < 120;
      if (jetztLaeuft !== laeuftRef.current) {
        laeuftRef.current = jetztLaeuft;
        setLaeuft(jetztLaeuft);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [bereit, szene, figuren]);

  // Beim ersten Besuch eines Ortes begrüßt der Gastgeber und erzählt, worum es geht.
  useEffect(() => {
    if (!bereit || anleitung || fenster || gespraech || fahrt || besucht.includes(station.id)) return;
    const uhr = window.setTimeout(() => sprichMit(szene.gastgeber.id, true), 700);
    return () => window.clearTimeout(uhr);
  }, [bereit, anleitung, fenster, gespraech, fahrt, besucht, station.id, szene.gastgeber.id, sprichMit]);

  // Pico gibt passende Hinweise.
  useEffect(() => {
    if (nahFigur && !gesprochen.includes(nahFigur.id)) setHinweis(`Da ist ${aussehenVon(nahFigur.id).name}. Sag Hallo!`);
    else if (amEingang) setHinweis(`Hier ist der Eingang. Geh hinein!`);
  }, [nahFigur, amEingang, gesprochen]);

  useEffect(() => {
    const zu = setTimeout(() => setPicoStand({ text: hinweis, offen: false, ungelesen: true }), 6000);
    return () => clearTimeout(zu);
  }, [hinweis]);
  const picoAktuell = picoStand.text === hinweis;
  const picoOffen = picoAktuell ? picoStand.offen : true;

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
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    await rahmen.current?.requestFullscreen?.().catch(() => {});
  }

  // Kamera: Auf schmalen Bildschirmen folgt sie der Figur, auf breiten zeigt sie den ganzen Platz.
  const sichtB = Math.min(SZENE_BREITE, SZENE_HOEHE * verhaeltnis);
  const sichtH = Math.min(SZENE_HOEHE, sichtB / verhaeltnis);
  const kameraX = Math.max(0, Math.min(SZENE_BREITE - sichtB, position.x - sichtB / 2));
  const kameraY = SZENE_HOEHE - sichtH;

  /* ---------- Gespräche ---------- */

  const gespraechDaten = gespraech ? gespraechVon(gespraech.id) : undefined;
  const zeilen = !gespraech ? [] : gespraech.geschichte ? (ORT_GESCHICHTE[station.id]?.[klein ? "klein" : "gross"] ?? []) : (gespraechDaten?.[klein ? "klein" : "gross"] ?? []);
  const frage = gespraechDaten?.frage;
  const gewaehlt = gespraech?.antwort != null ? frage?.antworten[gespraech.antwort] : undefined;
  const gespraechText = !gespraech ? "" : gewaehlt ? gewaehlt.rueckmeldung : gespraech.zeile < zeilen.length ? zeilen[gespraech.zeile]! : (frage?.text ?? "");
  const { kann: kannVorlesen, sprich, stopp: stoppVorlesen } = vorlesen;

  useEffect(() => {
    if (gespraechText && !tonAus && kannVorlesen) sprich(gespraechText);
  }, [gespraechText, tonAus, kannVorlesen, sprich]);

  function gespraechEnde() {
    if (!gespraech) return;
    if (gewaehlt?.richtig && !gesprochen.includes(gespraech.id)) {
      const neu = [...gesprochen, gespraech.id];
      setGesprochen(neu);
      schreibe("sitzung", SPEICHER.gespraeche, neu);
      klang.stern();
    }
    if (gespraech.geschichte && !besucht.includes(station.id)) {
      const neu = [...besucht, station.id];
      setBesucht(neu);
      schreibe("sitzung", SPEICHER.besucht, neu);
      setHinweis("Geh zum Eingang. Drinnen warten drei Aufgaben!");
    }
    stoppVorlesen();
    setGespraech(null);
  }

  /* ---------- Stadtbahn ---------- */

  function fahreNach(id: string) {
    setFenster(undefined);
    if (id === station.id) return;
    stoppen();
    setFahrt(id);
    klang.klick();
    const ziel = szeneVon(id);
    const ansage = `Nächster Halt: ${ziel.station.name}.`;
    if (!tonAus && vorlesen.kann) vorlesen.sprich(ansage);
    window.setTimeout(() => {
      setOrtId(id);
      schreibe("sitzung", SPEICHER.ort, id);
      pos.current = ziel.start;
      setPosition(ziel.start);
      blickRef.current = "vorne";
      setBlick("vorne");
      setFahrt(null);
      setHinweis(`Willkommen: ${ziel.station.name}!`);
    }, 2600);
  }

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

  function einpacken(id: string) {
    if (!merk.ids.includes(id)) klang.einpacken();
    merk.merken(id);
  }

  function raketeStarten() {
    stoppen();
    setRakete("startet");
    setFenster("finale");
    klang.countdown();
    window.setTimeout(() => klang.start(), 2400);
    window.setTimeout(() => klang.jubel(), 3600);
  }

  function neuAnfangen() {
    for (const k of Object.values(SPEICHER)) loesche("sitzung", k);
    merk.leeren();
    stoppen();
    setStand(neuerSpielstand());
    setAvatar(STANDARD_AVATAR);
    setGesprochen([]);
    setBesucht([]);
    setGespraech(null);
    setRakete("bereit");
    setOrtId(SZENEN[0]!.station.id);
    pos.current = SZENEN[0]!.start;
    setPosition(SZENEN[0]!.start);
    setStartSchritt("alter");
    setFenster(undefined);
    setBereit(false);
  }

  function tonUmschalten() {
    const neu = !tonAus;
    setTonAus(neu);
    setzeKlangAus(neu);
    if (neu) stoppVorlesen();
    else klang.klick();
  }

  function steuerDruck(taste: string, an: boolean) {
    if (an) {
      zielRef.current = null;
      zielAktion.current = null;
      setZiel(undefined);
      tasten.current.add(taste);
    } else tasten.current.delete(taste);
  }

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

  // Figuren nach Tiefe sortieren: Wer weiter vorne steht, verdeckt die anderen.
  const personen = [
    ...figuren.map((f) => ({ key: f.id, punkt: { x: f.x, y: f.y }, aussehen: aussehenVon(f.id).aussehen, name: aussehenVon(f.id).name, blick: (position.x < f.x - 30 ? "links" : position.x > f.x + 30 ? "rechts" : "vorne") as FigurBlick, laeuft: false, spricht: gespraech?.id === f.id })),
    { key: "ich", punkt: position, aussehen: avatar as AvatarKonfiguration | "roboter", name: "Du", blick, laeuft, spricht: false },
  ].sort((a, b) => a.punkt.y - b.punkt.y);

  return (
    <AvatarKontext.Provider value={avatar}>
      <main id="inhalt" className={`spielwelt abenteuer ${vollbild ? "ist-vollbild" : ""}`}>
        <section className="spielwelt-kopf">
          <div>
            <p className="spiel-kennung">Heilbronn-Abenteuer · 6 bis 11 Jahre</p>
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
          <div ref={rahmen} className="spielwelt-rahmen abenteuer-rahmen" aria-describedby="spiel-erklaerung">
            <svg
              ref={svg}
              className="szene-svg"
              viewBox={`${kameraX.toFixed(1)} ${kameraY.toFixed(1)} ${sichtB.toFixed(1)} ${sichtH.toFixed(1)}`}
              preserveAspectRatio="xMidYMid slice"
              onPointerDown={antippen}
              role="img"
              aria-label={`${station.name} in Heilbronn. Du stehst auf dem Platz vor dem Gebäude.`}
            >
              <AnimatePresence mode="wait">
                <motion.image key={szene.bild} href={szene.bild} width={SZENE_BREITE} height={SZENE_HOEHE} preserveAspectRatio="xMidYMid slice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
              </AnimatePresence>
              <g className="eingang-marke" transform={`translate(${szene.tuer.x} ${szene.boden.hinten - 160})`} pointerEvents="none">
                <g className={amEingang ? "eingang-pfeil ist-nah" : "eingang-pfeil"}>
                  <rect x="-62" y="-30" width="124" height="34" rx="17" fill="#fffaf0" stroke="#254950" strokeWidth="3" />
                  <text y="-7" textAnchor="middle" fontSize="18" fontWeight="800" fill="#254950">Eingang</text>
                  <path d="M-14 16h28L0 34Z" fill="#2f4bff" stroke="#fffaf0" strokeWidth="3" />
                </g>
              </g>
              {ziel && (
                <g transform={`translate(${ziel.x} ${ziel.y})`} pointerEvents="none">
                  <ellipse rx="30" ry="11" fill="none" stroke="#2f4bff" strokeWidth="4" className="ziel-marke" />
                </g>
              )}
              {personen.map((p) => (
                <g key={p.key} data-person={p.key} data-spielfigur={p.key === "ich" ? "" : undefined}>
                  <SzenenPerson aussehen={p.aussehen} punkt={p.punkt} blick={p.blick} laeuft={p.laeuft} spricht={p.spricht} name={p.name} />
                  {p.key !== "ich" && !p.spricht && (
                    <g transform={`translate(${p.punkt.x} ${p.punkt.y - figurHoehe(p.punkt.y) - 18})`} className={nahFigur?.id === p.key ? "bewohner-blase ist-nah" : "bewohner-blase"} pointerEvents="none">
                      <g>
                        <path d="M-26 -18h52a9 9 0 0 1 9 9v16a9 9 0 0 1-9 9H7l-7 10-7-10h-19a9 9 0 0 1-9-9v-16a9 9 0 0 1 9-9Z" fill={gesprochen.includes(p.key) ? "#e7f3e9" : "#fffaf0"} stroke="#254950" strokeWidth="3" />
                        {gesprochen.includes(p.key) ? (
                          <path d="m-9 -1 7 7 12-13" fill="none" stroke="#2f7a4a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <g fill="#254950"><circle cx="-12" cy="-1" r="4" /><circle cx="0" cy="-1" r="4" /><circle cx="12" cy="-1" r="4" /></g>
                        )}
                      </g>
                    </g>
                  )}
                </g>
              ))}
            </svg>

            <div className="ort-chip">
              <PixelBild motiv={station.grafik} />
              <span><strong>{station.name}</strong> Heilbronn</span>
            </div>

            <div className="hud-oben">
              <button className="hud-figur" onClick={() => { stoppen(); setGespraech(null); setStartSchritt("figur"); setBereit(false); }} aria-label="Meine Figur ändern">
                <Avatar wert={avatar} className="hud-portrait" mini label="" />
                <span className="hud-sterne" aria-label={`${erfolge.length} von 12 Sternen`}>
                  <Symbol name="star" />
                  {erfolge.length}
                </span>
              </button>
              <ol className="hud-teile" aria-label={`Raketenteile: ${teile.length} von ${STATIONEN.length}`}>
                {STATIONEN.map((s) => (
                  <li key={s.id} className={teile.includes(s.teil) ? "hat-teil" : ""} title={`${s.teil} aus ${s.name}`} style={{ ["--teil-farbe" as string]: s.farbe }}>
                    <svg viewBox="-16 -16 32 32" aria-hidden="true"><ThemenSymbol thema={s.aufgabe} groesse={22} /></svg>
                  </li>
                ))}
                <li className={`hud-rakete ${alleTeile ? "hat-teil" : ""}`}>
                  <Symbol name="rocket" />
                </li>
              </ol>
              <div className="hud-knoepfe">
                <button className="rund-knopf" onClick={() => { stoppen(); setAnleitung(true); }} aria-label="So geht's"><Symbol name="info" /></button>
                <button className="rund-knopf" onClick={tonUmschalten} aria-label={tonAus ? "Ton an" : "Ton aus"} aria-pressed={!tonAus}><Symbol name={tonAus ? "mute" : "volume"} /></button>
                <button className="rund-knopf bahn-knopf" onClick={() => { stoppen(); setFenster("bahn"); }} aria-label="Mit der Stadtbahn fahren"><Symbol name="train" /></button>
                <button className="rund-knopf" onClick={vollbildUmschalten} aria-label={vollbild ? "Vollbild verlassen" : "Vollbild"} aria-pressed={vollbild}><Symbol name={vollbild ? "shrink" : "expand"} /></button>
              </div>
            </div>

            <p className="sr-only" role="status">{hinweis}</p>
            {bereit && !gespraech && !fahrt && (
              <div className="pico-funk">
                <AnimatePresence mode="wait">
                  {picoOffen && (
                    <motion.div key={hinweis} className="pico-blase" initial={{ opacity: 0, scale: 0.5, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.5, x: 30 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} style={{ originX: 1, originY: 1 }}>
                      <span>{hinweis}</span>
                      {vorlesen.kann && (
                        <button className="rund-knopf rund-klein" onClick={() => vorlesen.sprich(hinweis)} aria-label="Vorlesen"><Symbol name="volume" /></button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button className="pico-knopf" onClick={() => setPicoStand({ text: hinweis, offen: !picoOffen, ungelesen: false })} aria-label={picoOffen ? "Pico-Nachricht einklappen" : "Pico-Nachricht zeigen"} aria-expanded={picoOffen}>
                  <PixelBild motiv="roboter" />
                  {picoAktuell && picoStand.ungelesen && !picoOffen && <span className="pico-punkt" aria-hidden="true" />}
                </button>
              </div>
            )}

            <div className="steuerkreuz" role="group" aria-label="Figur bewegen">
              {([["ArrowUp", "oben", 270, "Nach hinten"], ["ArrowLeft", "links", 180, "Nach links"], ["ArrowRight", "rechts", 0, "Nach rechts"], ["ArrowDown", "unten", 90, "Nach vorne"]] as const).map(([taste, klasse, drehung, text]) => (
                <button
                  key={taste}
                  className={`steuer-${klasse}`}
                  aria-label={text}
                  onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); steuerDruck(taste, true); }}
                  onPointerUp={() => steuerDruck(taste, false)}
                  onPointerCancel={() => steuerDruck(taste, false)}
                  onLostPointerCapture={() => steuerDruck(taste, false)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const d = TASTEN[taste]!; geheZu({ x: pos.current.x + d.x * 160, y: pos.current.y + d.y * 60 }, null); } }}
                >
                  <Symbol name="arrow" style={{ transform: `rotate(${drehung}deg)` }} />
                </button>
              ))}
            </div>

            <AnimatePresence>
              {bereit && !fenster && !gespraech && !fahrt && (nahFigur || amEingang || alleTeile) && (
                <motion.div key="aktionen" className="aktion-leiste" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
                  {nahFigur && (
                    <button className="aktion-knopf aktion-reden" onClick={() => sprichMit(nahFigur.id)}>
                      <Symbol name="story" /> Mit {aussehenVon(nahFigur.id).name} sprechen
                    </button>
                  )}
                  {amEingang && (
                    <button className="aktion-knopf" onClick={oeffneAufgaben}>
                      <Symbol name="home" /> Hineingehen
                    </button>
                  )}
                  {alleTeile && rakete !== "startet" && (
                    <button className="aktion-knopf aktion-rakete" onClick={raketeStarten}>
                      <Symbol name="rocket" /> {rakete === "weg" ? "Nochmal fliegen" : "Rakete starten!"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {imGespraech && gespraech && (
                <motion.section key="gespraech" className="gespraech" aria-labelledby="gespraech-name" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} onKeyDown={(e) => { if (e.key === "Escape") gespraechEnde(); }}>
                  {imGespraech.aussehen === "roboter" ? (
                    <svg className="gespraech-portrait" viewBox="0 0 120 140" aria-hidden="true"><Roboter /></svg>
                  ) : (
                    <Avatar wert={imGespraech.aussehen} className="gespraech-portrait" mini spricht label={imGespraech.name} />
                  )}
                  <div className="gespraech-inhalt">
                    <h2 id="gespraech-name">{imGespraech.name}</h2>
                    <p className="gespraech-text" aria-live="polite">{gespraechText}</p>
                    <div className="gespraech-knoepfe">
                      {gewaehlt ? (
                        gewaehlt.richtig ? (
                          <button className="spiel-knopf spiel-knopf-dunkel" onClick={gespraechEnde} autoFocus><Symbol name="check" /> {gespraech.geschichte ? "Los geht’s!" : `Tschüss, ${imGespraech.name}!`}</button>
                        ) : (
                          <button className="spiel-knopf spiel-knopf-dunkel" onClick={() => setGespraech({ ...gespraech, antwort: null })} autoFocus><Symbol name="refresh" /> Nochmal überlegen</button>
                        )
                      ) : gespraech.zeile < zeilen.length ? (
                        <button className="spiel-knopf spiel-knopf-dunkel" onClick={() => { klang.klick(); setGespraech({ ...gespraech, zeile: gespraech.zeile + 1 }); }} autoFocus><Symbol name="arrow" /> Weiter</button>
                      ) : (
                        frage?.antworten.map((a, i) => (
                          <button key={a.text} className="spiel-knopf" onClick={() => { if (a.richtig) klang.richtig(); else klang.falsch(); setGespraech({ ...gespraech, antwort: i }); }} autoFocus={i === 0}>{a.text}</button>
                        ))
                      )}
                      {kannVorlesen && (
                        <button className="rund-knopf rund-klein" onClick={() => sprich(gespraechText)} aria-label="Nochmal vorlesen"><Symbol name="volume" /></button>
                      )}
                    </div>
                  </div>
                  <button className="rund-knopf gespraech-zu" onClick={gespraechEnde} aria-label="Gespräch beenden"><Symbol name="close" /></button>
                </motion.section>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {fahrt && (
                <motion.div key="fahrt" className="bahn-fahrt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="bahn-fahrt-landschaft" aria-hidden="true">
                    <motion.svg viewBox="0 0 400 120" className="bahn-zug" initial={{ x: "-110%" }} animate={{ x: "110%" }} transition={{ duration: 2.4, ease: "easeInOut" }}>
                      <rect x="10" y="30" width="380" height="64" rx="22" fill="#f4c430" stroke="#5a4a1c" strokeWidth="4" />
                      <rect x="10" y="66" width="380" height="12" fill="#d64a3a" />
                      {[40, 110, 180, 250, 320].map((x) => <rect key={x} x={x} y="40" width="50" height="22" rx="6" fill="#cfeaf0" />)}
                      <circle cx="80" cy="100" r="11" fill="#2a2a33" />
                      <circle cx="320" cy="100" r="11" fill="#2a2a33" />
                      <path d="M190 30l-20-22h60l-20 22" stroke="#5a4a1c" strokeWidth="4" fill="none" />
                    </motion.svg>
                  </div>
                  <p className="bahn-ansage" role="status">
                    <Symbol name="train" /> Nächster Halt: <strong>{szeneVon(fahrt).station.name}</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

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
                    schreibe("sitzung", SPEICHER.avatar, avatar);
                    loesche("sitzung", SPEICHER.alteFigur);
                    setBereit(true);
                    klang.klick();
                    if (!lies<boolean>("sitzung", SPEICHER.anleitung, false)) setAnleitung(true);
                  }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {bereit && anleitung && (
                <Anleitung weiter={() => { schreibe("sitzung", SPEICHER.anleitung, true); setAnleitung(false); klang.klick(); }} />
              )}
            </AnimatePresence>
          </div>
          <p id="spiel-erklaerung" className="spiel-erklaerung">
            <Symbol name="info" /> Tippe auf den Platz, um zu laufen – oder nutze die Pfeile. Tippe auf Leute, um mit ihnen zu sprechen.
          </p>
        </div>

        <section className="haus-leiste" aria-labelledby="orte-titel">
          <h2 id="orte-titel"><Symbol name="train" /> Mit der Stadtbahn zu den Lernorten</h2>
          <div className="haus-karten">
            {SZENEN.map(({ station: s }) => {
              const geschafftAnzahl = erfolge.filter((id) => id.startsWith(`${s.id}-`)).length;
              return (
                <button key={s.id} className={`haus-karte ${s.id === station.id ? "ist-hier" : ""}`} onClick={() => fahreNach(s.id)} aria-current={s.id === station.id ? "location" : undefined} style={{ ["--haus-farbe" as string]: s.farbe }}>
                  <PixelBild motiv={s.grafik} />
                  <strong>{s.name}</strong>
                  <span className="haus-karte-ort">{s.id === station.id ? "Du bist hier" : s.kurz}</span>
                  <span className="haus-karte-sterne" aria-label={`${geschafftAnzahl} von 3 Aufgaben`}>
                    {[0, 1, 2].map((n) => <Symbol key={n} name="star" className={n < geschafftAnzahl ? "stern-an" : "stern-aus"} />)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="haus-leiste-fuss">Die Gebäude sind gemalte Ansichten echter Heilbronner Lernorte. Die Aufgaben sind ausgedachte Lernspiele, die Kurse sind echt.</p>
        </section>

        {/* ---------- Fenster ---------- */}

        <Fensterrahmen offen={fenster === "bahn"} schliessen={() => setFenster(undefined)} kennung="bahn-titel" titel="Wohin fährst du?" breit kopfbild={<Symbol name="train" className="fenster-symbol" />}>
          <StadtbahnKarte hier={station.id} erfolge={erfolge} waehle={fahreNach} />
        </Fensterrahmen>

        <Fensterrahmen offen={fenster === "aufgaben"} schliessen={() => setFenster(undefined)} kennung="haus-titel" titel={station.titel} breit kopfbild={<PixelBild motiv={station.grafik} className="fenster-kopfbild" />}>
          <div className="haus-inhalt">
            <nav className="aufgaben-reiter" aria-label="Aufgaben an diesem Ort">
              {[0, 1, 2].map((n) => {
                const fertig = erfolge.includes(`${station.id}-${n}`);
                return (
                  <button key={n} aria-current={phase === n ? "step" : undefined} className={fertig ? "ist-fertig" : ""} onClick={() => { setPhase(n); setBelohnung(null); setEingefuehrt(false); }} aria-label={`Aufgabe ${n + 1}: ${AUFGABEN_TITEL[station.id]?.[n] ?? ""}${fertig ? ", geschafft" : ""}`}>
                    {fertig ? <Symbol name="star" /> : n + 1}
                  </button>
                );
              })}
              {eingefuehrt && <button className="aufgabe-erklaerung" onClick={() => setEingefuehrt(false)}><Symbol name="info" /> Erklärfilm</button>}
            </nav>
            <div className="aufgabe-flaeche">
              {eingefuehrt ? (
                <Lernaufgabe key={`${station.id}-${stufe}-${phase}`} art={station.aufgabe} stufe={stufe} phase={phase} geschafft={geschafft} fehler={() => klang.falsch()} />
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
                    <div className="belohnung-bild" style={{ background: station.farbe }}>{belohnung === "Stern" ? <Symbol name="star" /> : <Symbol name="rocket" />}</div>
                    <strong>{belohnung === "Stern" ? "Ein Stern für dich!" : `Raketenteil: ${belohnung}!`}</strong>
                    <div className="belohnung-knoepfe">
                      {phase < 2 && (
                        <button className="spiel-knopf spiel-knopf-dunkel" onClick={() => { setPhase(phase + 1); setBelohnung(null); setEingefuehrt(false); }}><Symbol name="arrow" /> Nächste Aufgabe</button>
                      )}
                      <button className="spiel-knopf" onClick={() => { setBelohnung(null); setFenster(undefined); }}><Symbol name="map" /> Zurück nach draußen</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

            <section className="echte-kurse" aria-labelledby="kurse-titel">
              <h3 id="kurse-titel"><Symbol name="ticket" /> Echte Kurse für {stand.alter} Jahre <span className="spiel-zaehler">{passende.length}</span></h3>
              {passende.length ? (
                <>
                  <div className="sammelkarten">
                    {(alleKurse ? passende : passende.slice(0, 3)).map((a, i) => (
                      <Sammelkarte key={a.id} angebot={a} meta={meta} gesammelt={merk.ids.includes(a.id)} sammeln={einpacken} jetzt={jetzt} index={i} />
                    ))}
                  </div>
                  {passende.length > 3 && <button className="spiel-knopf" onClick={() => setAlleKurse(!alleKurse)}>{alleKurse ? "Weniger zeigen" : `Alle ${passende.length} zeigen`}</button>}
                </>
              ) : (
                <p className="leer-hinweis"><Symbol name="info" /> Gerade kein passender Kurs für {stand.alter} Jahre. Deine Eltern finden mehr über „Für Erwachsene“.</p>
              )}
            </section>
          </div>
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
            <p>Das Kind spielt ohne Konto und ohne Namen. Figur, Sterne, Gespräche und Rucksack liegen nur in dieser Browsersitzung und verschwinden beim Schließen.</p>
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
                {gesammelt.map((a, i) => <Sammelkarte key={a.id} angebot={a} meta={meta} gesammelt sammeln={einpacken} jetzt={jetzt} index={i} />)}
              </div>
              <ZeigEltern ids={gesammeltIds} />
              <button className="spiel-knopf mt-4" onClick={merk.leeren}><Symbol name="refresh" /> Rucksack leeren</button>
            </>
          ) : (
            <div className="leer-rucksack">
              <Symbol name="backpack" className="leer-symbol" />
              <p>Noch leer! Löse eine Aufgabe und pack echte Kurse ein.</p>
            </div>
          )}
        </Fensterrahmen>

        <Fensterrahmen
          offen={fenster === "finale"}
          schliessen={() => { setFenster(undefined); setRakete("weg"); schreibe("sitzung", SPEICHER.rakete, "weg"); setHinweis("Die Rakete ist im All! Pack dir echte Kurse ein."); }}
          kennung="finale-titel"
          titel="Die Rakete fliegt!"
          breit
          kopfbild={<Symbol name="rocket" className="fenster-symbol" />}
        >
          <div className="finale-himmel" aria-hidden="true">
            <motion.svg viewBox="-90 -150 180 220" className="finale-rakete" initial={{ y: 40 }} animate={{ y: [40, 40, -420] }} transition={{ duration: 3.6, times: [0, 0.55, 1], ease: "easeIn" }}>
              <Rakete teile={teile} zustand="startet" />
            </motion.svg>
            <Avatar wert={avatar} className="finale-figur winkt" mini label="" />
          </div>
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
                  <span>{s.name}</span>
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
