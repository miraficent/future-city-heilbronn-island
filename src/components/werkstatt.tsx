"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STUFEN, type Stufe } from "@/lib/abenteuer";
import type { Angebot } from "@/lib/angebot";
import { MODULE, type Checkpoint } from "@/lib/checkpoint";
import { slugAusId } from "@/lib/routen";
import { passendeSpielAngebote } from "@/lib/spiel";
import { alsText, pruefe, VORLAGE } from "@/lib/werkstatt";
import { Symbol } from "./symbol";
import { Lernaufgabe } from "./spiel/lernaufgabe";
import { PixelBild } from "./spiel/pixel-grafik";

export function Werkstatt({ vorlagen, angebote, themen, jetzt }: { vorlagen: Checkpoint[]; angebote: Angebot[]; themen: string[]; jetzt: string }) {
  const auswahlListe = useMemo(() => [...vorlagen, VORLAGE], [vorlagen]);
  const [auswahl, setAuswahl] = useState(vorlagen[0]!.id);
  const original = auswahlListe.find((c) => c.id === auswahl) ?? VORLAGE;
  const [text, setText] = useState(() => alsText(original));
  const [letzteGueltige, setLetzteGueltige] = useState<Checkpoint>(original);
  const [stufe, setStufe] = useState<Stufe>("start");
  const [aktiv, setAktiv] = useState(0);
  const [geschafft, setGeschafft] = useState<string[]>([]);

  const ergebnis = useMemo(() => pruefe(text, themen), [text, themen]);
  const vorschau = ergebnis.checkpoint ?? letzteGueltige;
  const aktivitaet = vorschau.aktivitaeten[aktiv] ?? vorschau.aktivitaeten[0]!;
  const nr = vorschau.aktivitaeten.indexOf(aktivitaet);
  const alter = STUFEN.find((s) => s.id === stufe)!.min;
  const kurse = useMemo(() => passendeSpielAngebote(angebote, vorschau.thema, alter, new Date(jetzt)), [angebote, vorschau.thema, alter, jetzt]);
  const doppeltesTeil = vorlagen.some((c) => c.id !== vorschau.id && c.teil === vorschau.teil);
  const geaendert = text !== alsText(original);

  function aendern(neu: string) {
    setText(neu);
    const gueltig = pruefe(neu, themen).checkpoint;
    if (gueltig) setLetzteGueltige(gueltig);
  }

  function waehlen(id: string) {
    const c = auswahlListe.find((x) => x.id === id) ?? VORLAGE;
    setAuswahl(id);
    setText(alsText(c));
    setLetzteGueltige(c);
    setAktiv(0);
    setGeschafft([]);
  }

  function herunterladen() {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ergebnis.checkpoint?.id ?? auswahl}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="werkstatt mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section aria-labelledby="editor-titel">
        <h2 id="editor-titel" className="font-display text-xl font-bold">Konfiguration</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-bold">
            Lernhaus
            <select className="werkstatt-feld" value={auswahl} onChange={(e) => waehlen(e.target.value)}>
              {vorlagen.map((c) => <option key={c.id} value={c.id}>{c.kurz} · {c.name}</option>)}
              <option value={VORLAGE.id}>Neue Einrichtung (Vorlage)</option>
            </select>
          </label>
          <button className="spiel-knopf" onClick={herunterladen} disabled={!ergebnis.checkpoint}><Symbol name="arrow" style={{ transform: "rotate(90deg)" }} />Datei herunterladen</button>
          <button className="spiel-knopf" onClick={() => waehlen(auswahl)} disabled={!geaendert}><Symbol name="refresh" />Zurücksetzen</button>
        </div>
        <label htmlFor="werkstatt-json" className="mt-4 block text-sm font-bold">
          konfiguration/checkpoints/{ergebnis.checkpoint?.id ?? auswahl}.json
        </label>
        <textarea
          id="werkstatt-json"
          className="werkstatt-editor"
          value={text}
          onChange={(e) => aendern(e.target.value)}
          spellCheck={false}
          aria-describedby="werkstatt-status"
          aria-invalid={ergebnis.fehler.length > 0}
        />
        <div id="werkstatt-status" role="status" className={`werkstatt-status ${ergebnis.fehler.length ? "hat-fehler" : "ist-gueltig"}`}>
          {ergebnis.fehler.length ? (
            <>
              <strong>{ergebnis.fehler.length === 1 ? "1 Problem" : `${ergebnis.fehler.length} Probleme`} – die Vorschau zeigt die letzte gültige Fassung.</strong>
              <ul>{ergebnis.fehler.slice(0, 8).map((f, i) => <li key={i}><code>{f.pfad}</code>: {f.meldung}</li>)}</ul>
            </>
          ) : (
            <strong><Symbol name="check" /> Gültig. So erscheint das Haus in der Spielwelt.</strong>
          )}
          {doppeltesTeil && <p>Hinweis: Das Raketenteil „{vorschau.teil}“ gibt schon ein anderes Haus. Jedes Haus braucht ein eigenes Teil.</p>}
        </div>
        <details className="spiel-wissen">
          <summary>Verfügbare Lernmodule</summary>
          <ul className="werkstatt-module">
            {Object.entries(MODULE).map(([id, m]) => (
              <li key={id}><code>{id}</code> – {m.name}{id === "lektion" ? " (Folien direkt in der Datei)" : m.varianten > 1 ? ` (Varianten 0–${m.varianten - 1})` : ""}</li>
            ))}
          </ul>
        </details>
      </section>

      <section aria-labelledby="vorschau-titel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="vorschau-titel" className="font-display text-xl font-bold">Vorschau</h2>
          <div className="werkstatt-stufen" role="group" aria-label="Altersstufe der Vorschau">
            {STUFEN.map((s) => (
              <button key={s.id} className="spiel-knopf" aria-pressed={stufe === s.id} onClick={() => setStufe(s.id)}>{s.name} <span className="text-xs">{s.alter}</span></button>
            ))}
          </div>
        </div>
        <div className="spiel-fenster spiel-fenster-breit werkstatt-vorschau mt-4">
          <div className="spiel-fenster-kopf">
            <PixelBild motiv={vorschau.grafik} className="fenster-kopfbild" />
            <h2>{vorschau.titel}</h2>
          </div>
          <div className="haus-inhalt">
            <p className="haus-geschichte">
              <span className="haus-ort" style={{ background: vorschau.farbe }}>{vorschau.kurz} · {vorschau.name}</span>
              {vorschau.geschichte[stufe === "start" ? "klein" : "gross"]}
            </p>
            <nav className="aufgaben-reiter" aria-label="Aufgaben in diesem Haus">
              {vorschau.aktivitaeten.map((a, n) => (
                <button key={n} aria-current={nr === n ? "step" : undefined} className={geschafft.includes(`${stufe}-${n}`) ? "ist-fertig" : ""} onClick={() => setAktiv(n)} aria-label={`Aufgabe ${n + 1}: ${a.titel}`} title={a.titel}>
                  {geschafft.includes(`${stufe}-${n}`) ? <Symbol name="star" /> : n + 1}
                </button>
              ))}
            </nav>
            <p className="werkstatt-aufgabe"><strong>{aktivitaet.titel}</strong> · Modul <code>{aktivitaet.modul}</code></p>
            <div className="aufgabe-flaeche">
              <Lernaufgabe key={`${JSON.stringify(aktivitaet)}-${stufe}`} aktivitaet={aktivitaet} stufe={stufe} geschafft={() => setGeschafft((g) => [...new Set([...g, `${stufe}-${nr}`])])} />
            </div>
            {geschafft.includes(`${stufe}-${nr}`) && (
              <p className="werkstatt-belohnung" role="status"><Symbol name="rocket" /> Geschafft. Im Spiel gibt die erste gelöste Aufgabe das Raketenteil „{vorschau.teil}“.</p>
            )}
          </div>
        </div>
        <div className="werkstatt-kurse mt-5">
          <h3 className="font-bold">Echte Kurse in diesem Haus ({kurse.length})</h3>
          <p className="text-sm">Thema „{vorschau.thema}“, Alter {alter}. Kommt automatisch aus den Kursdaten, nicht aus dieser Datei.</p>
          {kurse.length ? (
            <ul>{kurse.slice(0, 4).map((k) => <li key={k.id}><Link href={`/angebot/${slugAusId(k.id)}/`}>{k.titel}</Link></li>)}</ul>
          ) : (
            <p className="text-sm">Für dieses Alter gibt es gerade keine passenden Kurse. Die Spielwelt zeigt dann einen Hinweis statt erfundener Kurse.</p>
          )}
        </div>
      </section>
    </div>
  );
}
