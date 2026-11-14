"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { brueckenMission, codeMission, energieMission, fuehreCodeAus, kiMission, materialMission, pruefeBauPlan, pruefeWahl, type BildOption, type Stufe, type WahlMission } from "@/lib/abenteuer";
import type { Figur as FigurDaten } from "@/lib/figuren";
import type { MissionArt, Richtung } from "@/lib/spiel";
import { Symbol } from "../symbol";
import { Avatar,AufgabenFigur as Figur } from "./avatar";
import { PixelBild, PixelGrafik } from "./pixel-grafik";

const DREHUNG: Record<Richtung, number> = { rechts: 0, runter: 90, links: 180, hoch: 270 };
const LINIE = "#1c1934";
const bewegungReduziert = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const warte = (ms: number) => new Promise((r) => setTimeout(r, bewegungReduziert() ? 0 : ms));

type Stimmung = "erklaert" | "froh" | "hmm";

/** Pico, der kleine Roboter, begleitet jede Aufgabe: erklärt, lobt und gibt Tipps. */
export function PicoSagt({ children, stimmung = "erklaert" }: { children: ReactNode; stimmung?: Stimmung }) {
  return (
    <div className={`pico-sagt pico-${stimmung}`}>
      <div className="pico-figur"><Avatar/></div>
      <AnimatePresence mode="wait">
        <motion.p key={String(children)} className="pico-text" role="status" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
          {children}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/** Bilder für die Auswahl-Aufgaben: klare Formen mit Kontur, damit jedes Ding sofort erkennbar ist. */
export function AufgabenBild({ option }: { option: BildOption }) {
  const f = option.farbe ?? "#ed805c";
  const inhalt = (() => {
    switch (option.motiv) {
      case "ball":
        return (
          <>
            <ellipse cx="50" cy="78" rx="24" ry="4" fill="#000" opacity="0.12" />
            <circle cx="50" cy="42" r="31" fill={f} stroke={LINIE} strokeWidth="3.5" />
            <path d="M50 11v62M19 42h62M27 20q14 22 0 44M73 20q-14 22 0 44" fill="none" stroke={LINIE} strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="38" cy="27" rx="7" ry="4" fill="#fff" opacity="0.45" transform="rotate(-30 38 27)" />
          </>
        );
      case "rad":
        return (
          <>
            <circle cx="50" cy="42" r="31" fill="none" stroke={LINIE} strokeWidth="8" />
            <circle cx="50" cy="42" r="26" fill={option.farbe ?? "#fffbee"} stroke="#8fa3ab" strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150].map((r) => (
              <path key={r} d="M24 42h52" transform={`rotate(${r} 50 42)`} stroke="#5f7178" strokeWidth="1.6" />
            ))}
            <circle cx="50" cy="42" r="5" fill="#5f7178" stroke={LINIE} strokeWidth="2" />
          </>
        );
      case "block":
        return (
          <>
            <ellipse cx="50" cy="76" rx="32" ry="4" fill="#000" opacity="0.12" />
            {[30, 55].map((x) => (
              <g key={x}>
                <rect x={x} y="16" width="15" height="10" rx="3" fill={f} stroke={LINIE} strokeWidth="3" />
                <rect x={x + 3} y="18" width="5" height="3" rx="1" fill="#fff" opacity="0.4" />
              </g>
            ))}
            <rect x="18" y="24" width="64" height="48" rx="5" fill={f} stroke={LINIE} strokeWidth="3.5" />
            <rect x="22" y="28" width="56" height="7" rx="2" fill="#fff" opacity="0.25" />
            <rect x="18" y="62" width="64" height="10" rx="3" fill="#000" opacity="0.12" />
          </>
        );
      case "fenster":
        return (
          <>
            <rect x="20" y="12" width="60" height="56" rx="4" fill={option.farbe ?? "#9fd3e0"} stroke={LINIE} strokeWidth="3.5" />
            <path d="M50 12v56M20 40h60" stroke={LINIE} strokeWidth="4" />
            <path d="M27 20l8-6M27 30l16-12M56 48l8-6" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
            <rect x="14" y="68" width="72" height="7" rx="2" fill="#c9a476" stroke={LINIE} strokeWidth="3" />
          </>
        );
      case "frage":
        return (
          <>
            <rect x="20" y="10" width="60" height="62" rx="10" fill="#aaa0db" stroke={LINIE} strokeWidth="3.5" />
            <text x="50" y="57" textAnchor="middle" fontSize="44" fontWeight="800" fill={LINIE}>?</text>
          </>
        );
      case "gruppe":
        return (
          <>
            {([[28, 44, 16, "#ed805c"], [64, 28, 12, "#7bbfc4"], [66, 60, 15, "#ecc06b"], [42, 18, 8, "#8a5cd8"]] as const).map(([x, y, r, c], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill={c} stroke={LINIE} strokeWidth="3" />
                <path d={`M${x} ${y - r}v${2 * r}M${x - r} ${y}h${2 * r}`} stroke={LINIE} strokeWidth="2" />
              </g>
            ))}
          </>
        );
      case "sonne":
        // Sonne über einer Solarzelle – passt zu „Sonnenlicht“ und „heller Platz“.
        return (
          <>
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d="M38 2v9" transform={`rotate(${i * 45} 38 30)`} stroke="#e0a42e" strokeWidth="5" strokeLinecap="round" />
            ))}
            <circle cx="38" cy="30" r="16" fill="#f6c94c" stroke={LINIE} strokeWidth="3.5" />
            <path d="M32 33q6 5 12 0" fill="none" stroke={LINIE} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 64 58 46h32l-10 18Z" fill="#2f5f9e" stroke={LINIE} strokeWidth="3" strokeLinejoin="round" />
            <path d="M68 46l-10 18M79 46l-10 18M53 55h32" stroke="#9cc4ee" strokeWidth="1.6" />
            <path d="M68 64v12M60 76h16" stroke={LINIE} strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case "mond":
        return (
          <>
            <rect x="10" y="6" width="80" height="72" rx="10" fill="#254950" stroke={LINIE} strokeWidth="3" />
            <path d="M62 16a26 26 0 1 0 12 46A28 28 0 0 1 62 16Z" fill="#fff2c7" stroke={LINIE} strokeWidth="2.5" />
            {[[24, 22], [32, 58], [80, 24]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="#fff2c7" />)}
          </>
        );
      case "holz":
        // Ein Stück Baumstamm: Rinde, ein Aststummel mit Blatt und die Schnittfläche mit Jahresringen.
        return (
          <>
            <ellipse cx="48" cy="76" rx="38" ry="4.5" fill="#000" opacity="0.12" />
            <path d="M36 27 31 14l9 3 3 10" fill="#7a4a26" stroke={LINIE} strokeWidth="3" strokeLinejoin="round" />
            <path d="M31 15q-10-6-6-14 8 4 6 14Z" fill="#7bc46b" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M18 26h50a16 22 0 0 1 0 44H18a14 22 0 0 1 0-44Z" fill="#8a5a32" stroke={LINIE} strokeWidth="3.5" />
            <path d="M10 38q14-3 26 1t26-2M8 52q16 3 30-1t24 2M16 62q12-2 22 0" fill="none" stroke="#5e3a1d" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="68" cy="48" rx="16" ry="22" fill="#eac08a" stroke={LINIE} strokeWidth="3.5" />
            <ellipse cx="68" cy="48" rx="11" ry="15.5" fill="none" stroke="#c48d55" strokeWidth="2" />
            <ellipse cx="68" cy="48" rx="6" ry="9" fill="none" stroke="#c48d55" strokeWidth="2" />
            <circle cx="68" cy="48" r="2.2" fill="#9c6634" />
            <path d="M62 34q3-2 6-2" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </>
        );
      case "kupfer":
        // Kupfer erkennt man an der rötlich-braunen Farbe: eine Spule mit Kupferdraht.
        return (
          <>
            <ellipse cx="50" cy="78" rx="34" ry="4" fill="#000" opacity="0.12" />
            <rect x="26" y="18" width="48" height="52" fill="#b87333" stroke={LINIE} strokeWidth="3.5" />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${31 + i * 5} 19l-3 50`} stroke="#8a4f24" strokeWidth="2" />
            ))}
            <rect x="27" y="27" width="46" height="6" fill="#f2b07f" opacity="0.75" />
            <rect x="27" y="56" width="46" height="8" fill="#000" opacity="0.12" />
            <ellipse cx="26" cy="44" rx="8" ry="28" fill="#6b4a2f" stroke={LINIE} strokeWidth="3.5" />
            <ellipse cx="74" cy="44" rx="8" ry="28" fill="#8b6a4c" stroke={LINIE} strokeWidth="3.5" />
            <ellipse cx="74" cy="44" rx="3" ry="8" fill="#3f2c1c" />
            <path d="M52 70q4 10 16 9t20-13" fill="none" stroke={LINIE} strokeWidth="7" strokeLinecap="round" />
            <path d="M52 70q4 10 16 9t20-13" fill="none" stroke="#c97f45" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="88" cy="66" r="3" fill="#f2b07f" stroke={LINIE} strokeWidth="2" />
          </>
        );
      case "metall":
        // Ein Schlüssel aus glänzendem Metall.
        return (
          <>
            <ellipse cx="52" cy="76" rx="36" ry="4" fill="#000" opacity="0.12" />
            <path d="M62 45v12h7V45ZM74 45v15h7V45Z" fill="#c9d3d8" stroke={LINIE} strokeWidth="3" strokeLinejoin="round" />
            <rect x="40" y="36" width="48" height="11" rx="2.5" fill="#c9d3d8" stroke={LINIE} strokeWidth="3.5" />
            <circle cx="27" cy="41" r="18" fill="#c9d3d8" stroke={LINIE} strokeWidth="3.5" />
            <circle cx="27" cy="41" r="6.5" fill="#fffbee" stroke={LINIE} strokeWidth="3" />
            <path d="M16 31q6-7 15-6" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M47 39.5h34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          </>
        );
      case "gummi": {
        // Ein Gummihandschuh, wie ihn Elektriker tragen. Erst die Kontur, dann die Füllung – so wirkt er aus einem Stück.
        const teile = (
          <>
            <rect x="35" y="10" width="11" height="32" rx="5.5" />
            <rect x="47" y="5" width="11" height="36" rx="5.5" />
            <rect x="59" y="8" width="11" height="34" rx="5.5" />
            <rect x="70" y="16" width="10" height="28" rx="5" />
            <rect x="19" y="34" width="11" height="28" rx="5.5" transform="rotate(-38 24 48)" />
            <path d="M34 30h46v26q0 10-10 10H44q-10 0-10-10Z" />
            <rect x="38" y="62" width="38" height="15" rx="3" />
          </>
        );
        return (
          <>
            <ellipse cx="56" cy="80" rx="26" ry="3.5" fill="#000" opacity="0.12" />
            <g fill={LINIE} stroke={LINIE} strokeWidth="6" strokeLinejoin="round">{teile}</g>
            <g fill="#f08a24">{teile}</g>
            <rect x="38" y="62" width="38" height="15" rx="3" fill="#d46c10" />
            <path d="M45 64v11M52 64v11M59 64v11M66 64v11" stroke="#a9520a" strokeWidth="2" />
            <path d="M40 36q1-10-1-20M52 33q1-12 0-22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
          </>
        );
      }
      case "rotebaelle":
        return (
          <>
            <ellipse cx="50" cy="76" rx="38" ry="4" fill="#000" opacity="0.12" />
            {([[26, 54], [50, 32], [74, 54]] as const).map(([x, y]) => (
              <g key={x}>
                <circle cx={x} cy={y} r="17" fill={f} stroke={LINIE} strokeWidth="3" />
                <path d={`M${x} ${y - 17}v34M${x - 17} ${y}h34`} stroke={LINIE} strokeWidth="2.2" />
                <ellipse cx={x - 6} cy={y - 8} rx="4" ry="2.5" fill="#fff" opacity="0.5" />
              </g>
            ))}
          </>
        );
      case "foto":
        // Ein Klassenfoto mit Namensschildern – genau das gehört nicht ins Netz.
        return (
          <>
            <rect x="12" y="6" width="76" height="72" rx="4" fill="#fffdf6" stroke={LINIE} strokeWidth="3.5" />
            <rect x="18" y="12" width="64" height="44" fill="#bfe3ea" stroke={LINIE} strokeWidth="2.5" />
            {([[32, "#ed805c", "#5b3a29"], [50, "#7bbfc4", "#e0b25a"], [68, "#aaa0db", "#2f2a26"]] as const).map(([x, shirt, haare]) => (
              <g key={x}>
                <path d={`M${x - 10} 56q0-14 10-14t10 14Z`} fill={shirt} stroke={LINIE} strokeWidth="2.5" />
                <circle cx={x} cy="33" r="8" fill="#f2c6a0" stroke={LINIE} strokeWidth="2.5" />
                <path d={`M${x - 8} 31q0-8 8-8t8 8q-4-3-8-3t-8 3Z`} fill={haare} />
              </g>
            ))}
            {[22, 42, 62].map((x) => (
              <g key={x}>
                <rect x={x} y="62" width="16" height="9" rx="2" fill="#f6c94c" stroke={LINIE} strokeWidth="2" />
                <path d={`M${x + 3} 66.5h10`} stroke={LINIE} strokeWidth="2" />
              </g>
            ))}
          </>
        );
      case "adresse":
        return (
          <>
            <rect x="8" y="16" width="84" height="56" rx="5" fill="#fff7df" stroke={LINIE} strokeWidth="3.5" />
            <rect x="70" y="22" width="16" height="18" rx="1" fill="#ed805c" stroke="#fff" strokeWidth="2" strokeDasharray="3 2" />
            <path d="M74 34l4-4 4 4v3h-8Z" fill="#fff" />
            <path d="M16 50l11-10 11 10v15H16Z" fill="#7bbfc4" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="24" y="55" width="6" height="10" fill="#fff7df" stroke={LINIE} strokeWidth="2" />
            <path d="M46 48h34M46 56h28M46 64h20" stroke={LINIE} strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case "muster":
        // Ein selbst gemaltes Muster mit Stift – ganz ohne Personendaten.
        return (
          <>
            <rect x="12" y="8" width="62" height="68" rx="3" fill="#fffdf6" stroke={LINIE} strokeWidth="3.5" transform="rotate(-4 43 42)" />
            {[0, 1, 2].flatMap((r) =>
              [0, 1, 2].map((c) => {
                const x = 24 + c * 18;
                const y = 22 + r * 20;
                const art = (r + c) % 3;
                return art === 0 ? (
                  <circle key={`${r}${c}`} cx={x} cy={y} r="6" fill="#ed805c" stroke={LINIE} strokeWidth="2" />
                ) : art === 1 ? (
                  <path key={`${r}${c}`} d={`M${x} ${y - 7}l7 12h-14Z`} fill="#7bbfc4" stroke={LINIE} strokeWidth="2" strokeLinejoin="round" />
                ) : (
                  <rect key={`${r}${c}`} x={x - 6} y={y - 6} width="12" height="12" rx="2" fill="#f6c94c" stroke={LINIE} strokeWidth="2" />
                );
              }),
            )}
            <g transform="rotate(35 80 52)">
              <rect x="74" y="20" width="11" height="44" rx="2" fill="#f2c94c" stroke={LINIE} strokeWidth="2.5" />
              <path d="M74 64h11l-5.5 11Z" fill="#eac08a" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M77.5 71h4l-2 4Z" fill={LINIE} />
              <rect x="74" y="16" width="11" height="6" rx="2" fill="#ed805c" stroke={LINIE} strokeWidth="2.5" />
            </g>
          </>
        );
      case "wuerfel":
        return (
          <>
            <ellipse cx="50" cy="78" rx="30" ry="4" fill="#000" opacity="0.12" />
            <g transform="rotate(-12 50 42)">
              <rect x="22" y="14" width="56" height="56" rx="12" fill="#fffdf6" stroke={LINIE} strokeWidth="3.5" />
              {([[36, 28], [64, 28], [50, 42], [36, 56], [64, 56]] as const).map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill={LINIE} />)}
            </g>
            <text x="86" y="22" textAnchor="middle" fontSize="20" fontWeight="900" fill="#aaa0db" stroke={LINIE} strokeWidth="1">?</text>
          </>
        );
      case "akku":
        return (
          <>
            <ellipse cx="50" cy="76" rx="34" ry="4" fill="#000" opacity="0.12" />
            <rect x="74" y="32" width="9" height="20" rx="2" fill="#8fa3ab" stroke={LINIE} strokeWidth="3" />
            <rect x="14" y="20" width="62" height="44" rx="8" fill="#2f3a40" stroke={LINIE} strokeWidth="3.5" />
            {[0, 1, 2].map((i) => <rect key={i} x={21 + i * 17} y="27" width="13" height="30" rx="2.5" fill="#5dbb63" />)}
            <path d="M47 23 37 44h9l-4 17 13-23h-9l5-15Z" fill="#fff" stroke={LINIE} strokeWidth="2" strokeLinejoin="round" />
          </>
        );
      case "schalter":
        return (
          <>
            <rect x="26" y="10" width="48" height="66" rx="9" fill="#fffdf6" stroke={LINIE} strokeWidth="3.5" />
            <rect x="38" y="22" width="24" height="42" rx="5" fill="#e7e1d2" stroke={LINIE} strokeWidth="3" />
            <path d="M38 43h24" stroke={LINIE} strokeWidth="2" />
            <rect x="41" y="25" width="18" height="16" rx="3" fill="#fff" />
            <circle cx="50" cy="56" r="2.5" fill="#8fa3ab" />
          </>
        );
      case "decke":
        // Eine Decke liegt über der Solarzelle: kein Licht, kein Strom.
        return (
          <>
            <rect x="12" y="44" width="76" height="28" rx="2" fill="#2f5f9e" stroke={LINIE} strokeWidth="3" />
            <path d="M31 44v28M50 44v28M69 44v28M12 58h76" stroke="#9cc4ee" strokeWidth="1.8" />
            <path d="M8 22q22-12 42-4t42-2l-2 40q-10 8-20 2t-20 2-22-2-18 2Z" fill="#ed805c" stroke={LINIE} strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M14 30q20-8 38-2t36-2M12 44q22-6 40 0t36-2" fill="none" stroke="#fff3df" strokeWidth="4" opacity="0.8" />
          </>
        );
      default:
        return <rect x="20" y="16" width="60" height="54" rx="6" fill={f} stroke={LINIE} strokeWidth="3.5" />;
    }
  })();
  return (
    <svg viewBox="0 0 100 85" aria-hidden="true" className="aufgaben-bild">
      {inhalt}
    </svg>
  );
}

type Rueckmeldung = { text: string; stimmung: Stimmung } | null;

function WahlAufgabe({ mission, geschafft, fehler }: { mission: WahlMission; geschafft: () => void; fehler?: () => void }) {
  const [wahl, setWahl] = useState<string[]>([]);
  const [antwort, setAntwort] = useState<Rueckmeldung>(null);
  function pruefen() {
    const ok = pruefeWahl(wahl, mission);
    setAntwort(ok ? { text: "Super, das passt!", stimmung: "froh" } : { text: mission.tipp, stimmung: "hmm" });
    if (ok) geschafft();
    else fehler?.();
  }
  return (
    <div className="lernaufgabe">
      <PicoSagt stimmung={antwort?.stimmung}>{antwort?.text ?? mission.frage}</PicoSagt>
      <div className="muster-auswahl">
        {mission.optionen.map((o) => (
          <button
            key={o.id}
            className="muster-karte"
            aria-pressed={wahl.includes(o.id)}
            onClick={() => {
              setWahl((alt) => (alt.includes(o.id) ? alt.filter((id) => id !== o.id) : mission.antworten.length === 1 ? [o.id] : [...alt, o.id]));
              setAntwort(null);
            }}
          >
            <AufgabenBild option={o} />
            <span>{o.titel}</span>
          </button>
        ))}
      </div>
      <button className="spiel-knopf spiel-knopf-dunkel" disabled={!wahl.length} onClick={pruefen}>
        <Symbol name="check" /> Ausprobieren
      </button>
      <details className="spiel-wissen">
        <summary>Erklär mir die Idee</summary>
        <p>{mission.wissen}</p>
      </details>
    </div>
  );
}

function CodeAufgabe({ stufe, phase, geschafft, fehler }: { stufe: Stufe; phase: number; geschafft: () => void; fehler?: () => void }) {
  const mission = codeMission(stufe, phase);
  const [befehle, setBefehle] = useState<Richtung[]>([]);
  const [pos, setPos] = useState(mission.start);
  const [laeuft, setLaeuft] = useState(false);
  const [antwort, setAntwort] = useState<Rueckmeldung>(null);
  const lauf = useRef(0);
  useEffect(() => () => {
    lauf.current++;
  }, []);

  async function spielen() {
    const kennung = ++lauf.current;
    const ergebnis = fuehreCodeAus(befehle, mission);
    setLaeuft(true);
    setAntwort(null);
    setPos(mission.start);
    for (const p of ergebnis.weg) {
      await warte(200);
      if (kennung !== lauf.current) return;
      setPos(p);
    }
    if (ergebnis.ok) {
      setLaeuft(false);
      setAntwort({ text: "Angekommen! Dein Programm funktioniert.", stimmung: "froh" });
      geschafft();
      return;
    }
    // Falsch: kurz zeigen, wo der Roboter hängen blieb – dann alles zurück auf Anfang, Pfeile weg.
    setAntwort({ text: ergebnis.grund, stimmung: "hmm" });
    fehler?.();
    await warte(1100);
    if (kennung !== lauf.current) return;
    setBefehle([]);
    setPos(mission.start);
    setLaeuft(false);
    setAntwort({ text: `${ergebnis.grund} Wir fangen von vorn an!`, stimmung: "hmm" });
  }

  return (
    <div className="lernaufgabe">
      <PicoSagt stimmung={antwort?.stimmung}>{antwort?.text ?? (phase === 0 ? "Programmiere mich zur Fahne!" : "Hol erst die gelben Pakete. Dann zur Fahne!")}</PicoSagt>
      <svg viewBox={`0 0 ${mission.breite * 60 + 10} ${mission.hoehe * 60 + 10}`} className="code-spielfeld" role="img" aria-label={`Roboter: Spalte ${pos.x + 1}, Reihe ${pos.y + 1}. Raster ${mission.breite} mal ${mission.hoehe}. Start unten links, Ziel oben rechts. ${mission.stopps.length} Pakete.`}>
        {Array.from({ length: mission.breite * mission.hoehe }, (_, i) => {
          const x = i % mission.breite;
          const y = Math.floor(i / mission.breite);
          const mauer = mission.mauern.some((p) => p.x === x && p.y === y);
          return (
            <g key={i} transform={`translate(${5 + x * 60} ${5 + y * 60})`}>
              <rect width="54" height="54" rx="6" fill={mauer ? "#94aaa0" : "#fffbee"} stroke="#bdd0b5" strokeWidth="2" />
              {mauer && <path d="M4 18h46M4 36h46M22 3v15m15 0v18M22 36v14" fill="none" stroke="#6d8780" strokeWidth="2" />}
            </g>
          );
        })}
        {mission.stopps.map((p, i) => (
          <g key={i} transform={`translate(${18 + p.x * 60} ${18 + p.y * 60})`}>
            <rect width="30" height="28" rx="3" fill="#edbf5c" stroke={LINIE} strokeWidth="2.5" />
            <path d="M15 0v28M0 10h30" stroke="#b07a2e" strokeWidth="3" />
          </g>
        ))}
        <g transform={`translate(${24 + mission.ziel.x * 60} ${12 + mission.ziel.y * 60})`}>
          <rect x="0" y="0" width="4" height="40" fill={LINIE} />
          <path d="M4 2h22l-6 8 6 8H4Z" fill="#ed805c" stroke={LINIE} strokeWidth="2" />
        </g>
        <motion.g animate={{ x: 17 + pos.x * 60, y: 9 + pos.y * 60 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
          <PixelGrafik motiv="roboter" x={0} y={0} breite={28} hoehe={46} />
        </motion.g>
      </svg>
      <div className="befehlsleiste" aria-label="Befehle hinzufügen">
        {(["hoch", "rechts", "runter", "links"] as Richtung[]).map((r) => (
          <button key={r} className="spiel-knopf" disabled={laeuft || befehle.length >= 40} onClick={() => setBefehle((alt) => (alt.length >= 40 ? alt : [...alt, r]))} aria-label={`Schritt ${r}`}>
            <Symbol name="arrow" style={{ transform: `rotate(${DREHUNG[r]}deg)` }} />
          </button>
        ))}
      </div>
      <div className="programm" aria-label="Dein Programm">
        {befehle.length
          ? befehle.map((b, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} title={`${i + 1}. ${b}`}>
                <Symbol name="arrow" style={{ transform: `rotate(${DREHUNG[b]}deg)` }} />
                <span className="sr-only">{b}</span>
              </motion.span>
            ))
          : "Tippe Pfeile – so entsteht dein Weg."}
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="spiel-knopf spiel-knopf-dunkel" disabled={laeuft || !befehle.length} onClick={spielen}>
          <Symbol name="play" /> Start
        </button>
        <button className="spiel-knopf" disabled={laeuft || !befehle.length} onClick={() => setBefehle((alt) => alt.slice(0, -1))} aria-label="Letzten Schritt löschen">
          <Symbol name="arrow" style={{ transform: "rotate(180deg)" }} /> Zurück
        </button>
        <button className="spiel-knopf" disabled={laeuft} onClick={() => { setBefehle([]); setPos(mission.start); setAntwort(null); }}>
          <Symbol name="refresh" /> Neu
        </button>
        {stufe === "profi" && (
          <button className="spiel-knopf" disabled={laeuft || !befehle.length || befehle.length > 20} onClick={() => setBefehle((alt) => (alt.length > 20 ? alt : [...alt, ...alt]))}>
            Folge × 2
          </button>
        )}
      </div>
      <details className="spiel-wissen">
        <summary>Zeig mir einen Tipp</summary>
        <p>
          Die Ränder sind frei. {phase > 0 ? "Fahre zuerst links nach oben. Besuche dann alle Pakete, bevor du das Ziel ansteuerst." : "Fahre unten nach rechts und dann nach oben."} Jeder Pfeil ist genau ein Schritt.
        </p>
      </details>
    </div>
  );
}

function SchalterAufgabe({ stufe, geschafft, fehler }: { stufe: Stufe; geschafft: () => void; fehler?: () => void }) {
  const anzahl = stufe === "start" ? 1 : stufe === "weiter" ? 2 : 3;
  const profi = stufe === "profi";
  const [an, setAn] = useState<boolean[]>(Array(anzahl).fill(false));
  const [antwort, setAntwort] = useState<Rueckmeldung>(null);
  const ziel = profi ? [true, false, true] : Array(anzahl).fill(true);
  const ok = an.every((a, i) => a === ziel[i]);
  return (
    <div className="lernaufgabe">
      <PicoSagt stimmung={antwort?.stimmung}>{antwort?.text ?? (profi ? "Lampe 1 und 3 an. Lampe 2 bleibt aus." : "Schließe den Stromkreis. Lass die Lampe leuchten!")}</PicoSagt>
      <svg viewBox={`0 0 420 ${profi ? 270 : 110}`} className="strom-spielfeld" role="img" aria-label={profi ? `Drei getrennte Stromkreise. Schalter: ${an.map((x, i) => `${i + 1} ${x ? "zu" : "offen"}`).join(", ")}` : `Ein Stromkreis mit ${anzahl} Schaltern in Reihe. Lampe ${an.every(Boolean) ? "an" : "aus"}.`}>
        {Array.from({ length: profi ? 3 : 1 }, (_, reihe) => {
          const leuchtet = profi ? an[reihe] : an.every(Boolean);
          return (
            <g key={reihe} transform={`translate(0 ${reihe * 85})`}>
              <path d="M45 65V25h330v40H45" fill="none" stroke="#345457" strokeWidth="5" />
              <rect x="33" y="35" width="24" height="24" rx="3" fill="#ed805c" stroke="#345457" strokeWidth="2.5" />
              <text x="45" y="53" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">+</text>
              {leuchtet && <circle cx="340" cy="25" r="30" fill="#f6d77a" opacity="0.45" />}
              <circle cx="340" cy="25" r="18" fill={leuchtet ? "#f6d77a" : "#fffbee"} stroke="#345457" strokeWidth="3" />
              <path d="M333 25q7-9 14 0" fill="none" stroke="#345457" strokeWidth="2" />
              {Array.from({ length: profi ? 1 : anzahl }, (_, i) => {
                const n = profi ? reihe : i;
                const x = 110 + i * 100;
                return (
                  <g key={i}>
                    <path d={`M${x} 25h45`} stroke="#fff9e8" strokeWidth="9" />
                    <path d={`M${x} 25l45 ${an[n] ? 0 : -18}`} stroke="#ed805c" strokeWidth="5" strokeLinecap="round" />
                    <circle cx={x} cy="25" r="4" fill="#345457" />
                    <text x={x + 22} y="56" textAnchor="middle" fontSize="16" fontWeight="800">{n + 1}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3">
        {an.map((a, i) => (
          <button className="spiel-knopf" key={i} aria-pressed={a} onClick={() => { setAn((alt) => alt.map((x, j) => (j === i ? !x : x))); setAntwort(null); }}>
            <Symbol name={a ? "check" : "close"} /> Schalter {i + 1}
          </button>
        ))}
      </div>
      <button
        className="spiel-knopf spiel-knopf-dunkel mt-4"
        onClick={() => {
          setAntwort(ok ? { text: "Das Licht brennt. Gut getüftelt!", stimmung: "froh" } : { text: profi ? "Prüfe jede Lampe einzeln." : "Ein offener Schalter unterbricht den Kreis.", stimmung: "hmm" });
          if (ok) geschafft();
          else fehler?.();
        }}
      >
        <Symbol name="bulb" /> Licht prüfen
      </button>
      <details className="spiel-wissen">
        <summary>Erklär mir die Schaltung</summary>
        <p>{profi ? "Jede Lampe hat hier ihren eigenen Stromkreis und ihren eigenen Schalter." : "Bei einer Reihenschaltung müssen alle Schalter geschlossen sein, damit Strom fließen kann."} Das ist eine vereinfachte Batterie-Schaltung im Spiel.</p>
      </details>
    </div>
  );
}

function BauAufgabe({ stufe, phase, geschafft, fehler, figur }: { stufe: Stufe; phase: number; geschafft: () => void; fehler?: () => void; figur?: FigurDaten }) {
  const m = brueckenMission(stufe, phase);
  const [bruecken, setBruecken] = useState<number[]>([]);
  const [sprung, setSprung] = useState<number>();
  const [test, setTest] = useState("bereit");
  const [antwort, setAntwort] = useState<Rueckmeldung>(null);
  const [schritt, setSchritt] = useState(0);
  const [flug, setFlug] = useState(false);
  const lauf = useRef(0);
  useEffect(() => () => {
    lauf.current++;
  }, []);

  async function testen() {
    const kennung = ++lauf.current;
    const ergebnis = pruefeBauPlan(stufe, phase, bruecken, sprung);
    setTest("laeuft");
    setAntwort(null);
    setSchritt(0);
    for (let i = 1; i <= ergebnis.stopp; i++) {
      await warte(260);
      if (kennung !== lauf.current) return;
      setSchritt(i);
      setFlug((phase === 0 && i === 3) || (phase === 2 && i === m.sprung));
    }
    setTest(ergebnis.ok ? "gut" : "nochmal");
    setFlug(false);
    setAntwort(ergebnis.ok ? { text: "Geschafft! Dein Level funktioniert.", stimmung: "froh" } : { text: phase === 0 ? "Die Sprunghilfe gehört vor die Lücke." : "Schließe jede dunkle Lücke mit einer Brücke.", stimmung: "hmm" });
    if (ergebnis.ok) geschafft();
    else fehler?.();
  }

  const anteil = 2 + (schritt / (m.breite - 1)) * 86;
  return (
    <div className="lernaufgabe">
      <PicoSagt stimmung={antwort?.stimmung}>
        {antwort?.text ?? (phase === 0 ? "Setze die Sprunghilfe vor die Lücke!" : phase === 1 ? `Baue ${m.luecken.length} Brücke${m.luecken.length === 1 ? "" : "n"}: Tippe auf die Lücken.` : "Baue Brücken und setze die Sprunghilfe.")}
      </PicoSagt>
      <div className={`bau-welt bau-${test}`}>
        <div className="bau-himmel">
          <motion.div className="bau-figur" animate={{ left: `${anteil}%`, y: flug ? -34 : 0 }} transition={{ type: "spring", stiffness: 220, damping: 20 }}>
            <svg viewBox="-24 -100 48 104" aria-hidden="true">
              <Figur figur={figur} />
            </svg>
          </motion.div>
          <svg className="bau-ziel" viewBox="0 0 40 60" aria-label="Ziel">
            <rect x="6" y="4" width="4" height="54" fill="#345457" />
            <path d="M10 6h24l-7 9 7 9H10Z" fill="#ed805c" stroke="#345457" strokeWidth="2" />
          </svg>
        </div>
        <div className="bau-felder" style={{ gridTemplateColumns: `repeat(${m.breite},1fr)` }}>
          {Array.from({ length: m.breite }, (_, i) => {
            const luecke = phase === 0 ? i === 3 : m.luecken.includes(i);
            const gebaut = bruecken.includes(i);
            return (
              <button
                key={i}
                disabled={phase === 0 || test === "laeuft" || i === 0 || i === m.breite - 1}
                className={`${luecke ? "bau-luecke" : "bau-boden"} ${gebaut ? "bau-bruecke" : ""} ${phase === 2 && i === m.sprung ? "bau-huerde" : ""}`}
                aria-label={`Feld ${i + 1}: ${gebaut ? "Brücke" : luecke ? "Lücke" : "Boden"}`}
                aria-pressed={gebaut}
                onClick={() => {
                  setBruecken((alt) => (alt.includes(i) ? alt.filter((x) => x !== i) : alt.length < m.luecken.length ? [...alt, i] : alt));
                  setTest("bereit");
                }}
              >
                {gebaut ? "═" : luecke ? "?" : ""}
              </button>
            );
          })}
        </div>
      </div>
      {phase !== 1 && (
        <div className="flex flex-wrap gap-3">
          {["Im Loch", "Vor der Lücke", "Hinter dem Ziel"].map((t, i) => (
            <button key={t} className="spiel-knopf" aria-pressed={sprung === i} disabled={test === "laeuft"} onClick={() => { setSprung(i); setTest("bereit"); }}>
              {phase === 2 && i === 1 ? "Vor der letzten Hürde" : t}
            </button>
          ))}
        </div>
      )}
      {phase > 0 && <p className="bau-vorrat">Brücken: {bruecken.length} / {m.luecken.length}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="spiel-knopf spiel-knopf-dunkel" disabled={test === "laeuft" || (phase !== 1 && sprung === undefined)} onClick={testen}>
          <Symbol name="play" /> Weg testen
        </button>
        <button className="spiel-knopf" disabled={test === "laeuft"} onClick={() => { setBruecken([]); setSprung(undefined); setSchritt(0); setFlug(false); setTest("bereit"); setAntwort(null); }}>
          <Symbol name="refresh" /> Neu bauen
        </button>
      </div>
      <details className="spiel-wissen">
        <summary>Was steckt dahinter?</summary>
        <p>Beim Gestalten eines Spiels baust du Wege und Regeln. Ausprobieren zeigt, ob dein Level funktioniert. Ein Fehler ist ein Hinweis zum Weiterbauen.</p>
      </details>
    </div>
  );
}

export function Lernaufgabe({ art, stufe, phase, geschafft, fehler, figur }: { art: MissionArt; stufe: Stufe; phase: number; geschafft: () => void; fehler?: () => void; figur?: FigurDaten }) {
  if (art === "code") return <CodeAufgabe stufe={stufe} phase={phase} geschafft={geschafft} fehler={fehler} />;
  if (art === "muster") return <WahlAufgabe mission={kiMission(stufe, phase)} geschafft={geschafft} fehler={fehler} />;
  if (art === "strom") return phase === 1 ? <SchalterAufgabe stufe={stufe} geschafft={geschafft} fehler={fehler} /> : <WahlAufgabe mission={phase === 0 ? materialMission(stufe) : energieMission(stufe)} geschafft={geschafft} fehler={fehler} />;
  return <BauAufgabe stufe={stufe} phase={phase} geschafft={geschafft} fehler={fehler} figur={figur} />;
}
