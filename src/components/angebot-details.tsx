"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import type { Modus } from "@/lib/entdecken";
import { alterText, ART_TEXT, formatTermin, naechsterTermin, statusText } from "@/lib/format";
import { erzeugeIcs } from "@/lib/ics";
import { themenStile } from "@/lib/themen-stil";
import { slugAusId } from "@/lib/routen";
import { EinrichtungBadge, kurzname } from "./einrichtung-badge";
import { useMerkzettel } from "./merkzettel";
import { Planet } from "./planet";
import { Seitenrahmen } from "./seitenrahmen";
import { Symbol } from "./symbol";

export function AngebotDetails({ angebot: a, meta, jetzt }: { angebot: Angebot; meta: Meta; jetzt: string }) {
  const [modus, setModus] = useState<Modus>("eltern");
  const [meldung, setMeldung] = useState("");
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");
  const [liest, setLiest] = useState(false);
  const [sprache, setSprache] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const merk = useMerkzettel(modus);
  const quelle = meta.quellen.find((q) => q.id === a.quelle);
  const stil = themenStile(meta.themen)[a.themen[0] ?? ""];
  const termin = naechsterTermin(a, new Date(jetzt));
  useEffect(() => {
    const parameter = new URLSearchParams(window.location.search).get("modus");
    if (parameter === "kind" || parameter === "teen") setModus(parameter);
    setUrl(`${window.location.origin}/angebot/${slugAusId(a.id)}/`);
    setSprache("speechSynthesis" in window);
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [a.id]);

  function kalender() {
    const blob = new Blob([erzeugeIcs([a], a.titel)], { type: "text/calendar;charset=utf-8" });
    const objektUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objektUrl;
    link.download = `cosmos-${slugAusId(a.id)}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objektUrl), 1000);
    setMeldung("Die Kalenderdatei enthält alle veröffentlichten Termine dieses Angebots. Änderungen bitte beim Veranstalter prüfen.");
  }
  async function teilen() {
    setMeldung("");
    dialog.current?.showModal();
    try {
      const QRCode = await import("qrcode");
      setQr(await QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#1c1934", light: "#ffffff" } }));
    } catch { setMeldung("Der QR-Code konnte nicht erstellt werden. Du kannst den Link unten kopieren."); }
  }
  async function kopieren() {
    try { await navigator.clipboard.writeText(url); setMeldung("Link kopiert. Du kannst ihn jetzt teilen."); }
    catch { setMeldung("Bitte markiere den Link im Feld und kopiere ihn mit Strg+C."); }
  }
  async function systemTeilen() {
    if (!navigator.share) { await kopieren(); return; }
    try { await navigator.share({ title: a.titel, text: `Schau mal, dieses Lernangebot in Heilbronn: ${a.titel}`, url }); }
    catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setMeldung("Teilen ging hier nicht. Du kannst stattdessen den Link kopieren."); }
  }
  function vorlesen() {
    if (liest) { window.speechSynthesis.cancel(); setLiest(false); return; }
    const stimme = window.speechSynthesis.getVoices().find((v) => v.localService && v.lang.startsWith("de"));
    if (!stimme) { setMeldung("Auf diesem Gerät ist keine lokale deutsche Vorlesestimme verfügbar. Der Text wird deshalb nicht an einen Sprachdienst gesendet."); return; }
    const text = new SpeechSynthesisUtterance(`${a.titel}. ${alterText(a)}. ${a.teaser}. ${termin ? formatTermin(termin) : ""}. ${a.kosten.text}.`);
    text.voice = stimme;
    text.lang = "de-DE";
    text.rate = 0.88;
    text.onend = () => setLiest(false);
    text.onerror = () => { setLiest(false); setMeldung("Das Vorlesen wurde unterbrochen."); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(text);
    setLiest(true);
  }
  return <Seitenrahmen modus={modus}>
    <main id="inhalt" className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
      <Link href={`/${modus}`} className="inline-flex min-h-12 items-center text-sm font-bold underline underline-offset-4">← Zurück zum Entdecken</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <article>
          <EinrichtungBadge quelle={quelle} id={a.quelle} />
          <h1 className="mt-5 font-display text-[clamp(1.6rem,3.5vw,3.1rem)] font-bold leading-tight">{a.titel}</h1>
          <div className="mt-5 flex flex-wrap gap-2">{a.themen.map((id) => { const thema = meta.themen.find((t) => t.id === id); return <span key={id} className="rounded-full border border-tinte px-3 py-1 text-sm"><Symbol name={thema?.symbol ?? "compass"} className="!size-4 mr-1"/> {thema?.name ?? id}</span>; })}<span className="rounded-full border border-tinte px-3 py-1 text-sm">{ART_TEXT[a.art]}</span></div>
          <p className="mt-7 text-lg leading-relaxed">{a.teaser}</p>
          <p className="mt-3 text-sm text-tinte-2">Gekürzte Beschreibung des Veranstalters. Den vollständigen Inhalt und verbindliche Angaben findest du auf der Originalseite.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="knopf" aria-pressed={merk.ids.includes(a.id)} onClick={() => merk.merken(a.id)}><Symbol name={merk.ids.includes(a.id)?"check":"backpack"}/>{merk.ids.includes(a.id) ? "Auf deinem Merkzettel" : "Das möchte ich mir merken"}</button>
            {sprache && <button className="knopf" onClick={vorlesen}><Symbol name="volume"/>{liest ? "Vorlesen stoppen" : "Vorlesen"}</button>}
          </div>
          <h2 className="mt-10 font-display text-xl font-bold">Wann geht es los?</h2>
          <ul className="mt-4 divide-y divide-linie rounded-2xl border-2 border-tinte bg-flaeche px-5">{a.termine.map((t, i) => <li key={`${t.start}-${i}`} className="py-4 text-sm">{formatTermin(t)}</li>)}</ul>
          <button className="knopf mt-5" onClick={kalender}>↧ Termine im Kalender speichern</button>
        </article>
        <aside className="self-start overflow-hidden rounded-3xl border-2 border-tinte bg-flaeche">
          {stil && <div className="relative h-48 overflow-hidden border-b-2 border-tinte" style={{ background: stil.farbe }}><Planet kennung="detail-planet" farbe={stil.farbe} art={stil.planet} className="absolute -right-2 -top-16 w-80" /><Symbol name={meta.themen.find((t) => t.id === stil.id)?.symbol ?? "compass"} className="absolute bottom-5 left-6 !size-12"/></div>}
          <div className="p-6"><h2 className="font-display text-lg font-bold">Dein Missions-Check</h2><dl className="mt-5 space-y-5 text-sm"><div><dt className="text-tinte-2">Für wen?</dt><dd className="mt-1 font-bold">{alterText(a)}</dd></div><div><dt className="text-tinte-2">Wo?</dt><dd className="mt-1 font-bold">{a.ort.online ? "Online-Angebot" : a.ort.name}</dd>{!a.ort.online && <dd>{a.ort.adresse}</dd>}</div><div><dt className="text-tinte-2">Was kostet es?</dt><dd className="mt-1 font-bold">{a.kosten.text}</dd></div><div><dt className="text-tinte-2">Noch Platz?</dt><dd className="mt-1 font-bold">{statusText(a.status)}</dd></div></dl>
            <button className="knopf knopf-primaer mt-6 w-full justify-center" onClick={teilen}><Symbol name="arrow"/>{modus === "kind" ? "Zeig’s einem Erwachsenen" : "Angebot teilen"}</button>
            <div className="mt-6 rounded-xl bg-papier-2 p-4 text-sm"><strong>Gemeinsam anmelden</strong><p className="mt-2">Wenn du unter 18 bist, bitte einen Erwachsenen um Hilfe. Hier kannst du nichts buchen.</p></div>
            <details className="mt-4"><summary className="min-h-12 cursor-pointer py-3 text-sm font-bold">Für Erwachsene: Originalangebot öffnen</summary><p className="mb-3 text-xs text-tinte-2">Du verlässt COSMOS-Entdecker. Bei {kurzname(quelle, a.quelle)} gelten eigene Datenschutz- und Teilnahmebedingungen.</p><a className="knopf w-full justify-center text-sm" href={a.url} target="_blank" rel="noopener noreferrer">Zu {kurzname(quelle, a.quelle)} <Symbol name="arrow"/></a></details>
          </div>
        </aside>
      </div>
      <p role="status" className="mt-5 text-sm">{meldung}</p>
      <p className="mt-8 text-xs text-tinte-2">Datenstand: {new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium" }).format(new Date(meta.aktualisiert))}. Verfügbarkeit und Preise können sich ändern.</p>
      <dialog ref={dialog} className="quiz-dialog" aria-labelledby="teilen-titel"><div className="p-7"><div className="flex justify-between gap-4"><h2 id="teilen-titel" className="font-display text-xl font-bold">Eine gute Idee zum Weiterzeigen.</h2><button className="chip" onClick={() => dialog.current?.close()} aria-label="Teilen schließen">✕</button></div><p className="mt-4 text-sm">Der Link enthält nur das Angebot. Deine Interessen und dein Merkzettel werden nicht mitgeschickt.</p>{qr && <div className="mt-5 flex justify-center">{/* Lokaler QR-Code, ohne externe Bild-Anfrage. */}<img width={240} height={240} src={qr} alt="QR-Code zum Link dieses Angebots" /></div>}<label className="feld-label mt-5">Link zum Angebot<input value={url} readOnly onFocus={(e) => e.target.select()} /></label><div className="mt-5 flex flex-wrap gap-3"><button className="knopf knopf-primaer" onClick={kopieren}>Link kopieren</button><button className="knopf" onClick={systemTeilen}>Teilen mit …</button></div><p role="status" className="mt-3 text-sm">{meldung}</p><p className="mt-4 text-xs text-tinte-2">Am selben Computer funktioniert auch eine lokale Adresse. Für ein anderes Gerät brauchst du eine veröffentlichte Website.</p></div></dialog>
    </main>
  </Seitenrahmen>;
}
