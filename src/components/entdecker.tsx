"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Angebot, Art, Zielgruppe } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { fuerModus, INTERESSEN, interessenThemen, type Modus } from "@/lib/entdecken";
import { filtere, LEERER_FILTER, type Filter } from "@/lib/filter";
import { ART_TEXT, formatMonat, naechsterTermin } from "@/lib/format";
import { themenStile } from "@/lib/themen-stil";
import { slugAusId } from "@/lib/routen";
import { Angebotskarte } from "./angebotskarte";
import { kurzname } from "./einrichtung-badge";
import { useSammlung } from "./sammlung";
import { Planet } from "./planet";
import { Symbol } from "./symbol";

const INHALTE = {
  kind: { oben: "DEIN NÄCHSTES ABENTEUER · HEILBRONN", titel: "Wohin fliegst du heute?", text: "Roboter bauen. Spiele erfinden. KI durchschauen. Such dir deinen Planeten aus!", quiz: "Finde meine Mission" },
  teen: { oben: "NEUE SKILLS. DEINE IDEEN. DEIN KOSMOS.", titel: "Mach mehr aus deiner Neugier.", text: "Von der ersten Codezeile bis zum eigenen Game. Entdecke, was in Heilbronn für dich geht.", quiz: "Interessen-Kompass" },
  eltern: { oben: "KLEINE INTERESSEN. GROSSE MÖGLICHKEITEN.", titel: "Das nächste Aha-Erlebnis wartet.", text: "Echte Lernangebote aus Heilbronn, an einem Ort. Für neugierige Kinder, Teens und die Menschen an ihrer Seite.", quiz: "Passendes Angebot finden" },
};

export function Entdecker({ modus, angebote, meta, jetzt: initialJetzt, eingebettet=false }: { modus: Modus; angebote: Angebot[]; meta: Meta; jetzt: string; eingebettet?:boolean }) {
  const Rahmen=eingebettet?"section":"main";
  const [jetzt, setJetzt] = useState(initialJetzt);
  useEffect(() => {
    setJetzt(new Date().toISOString());
    const timer = setInterval(() => setJetzt(new Date().toISOString()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const [filter, setFilter] = useState<Filter>({ ...LEERER_FILTER });
  const [ansicht, setAnsicht] = useState<"karten" | "zeit" | "pfad">("karten");
  const [merkansicht, setMerkansicht] = useState(false);
  const [interessen, setInteressen] = useState<string[]>([]);
  const [quizErgebnis, setQuizErgebnis] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const ergebnisRef = useRef<HTMLHeadingElement>(null);
  const merk = useSammlung(modus);
  const stile = Object.values(themenStile(meta.themen));
  const inhalt = INHALTE[modus];
  const basis = useMemo(() => fuerModus(angebote, modus), [angebote, modus]);
  const liste = filtere(basis, filter, new Date(jetzt));
  const ergebnisse = merkansicht ? basis.filter((a) => merk.ids.includes(a.id)) : liste;
  const gruppen = new Map<string, Angebot[]>();
  for (const a of ergebnisse) {
    const t = naechsterTermin(a, new Date(jetzt));
    const key = t ? formatMonat(t.start) : "Weitere Angebote";
    gruppen.set(key, [...(gruppen.get(key) ?? []), a]);
  }

  function aendere<K extends keyof Filter>(key: K, wert: Filter[K]) {
    setFilter((vorher) => ({ ...vorher, [key]: wert }));
    setMerkansicht(false);
  }
  function themaWaehlen(id: string) {
    aendere("themen", filter.themen.includes(id) ? filter.themen.filter((t) => t !== id) : [...filter.themen, id]);
    setQuizErgebnis(false);
  }
  function auswerten() {
    setFilter((vorher) => ({ ...LEERER_FILTER, alter: vorher.alter, themen: interessenThemen(interessen) }));
    setQuizErgebnis(true);
    setMerkansicht(false);
    dialog.current?.close();
    ergebnisRef.current?.focus();
    ergebnisRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }
  const karte = (a: Angebot) => <Angebotskarte key={a.id} angebot={a} meta={meta} modus={modus} gemerkt={merk.ids.includes(a.id)} merken={merk.merken} jetzt={jetzt} />;

  return (
    <Rahmen id={eingebettet?`kurskatalog-${modus}`:"inhalt"} className="mx-auto max-w-7xl px-5 pt-9 sm:px-8 sm:pt-14">
      <section className="relative grid gap-7 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em]">{inhalt.oben}</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2rem,5.1vw,4.5rem)] font-extrabold leading-[1.12] tracking-tight">{inhalt.titel}</h1>
          <p className="mt-5 max-w-xl text-lg text-tinte-2">{inhalt.text}</p>
          <button className="knopf knopf-primaer mt-6" onClick={() => dialog.current?.showModal()}>{inhalt.quiz}</button>
          <p className="mt-3 text-xs text-tinte-2">Ohne Konto. Deine Auswahl bleibt in diesem Browser.</p>
        </div>
        <aside className="relative overflow-hidden rounded-[32px] border-2 border-tinte bg-papier-2 p-6 sm:p-8">
          <div aria-hidden className="raster pointer-events-none absolute inset-0 opacity-10" />
          <p className="relative font-mono text-xs uppercase tracking-widest">Dein Entdecker-Pass</p>
          <div className="relative mt-5 flex items-center gap-5">
            <Symbol name="backpack" className="!size-16"/>
            <div><strong className="font-display text-3xl">{merk.ids.filter((id) => basis.some((a) => a.id === id)).length}</strong><p className="text-sm">{modus === "kind" ? "gesammelte Ideen" : "gesammelte Angebote"}</p></div>
          </div>
          <button className="knopf relative mt-6 w-full justify-center bg-flaeche" onClick={() => { setMerkansicht(!merkansicht); ergebnisRef.current?.focus(); }}>{merkansicht ? "← Alle Angebote entdecken" : "Meine Sammlung öffnen"}</button>
          <p className="relative mt-3 text-xs text-tinte-2">{modus === "kind" ? "Sammle, was dir gefällt. Zeig es danach einem Erwachsenen." : "Ideen sammeln, vergleichen und gemeinsam entscheiden."}</p>
        </aside>
      </section>

      <section aria-labelledby="planeten" className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="planeten" className="font-display text-lg font-bold">{modus === "kind" ? `${stile.length === 3 ? "Drei" : stile.length} Planeten. Viele Möglichkeiten.` : "Welches Thema weckt deine Neugier?"}</h2>
          <span className="font-mono text-xs text-tinte-2">{basis.length} Angebote · {meta.quellen.length} Einrichtungen</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {stile.map((t) => (
            <button key={t.id} aria-pressed={filter.themen.includes(t.id)} onClick={() => themaWaehlen(t.id)} className="planet-wahl relative flex min-h-40 items-center overflow-hidden rounded-3xl border-2 border-tinte bg-flaeche p-5 text-left" style={{ borderBottomColor: t.farbe, borderBottomWidth: 7 }}>
              <div className="relative z-10 max-w-[68%]"><span className="font-display text-base font-bold">{modus === "kind" ? t.kindername : t.name}</span><span className="mt-2 block text-sm text-tinte-2">{basis.filter((a) => a.themen.includes(t.id)).length} Entdeckungen {filter.themen.includes(t.id) ? "✓" : "→"}</span></div>
              <Planet kennung={`wahl-${t.id}`} farbe={t.farbe} art={t.planet} className="absolute -right-8 w-44" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="ergebnis">
        <div className="rounded-3xl border-2 border-tinte bg-flaeche p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modus !== "kind" && <label className="feld-label sm:col-span-2">Angebote durchsuchen<input type="search" value={filter.suche} maxLength={100} onChange={(e) => aendere("suche", e.target.value)} placeholder="Zum Beispiel Scratch, Roboter oder Python" /></label>}
            <label className="feld-label">{modus === "kind" ? "Wie alt bist du?" : "Alter der teilnehmenden Person"}<select value={filter.alter ?? ""} onChange={(e) => aendere("alter", e.target.value ? Number(e.target.value) : undefined)}><option value="">{modus === "kind" ? "6 bis 11 Jahre" : modus === "teen" ? "12 bis 17 Jahre" : "Alle Altersgruppen"}</option>{Array.from({ length: modus === "kind" ? 6 : modus === "teen" ? 6 : 16 }, (_, i) => (modus === "teen" ? 12 : modus === "kind" ? 6 : 3) + i).map((a) => <option key={a} value={a}>{a} Jahre</option>)}</select></label>
            <label className="feld-label">Wann soll es losgehen?<select value={filter.zeitraum} onChange={(e) => aendere("zeitraum", e.target.value as Filter["zeitraum"])}><option value="alle">Alle kommenden Termine</option><option value="woche">In den nächsten 7 Tagen</option><option value="monat">In den nächsten 31 Tagen</option></select></label>
            {modus !== "kind" && <>
              <label className="feld-label">Einrichtung<select value={filter.quellen[0] ?? ""} onChange={(e) => aendere("quellen", e.target.value ? [e.target.value] : [])}><option value="">Alle Einrichtungen</option>{meta.quellen.map((q) => <option key={q.id} value={q.id}>{kurzname(q, q.id)}</option>)}</select></label>
              <label className="feld-label">Format<select value={filter.arten[0] ?? ""} onChange={(e) => aendere("arten", e.target.value ? [e.target.value as Art] : [])}><option value="">Alle Formate</option>{Object.entries(ART_TEXT).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
              {modus === "eltern" && <label className="feld-label">Für wen?<select value={filter.zielgruppen[0] ?? ""} onChange={(e) => aendere("zielgruppen", e.target.value ? [e.target.value as Zielgruppe] : [])}><option value="">Alle Zielgruppen</option><option value="kinder">Kinder</option><option value="teens">Teens</option><option value="eltern">Eltern</option><option value="fachkraefte">Pädagogische Fachkräfte</option><option value="familien">Familien</option></select></label>}
            </>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <label className="check-label"><input type="checkbox" checked={filter.nurKostenlos} onChange={(e) => aendere("nurKostenlos", e.target.checked)} />Nur kostenlos</label>
            <label className="check-label"><input type="checkbox" checked={filter.nurFrei} onChange={(e) => aendere("nurFrei", e.target.checked)} />Mit gemeldeten freien Plätzen</label>
            <button className="min-h-11 underline underline-offset-4" onClick={() => { setFilter({ ...LEERER_FILTER }); setQuizErgebnis(false); setMerkansicht(false); }}>Filter zurücksetzen</button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 id="ergebnis" ref={ergebnisRef} tabIndex={-1} className="scroll-mt-8 font-display text-xl font-bold" aria-live="polite">{merkansicht ? "Deine Sammlung" : quizErgebnis ? "Deine Missionen" : "Bereit zum Entdecken?"} <span className="font-sans text-base font-normal">({ergebnisse.length})</span></h2>
          {modus !== "kind" && <div className="flex flex-wrap gap-2" aria-label="Ergebnisansicht"><button className="chip" aria-pressed={ansicht === "karten"} onClick={() => setAnsicht("karten")}>Karten</button><button className="chip" aria-pressed={ansicht === "zeit"} onClick={() => setAnsicht("zeit")}>Zeitreise</button>{modus === "teen" && <button className="chip" aria-pressed={ansicht === "pfad"} onClick={() => setAnsicht("pfad")}>Sternbild</button>}</div>}
        </div>
        {quizErgebnis && !merkansicht && <p className="mt-3 text-tinte-2">Zu deinen Ideen passen besonders {meta.themen.filter((t) => filter.themen.includes(t.id)).map((t) => t.name).join(" und ")}. Die Auswahl berücksichtigt dein Alter. Du kannst alle Filter weiter ändern.</p>}
        {merkansicht && <div className="mt-4 flex flex-wrap items-center gap-5 rounded-2xl bg-papier-2 p-4 text-sm">
          <p>{modus === "kind" ? "Deine Ideen bleiben nur in dieser Browsersitzung. Bei wiederhergestellten Tabs können sie noch da sein." : "Standardmäßig bleibt dieser Sammlung nur für die Browsersitzung."}</p>
          {modus !== "kind" && <label className="check-label"><input type="checkbox" checked={merk.dauerhaft} onChange={(e) => merk.behalten(e.target.checked)} />Auf diesem Gerät behalten</label>}
          <button className="min-h-11 underline" onClick={merk.leeren}>Sammlung leeren</button>
        </div>}
        {ergebnisse.length === 0 ? <div className="mt-6 rounded-3xl border-2 border-dashed border-tinte p-10 text-center"><Symbol name={merkansicht ? "backpack" : "search"} className="!size-12"/><h3 className="mt-4 text-xl font-bold">{merkansicht ? "Hier ist Platz für deine Ideen." : "Hier ist gerade noch kein Treffer."}</h3><p className="mx-auto mt-2 max-w-lg text-tinte-2">{merkansicht ? "Tippe bei einem Angebot auf „Merken“. Dann findest du es hier wieder." : "Versuche ein anderes Thema, einen größeren Zeitraum oder entferne einen Filter. Es werden keine Angebote erfunden."}</p><button className="knopf mt-5" onClick={() => { setMerkansicht(false); setFilter({ ...LEERER_FILTER }); setQuizErgebnis(false); }}>Alle Angebote entdecken</button></div>
          : ansicht === "pfad" && !merkansicht ? <div className="mt-6 rounded-3xl border-2 border-tinte bg-flaeche p-6"><p className="mb-5 text-sm text-tinte-2">Dein Sternbild verbindet echte Angebote verschiedener Einrichtungen. Nach Mindestalter sortiert; die Verbindung ist eine Entdeckungsidee, keine bestätigte Kursfolge.</p><ol className="sternpfad">{[...ergebnisse].sort((a, b) => (a.alterMin ?? 12) - (b.alterMin ?? 12)).map((a) => <li key={a.id}><span className="pfad-stern"><Symbol name="star"/></span><p className="font-mono text-xs">{a.alterMin ? `Ab ${a.alterMin} Jahren` : "Für Teens"} · {kurzname(meta.quellen.find((q) => q.id === a.quelle), a.quelle)}</p><Link className="mt-1 block text-lg font-bold underline underline-offset-4" href={`/angebot/${slugAusId(a.id)}?modus=teen`}>{a.titel}</Link></li>)}</ol></div>
          : ansicht === "zeit" && !merkansicht ? <div className="mt-6 space-y-10">{[...gruppen].map(([monat, liste]) => <section key={monat}><h3 className="mb-4 border-b-2 border-tinte pb-2 font-display text-lg">{monat}</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{liste.map(karte)}</div></section>)}</div>
          : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ergebnisse.map(karte)}</div>}
      </section>

      {modus !== "kind" && <section className="mt-12 grid gap-6 rounded-3xl border-2 border-tinte bg-papier-2 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
        <div><h2 className="font-display text-lg font-bold">Mehr Platz für Vorfreude.</h2><p className="mt-2 max-w-2xl text-sm">Lade die Termine als Kalenderdatei herunter. Ein Download wird nicht automatisch aktualisiert. Prüfe freie Plätze und Änderungen vor der Anmeldung beim Veranstalter.</p></div>
        <a className="knopf self-center bg-flaeche" href="/abo/alle.ics" download>↧ Kalender herunterladen</a>
      </section>}
      <p className="mt-7 text-xs text-tinte-2">Datenstand: {new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" }).format(new Date(meta.aktualisiert))} · Preise, Altersangaben und Verfügbarkeit bitte beim Veranstalter bestätigen.</p>

      <dialog ref={dialog} className="quiz-dialog" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }} aria-labelledby="quiz-titel">
        <div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs">DEIN INTERESSEN-KOMPASS</p><h2 id="quiz-titel" className="mt-3 font-display text-2xl font-bold">Was würdest du gern ausprobieren?</h2></div><button className="chip shrink-0" onClick={() => dialog.current?.close()} aria-label="Interessen-Kompass schließen">✕</button></div><p className="mt-4 text-sm">Wähle ein oder mehrere Bilder. Es gibt kein Richtig oder Falsch. Deine Auswahl wird nicht an uns gesendet.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{INTERESSEN.map((i) => <button key={i.id} className="interesse" aria-pressed={interessen.includes(i.id)} onClick={() => setInteressen((vorher) => vorher.includes(i.id) ? vorher.filter((id) => id !== i.id) : [...vorher, i.id])}><Symbol name={i.symbol} className="!size-12 mx-auto"/><span className="mt-3 block text-sm font-bold">{i.text}</span></button>)}</div>
          <button className="knopf knopf-primaer mt-6 w-full justify-center" disabled={interessen.length === 0} onClick={auswerten}>Meine Missionen entdecken →</button>
        </div>
      </dialog>
    </Rahmen>
  );
}
