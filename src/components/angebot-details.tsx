"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import type { Modus } from "@/lib/entdecken";
import { alterHinweis, ART_TEXTE, preisText, statusAnzeige, tagSchluessel, themaName } from "@/lib/eltern-suche";
import { alterText, formatTermin, naechsterTermin } from "@/lib/format";
import { erzeugeIcs } from "@/lib/ics";
import { slugAusId } from "@/lib/routen";
import { besteStimme } from "@/lib/stimme";
import { useBrowserKann, useHerkunft, useJetzt, useUrlParameter } from "./browser-werte";
import { kurzname } from "./einrichtung-badge";
import { DatumBlock } from "./eltern/datum-block";
import { datum, useSprache } from "./eltern/sprache";
import { TEXTE } from "./eltern/texte";
import { useSammlung } from "./sammlung";
import { Seitenrahmen } from "./seitenrahmen";
import { Symbol } from "./symbol";
import { BackButton, Button, Pill } from "./ui";

/** Deutsch für Kinder und Teens: geduzt. Auf Englisch gibt es nur eine Form. */
const DU = {
  zurueck: "Zurück",
  blick: "Dein Überblick",
  quelle: "Gekürzte Beschreibung des Veranstalters. Alles Verbindliche steht auf der Originalseite.",
  merken: "In meine Sammlung",
  gemerkt: "In deiner Sammlung",
  teilenTitel: "Eine gute Idee zum Weiterzeigen.",
  teilenText: "Der Link enthält nur das Angebot. Deine Interessen und deine Sammlung werden nicht mitgeschickt.",
  kopiert: "Link kopiert. Du kannst ihn jetzt teilen.",
};

const ZURUECK: Record<Modus, string> = { eltern: "/eltern/#suche", teen: "/teen/", kind: "/kinder/" };

export function AngebotDetails({ angebot: a, meta, jetzt: start }: { angebot: Angebot; meta: Meta; jetzt: string }) {
  const parameter = useUrlParameter("modus");
  const modus: Modus = parameter === "kind" || parameter === "teen" ? parameter : "eltern";
  const sprache = useSprache();
  const k = TEXTE[sprache].karte;
  const t = { ...TEXTE[sprache].detail, merken: k.merken, gemerkt: k.gemerkt, ...(sprache === "de" && modus !== "eltern" ? DU : {}) };
  const d = datum(sprache);
  const jetzt = useJetzt(start);
  const url = `${useHerkunft()}/angebot/${slugAusId(a.id)}/`;
  const sprachausgabe = useBrowserKann(() => "speechSynthesis" in window);
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
    setMeldung(t.kalenderMeldung);
  }
  async function teilen() {
    setMeldung("");
    dialog.current?.showModal();
    try {
      const QRCode = await import("qrcode");
      // Farben = Tokens ink/white; der QR-Code wird lokal erzeugt, ohne externe Anfrage.
      setQr(await QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#1F2937", light: "#FFFFFF" } }));
    } catch {
      setMeldung(t.qrFehler);
    }
  }
  async function kopieren() {
    try {
      await navigator.clipboard.writeText(url);
      setMeldung(t.kopiert);
    } catch {
      setMeldung(t.kopierenFehler);
    }
  }
  async function systemTeilen() {
    if (!navigator.share) return kopieren();
    try {
      await navigator.share({ title: a.titel, text: a.titel, url });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setMeldung(t.teilenFehler);
    }
  }
  /** Vorgelesen wird die deutsche Originalbeschreibung – nur mit einer lokalen deutschen Stimme. */
  function vorlesen() {
    if (liest) {
      window.speechSynthesis.cancel();
      setLiest(false);
      return;
    }
    const stimme = besteStimme(window.speechSynthesis.getVoices(), "eule");
    if (!stimme) {
      setMeldung(t.keineStimme);
      return;
    }
    const text = new SpeechSynthesisUtterance(`${a.titel}. ${alterText(a)}. ${a.teaser}. ${termin ? formatTermin(termin) : ""}. ${a.kosten.text}.`);
    text.voice = stimme;
    text.lang = "de-DE";
    text.rate = 0.88;
    text.onend = () => setLiest(false);
    text.onerror = () => { setLiest(false); setMeldung(t.unterbrochen); };
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
              <span>{ART_TEXTE[sprache][a.art]}</span>
            </p>
            <h1 id="angebot-titel" lang="de">{a.titel}</h1>
            <div className="el-detail__themen">
              {a.themen.map((id) => {
                const thema = meta.themen.find((x) => x.id === id);
                return <Pill key={id} farbe={thema?.farbe}><Symbol name={thema?.symbol ?? "compass"} /> {thema ? themaName(thema, sprache) : id}</Pill>;
              })}
            </div>
            {a.teaser && <p className="el-detail__lead" lang="de">{a.teaser}</p>}
            <p className="el-detail__quelle">{t.quelle}</p>
            <div className="el-detail__knoepfe">
              <Button variante="ghost" icon="star" ariaPressed={gemerkt} onClick={() => merk.merken(a.id)}>{gemerkt ? t.gemerkt : t.merken}</Button>
              <Button variante="ghost" icon="share" onClick={teilen}>{t.teilen}</Button>
              {sprachausgabe && <Button variante="ghost" icon="volume" onClick={vorlesen}>{liest ? t.vorlesenStopp : t.vorlesen}</Button>}
            </div>

            <h2>{a.termine.length === 1 ? t.einTermin : t.alleTermine(a.termine.length)}</h2>
            <ul className="el-termine">
              {a.termine.map((x, i) => {
                const vorbei = new Date(x.ende ?? x.start).getTime() < new Date(jetzt).getTime();
                return (
                  <li key={`${x.start}-${i}`} className={vorbei ? "ist-vorbei" : undefined}>
                    <DatumBlock klein iso={x.start} />
                    <span><strong>{d.tagLang(x.start)}</strong><br />{d.zeit(x.start, x.ende)}{vorbei && t.vorbei}</span>
                  </li>
                );
              })}
            </ul>
            <div className="el-detail__knoepfe">
              <Button variante="ghost" icon="calendar" onClick={kalender}>{t.kalender}</Button>
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
                    <strong>{kommend ? t.naechster : t.letzter}</strong>
                    <span>{d.tagLang(termin.start)}, {d.zeit(termin.start, termin.ende)}{kommend && ` · ${d.relativ(termin.start, new Date(jetzt))}`}</span>
                  </div>
                </div>
              )}
              <dl>
                <div><Symbol name="cake" /><dt>{t.alter}</dt><dd>{alterHinweis(a, sprache).text}</dd></div>
                <div>
                  <Symbol name="pin" /><dt>{t.ort}</dt>
                  <dd>
                    {a.ort.online ? "Online" : a.ort.name}
                    {!a.ort.online && a.ort.adresse && <span>{a.ort.adresse}</span>}
                    {!a.ort.online && a.ort.lat !== undefined && a.ort.lon !== undefined && (
                      <span><a href={`https://www.openstreetmap.org/?mlat=${a.ort.lat}&mlon=${a.ort.lon}#map=17/${a.ort.lat}/${a.ort.lon}`} target="_blank" rel="noopener noreferrer">{t.karte}</a></span>
                    )}
                  </dd>
                </div>
                <div><Symbol name="euro" /><dt>{t.kosten}</dt><dd>{preisText(a, sprache)}</dd></div>
                <div><Symbol name="users" /><dt>{t.plaetze}</dt><dd>{statusAnzeige(a.status, sprache)}</dd></div>
              </dl>
              {modus === "eltern" || sprache === "en" ? (
                <>
                  <Button variante={ausgebucht ? "ghost" : "primary"} icon="external" href={a.url}>{ausgebucht ? t.ansehen(einrichtung) : t.anmelden(einrichtung)}</Button>
                  <p className="el-blick__klein">{t.hinweis(einrichtung)}</p>
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
          <span>{t.stand(d.stand(meta.aktualisiert))}</span>
        </p>

        <dialog ref={dialog} className="quiz-dialog" aria-labelledby="teilen-titel">
          <div className="p-7">
            <div className="flex justify-between gap-4">
              <h2 id="teilen-titel" className="font-display text-xl font-bold">{t.teilenTitel}</h2>
              <button type="button" className="chip" onClick={() => dialog.current?.close()} aria-label={t.teilenSchliessen}><Symbol name="close" /></button>
            </div>
            <p className="mt-4 text-sm">{t.teilenText}</p>
            {/* Lokaler QR-Code als data-URL, ohne externe Bild-Anfrage. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {qr && <div className="mt-5 flex justify-center"><img width={240} height={240} src={qr} alt={t.qrAlt} /></div>}
            <label className="feld-label mt-5">{t.linkFeld}<input value={url} readOnly onFocus={(e) => e.target.select()} /></label>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variante="primary" icon="check" onClick={kopieren}>{t.linkKopieren}</Button>
              <Button variante="ghost" icon="share" onClick={systemTeilen}>{t.teilenMit}</Button>
            </div>
            <p role="status" className="mt-3 text-sm">{meldung}</p>
          </div>
        </dialog>
      </main>
    </Seitenrahmen>
  );
}
