"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import type { Modus } from "@/lib/entdecken";
import { alterHinweis, preisText, tagSchluessel } from "@/lib/eltern-suche";
import { alterText, ART_TEXT, formatTagLang, formatTermin, formatZeit, naechsterTermin, relativ, statusText } from "@/lib/format";
import { erzeugeIcs } from "@/lib/ics";
import { slugAusId } from "@/lib/routen";
import { useBrowserKann, useHerkunft, useJetzt, useUrlParameter } from "./browser-werte";
import { kurzname } from "./einrichtung-badge";
import { DatumBlock } from "./eltern/datum-block";
import { useSammlung } from "./sammlung";
import { Seitenrahmen } from "./seitenrahmen";
import { Symbol } from "./symbol";
import { BackButton, Button, Pill } from "./ui";

/** Texte je Bereich: Eltern werden gesiezt, Kinder und Teens geduzt. */
const TEXTE = {
  sie: {
    zurueck: "Zurück zur Suche",
    blick: "Auf einen Blick",
    quelle: "Kurzfassung von der Website der Einrichtung. Verbindlich sind die Angaben dort.",
    merken: "Merken",
    gemerkt: "Gemerkt",
    teilenTitel: "Angebot weitergeben",
    teilenText: "Der Link enthält nur dieses Angebot – keine Daten über Sie oder Ihr Kind.",
    kopiert: "Link kopiert. Sie können ihn jetzt teilen.",
    kalender: "Die Kalenderdatei enthält alle veröffentlichten Termine. Änderungen bitte beim Anbieter prüfen.",
  },
  du: {
    zurueck: "Zurück",
    blick: "Dein Überblick",
    quelle: "Gekürzte Beschreibung des Veranstalters. Alles Verbindliche steht auf der Originalseite.",
    merken: "In meine Sammlung",
    gemerkt: "In deiner Sammlung",
    teilenTitel: "Eine gute Idee zum Weiterzeigen.",
    teilenText: "Der Link enthält nur das Angebot. Deine Interessen und deine Sammlung werden nicht mitgeschickt.",
    kopiert: "Link kopiert. Du kannst ihn jetzt teilen.",
    kalender: "Die Kalenderdatei enthält alle veröffentlichten Termine. Änderungen bitte beim Veranstalter prüfen.",
  },
};

const ZURUECK: Record<Modus, string> = { eltern: "/eltern/#suche", teen: "/teen/", kind: "/kinder/" };

export function AngebotDetails({ angebot: a, meta, jetzt: start }: { angebot: Angebot; meta: Meta; jetzt: string }) {
  const parameter = useUrlParameter("modus");
  const modus: Modus = parameter === "kind" || parameter === "teen" ? parameter : "eltern";
  const t = modus === "eltern" ? TEXTE.sie : TEXTE.du;
  const jetzt = useJetzt(start);
  const url = `${useHerkunft()}/angebot/${slugAusId(a.id)}/`;
  const sprache = useBrowserKann(() => "speechSynthesis" in window);
  const [meldung, setMeldung] = useState("");
  const [qr, setQr] = useState("");
  const [liest, setLiest] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const merk = useSammlung(modus);

  const quelle = meta.quellen.find((q) => q.id === a.quelle);
  const einrichtung = kurzname(quelle, a.quelle);
  const termin = naechsterTermin(a, new Date(jetzt));
  const kommend = termin ? new Date(termin.ende ?? termin.start).getTime() >= new Date(jetzt).getTime() : false;
  const ausgebucht = a.status === "ausgebucht";
  const gemerkt = merk.ids.includes(a.id);
  const zeitVon = (iso: string, ende?: string) => (ende ? `${formatZeit(iso)}–${formatZeit(ende)} Uhr` : `${formatZeit(iso)} Uhr`);

  // Stimmen laden und beim Verlassen der Seite das Vorlesen beenden.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.cancel();
  }, []);

  function kalender() {
    const blob = new Blob([erzeugeIcs([a], a.titel)], { type: "text/calendar;charset=utf-8" });
    const objektUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objektUrl;
    link.download = `heilbronn-island-${slugAusId(a.id).replace(/[^\w-]/g, "-")}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objektUrl), 1000);
    setMeldung(t.kalender);
  }
  async function teilen() {
    setMeldung("");
    dialog.current?.showModal();
    try {
      const QRCode = await import("qrcode");
      // Farben = Tokens ink/white; der QR-Code wird lokal erzeugt, ohne externe Anfrage.
      setQr(await QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#1F2937", light: "#FFFFFF" } }));
    } catch {
      setMeldung("Der QR-Code konnte nicht erstellt werden. Der Link unten funktioniert trotzdem.");
    }
  }
  async function kopieren() {
    try {
      await navigator.clipboard.writeText(url);
      setMeldung(t.kopiert);
    } catch {
      setMeldung("Bitte den Link im Feld markieren und mit Strg+C kopieren.");
    }
  }
  async function systemTeilen() {
    if (!navigator.share) return kopieren();
    try {
      await navigator.share({ title: a.titel, text: `Ein Lernangebot in Heilbronn: ${a.titel}`, url });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setMeldung("Teilen ging hier nicht. Bitte stattdessen den Link kopieren.");
    }
  }
  function vorlesen() {
    if (liest) {
      window.speechSynthesis.cancel();
      setLiest(false);
      return;
    }
    const stimme = window.speechSynthesis.getVoices().find((v) => v.localService && v.lang.startsWith("de"));
    if (!stimme) {
      setMeldung("Auf diesem Gerät gibt es keine deutsche Vorlesestimme. Der Text wird nicht an einen Sprachdienst gesendet.");
      return;
    }
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

  return (
    <Seitenrahmen modus={modus}>
      <main id="inhalt" className="el-detail">
        <BackButton href={ZURUECK[modus]}>{t.zurueck}</BackButton>
        <div className="el-detail__raster">
          <article aria-labelledby="angebot-titel">
            <p className="el-karte__oben">
              <span className="el-einrichtung" style={{ ["--farbe" as string]: quelle?.farbe } as CSSProperties}><i aria-hidden="true" />{einrichtung}</span>
              <span>{ART_TEXT[a.art]}</span>
            </p>
            <h1 id="angebot-titel">{a.titel}</h1>
            <div className="el-detail__themen">
              {a.themen.map((id) => {
                const thema = meta.themen.find((x) => x.id === id);
                return <Pill key={id} farbe={thema?.farbe}><Symbol name={thema?.symbol ?? "compass"} /> {thema?.name ?? id}</Pill>;
              })}
            </div>
            {a.teaser && <p className="el-detail__lead">{a.teaser}</p>}
            <p className="el-detail__quelle">{t.quelle}</p>
            <div className="el-detail__knoepfe">
              <Button variante="ghost" icon="star" ariaPressed={gemerkt} onClick={() => merk.merken(a.id)}>{gemerkt ? t.gemerkt : t.merken}</Button>
              <Button variante="ghost" icon="share" onClick={teilen}>Teilen</Button>
              {sprache && <Button variante="ghost" icon="volume" onClick={vorlesen}>{liest ? "Vorlesen stoppen" : "Vorlesen"}</Button>}
            </div>

            <h2>{a.termine.length === 1 ? "Termin" : `Alle ${a.termine.length} Termine`}</h2>
            <ul className="el-termine">
              {a.termine.map((x, i) => {
                const vorbei = new Date(x.ende ?? x.start).getTime() < new Date(jetzt).getTime();
                return (
                  <li key={`${x.start}-${i}`} className={vorbei ? "ist-vorbei" : undefined}>
                    <DatumBlock klein iso={x.start} />
                    <span><strong>{formatTagLang(x.start)}</strong><br />{zeitVon(x.start, x.ende)}{vorbei && " · vorbei"}</span>
                  </li>
                );
              })}
            </ul>
            <div className="el-detail__knoepfe">
              <Button variante="ghost" icon="calendar" onClick={kalender}>Termine in den Kalender</Button>
            </div>
            <p role="status" className="mt-4 text-sm empty:hidden">{meldung}</p>
          </article>

          <aside className="el-detail__seite">
            <section className="el-blick" aria-labelledby="blick-titel">
              <h2 id="blick-titel">{t.blick}</h2>
              {termin && (
                <div className="el-blick__termin">
                  <DatumBlock iso={termin.start} heute={tagSchluessel(termin.start) === tagSchluessel(jetzt)} />
                  <div>
                    <strong>{kommend ? "Nächster Termin" : "Letzter Termin"}</strong>
                    <span>{formatTagLang(termin.start)}, {zeitVon(termin.start, termin.ende)}{kommend && ` · ${relativ(termin.start, new Date(jetzt))}`}</span>
                  </div>
                </div>
              )}
              <dl>
                <div><Symbol name="cake" /><dt>Alter</dt><dd>{alterHinweis(a).text}</dd></div>
                <div>
                  <Symbol name="pin" /><dt>Ort</dt>
                  <dd>
                    {a.ort.online ? "Online" : a.ort.name}
                    {!a.ort.online && a.ort.adresse && <span>{a.ort.adresse}</span>}
                    {!a.ort.online && a.ort.lat !== undefined && a.ort.lon !== undefined && (
                      <span><a href={`https://www.openstreetmap.org/?mlat=${a.ort.lat}&mlon=${a.ort.lon}#map=17/${a.ort.lat}/${a.ort.lon}`} target="_blank" rel="noopener noreferrer">Auf der Karte zeigen</a></span>
                    )}
                  </dd>
                </div>
                <div><Symbol name="euro" /><dt>Kosten</dt><dd>{preisText(a)}</dd></div>
                <div><Symbol name="users" /><dt>Plätze</dt><dd>{statusText(a.status)}</dd></div>
              </dl>
              {modus === "eltern" ? (
                <>
                  <Button variante={ausgebucht ? "ghost" : "primary"} icon="external" href={a.url}>{ausgebucht ? `Bei ${einrichtung} ansehen` : `Zur Anmeldung bei ${einrichtung}`}</Button>
                  <p className="el-blick__klein">Öffnet die Website von {einrichtung} in einem neuen Tab. Dort gelten deren Bedingungen.</p>
                </>
              ) : (
                <>
                  <p className="el-blick__hinweis"><strong>Gemeinsam anmelden</strong>Wenn du unter 18 bist, frag einen Erwachsenen. Hier kannst du nichts buchen.</p>
                  <Button variante="primary" icon="share" onClick={teilen}>{modus === "kind" ? "Zeig’s einem Erwachsenen" : "Angebot teilen"}</Button>
                  <details>
                    <summary className="min-h-12 cursor-pointer py-3 text-sm font-bold">Für Erwachsene: Originalangebot öffnen</summary>
                    <p className="mb-3 text-sm">Du verlässt Heilbronn Island. Bei {einrichtung} gelten eigene Datenschutz- und Teilnahmebedingungen.</p>
                    <Button variante="ghost" icon="external" href={a.url}>Zu {einrichtung}</Button>
                  </details>
                </>
              )}
            </section>
          </aside>
        </div>

        <p className="el-stand">
          <Symbol name="info" />
          <span>Datenstand: {new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium" }).format(new Date(meta.aktualisiert))}. Termine, Preise und freie Plätze können sich ändern.</span>
        </p>

        <dialog ref={dialog} className="quiz-dialog" aria-labelledby="teilen-titel">
          <div className="p-7">
            <div className="flex justify-between gap-4">
              <h2 id="teilen-titel" className="font-display text-xl font-bold">{t.teilenTitel}</h2>
              <button type="button" className="chip" onClick={() => dialog.current?.close()} aria-label="Teilen schließen"><Symbol name="close" /></button>
            </div>
            <p className="mt-4 text-sm">{t.teilenText}</p>
            {/* Lokaler QR-Code als data-URL, ohne externe Bild-Anfrage. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {qr && <div className="mt-5 flex justify-center"><img width={240} height={240} src={qr} alt="QR-Code zum Link dieses Angebots" /></div>}
            <label className="feld-label mt-5">Link zum Angebot<input value={url} readOnly onFocus={(e) => e.target.select()} /></label>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variante="primary" icon="check" onClick={kopieren}>Link kopieren</Button>
              <Button variante="ghost" icon="share" onClick={systemTeilen}>Teilen mit …</Button>
            </div>
            <p role="status" className="mt-3 text-sm">{meldung}</p>
          </div>
        </dialog>
      </main>
    </Seitenrahmen>
  );
}
