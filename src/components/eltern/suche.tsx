"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { erzeugeIcs } from "@/lib/ics";
import { ladeLiveEventsVor } from "@/lib/live-events";
import {
  aktiveFilter,
  elternSuche,
  LEERER_ELTERN_FILTER,
  nachZeitGruppieren,
  tagesZahlen,
  tagSchluessel,
  terminband,
  type ElternFilter,
} from "@/lib/eltern-suche";
import { useJetzt } from "../browser-werte";
import { kurzname } from "../einrichtung-badge";
import { useSammlung } from "../sammlung";
import { Symbol } from "../symbol";
import { BottomSheet, Button, Card, EmptyState } from "../ui";
import { FehltMelden } from "../wunsch-box";
import { ElternKarte } from "./angebot-karte";
import { useElternDaten } from "./daten";
import { FilterFormular } from "./filter-formular";
import { FILTER_EREIGNIS } from "./kopf";
import { useSprache } from "./sprache";
import { FilterSymbol } from "./symbole";
import { Terminband } from "./terminband";
import { TEXTE } from "./texte";

/** So viele Karten auf einmal – danach „Weitere zeigen“. Hält die Seite kurz, vor allem auf dem Handy. */
const SCHRITT = 10;

/**
 * Eltern-Suche: Suchfeld, Filter (links bzw. als Blatt auf dem Handy), Terminband,
 * Ergebnisse nach Woche/Monat und eine Merkliste, die sich als Link teilen lässt.
 * Filter und Suchtext bleiben nur im Arbeitsspeicher dieser Seite.
 */
export function ElternSuche({ angebote: kurse, meta: grundMeta, jetzt: start }: { angebote: Angebot[]; meta: Meta; jetzt: string }) {
  const jetzt = useJetzt(start);
  const sprache = useSprache();
  const t = TEXTE[sprache].suche;
  const { status, alle: angebote, meta } = useElternDaten(kurse, grundMeta);
  const [filter, setFilter] = useState<ElternFilter>(LEERER_ELTERN_FILTER);
  const [anzahl, setAnzahl] = useState(SCHRITT);
  const [blattOffen, setBlattOffen] = useState(false);
  const [nurGemerkt, setNurGemerkt] = useState(false);
  const [meldung, setMeldung] = useState("");
  const ergebnisRef = useRef<HTMLHeadingElement>(null);
  const merk = useSammlung("eltern");

  const namen = useMemo(() => ({
    themen: Object.fromEntries(meta.themen.map((x) => [x.id, x.name])),
    quellen: Object.fromEntries(meta.quellen.map((q) => [q.id, kurzname(q, q.id)])),
  }), [meta]);

  const treffer = useMemo(() => elternSuche(angebote, filter, new Date(jetzt)), [angebote, filter, jetzt]);
  const band = useMemo(() => terminband(angebote, filter, new Date(jetzt), filter.zeitraum === "woche" ? 7 : 28), [angebote, filter, jetzt]);
  const tage = useMemo(() => tagesZahlen(angebote, filter, new Date(jetzt)), [angebote, filter, jetzt]);
  const zahlen = useMemo(() => {
    const zaehle = (teil: Partial<ElternFilter>) => elternSuche(angebote, { ...filter, ...teil }, new Date(jetzt)).length;
    return {
      themen: Object.fromEntries(meta.themen.map((x) => [x.id, zaehle({ themen: [x.id] })])),
      quellen: Object.fromEntries(meta.quellen.map((q) => [q.id, zaehle({ quellen: [q.id] })])),
    };
  }, [angebote, filter, jetzt, meta]);
  const gemerkt = useMemo(
    () => elternSuche(angebote.filter((a) => merk.ids.includes(a.id)), LEERER_ELTERN_FILTER, new Date(jetzt)),
    [angebote, merk.ids, jetzt],
  );

  const liste = nurGemerkt ? gemerkt : treffer;
  const gruppen = nachZeitGruppieren(liste.slice(0, anzahl), new Date(jetzt), sprache);
  const aktiv = aktiveFilter(filter, namen, sprache);
  const filterZahl = aktiv.filter((f) => f.id !== "suche").length;
  const titel = nurGemerkt ? t.merkliste : aktiv.length > 0 ? t.passende : t.alle;

  function setze(neu: ElternFilter) {
    setFilter(neu);
    setAnzahl(SCHRITT);
    setNurGemerkt(false);
  }
  const aendere = (teil: Partial<ElternFilter>) => setze({ ...filter, ...teil });

  // „Schnell finden“ im Kopf: setzt einen frischen Filter (alle anderen Filter zurück).
  useEffect(() => {
    const schnell = (e: Event) => {
      setFilter({ ...LEERER_ELTERN_FILTER, ...(e as CustomEvent<Partial<ElternFilter>>).detail });
      setAnzahl(SCHRITT);
      setNurGemerkt(false);
    };
    window.addEventListener(FILTER_EREIGNIS, schnell);
    return () => window.removeEventListener(FILTER_EREIGNIS, schnell);
  }, []);

  function zurListe() {
    setBlattOffen(false);
    ergebnisRef.current?.scrollIntoView({ block: "start" });
    ergebnisRef.current?.focus({ preventScroll: true });
  }

  /** Die angezeigten Treffer als Kalenderdatei – erzeugt im Browser, nichts wird gesendet. */
  function kalenderLaden() {
    const datei = new Blob([erzeugeIcs(liste.map((x) => x.angebot), "Heilbronn Island", new Date(jetzt))], { type: "text/calendar;charset=utf-8" });
    const objektUrl = URL.createObjectURL(datei);
    const link = document.createElement("a");
    link.href = objektUrl;
    link.download = "heilbronn-island-termine.ics";
    link.click();
    setTimeout(() => URL.revokeObjectURL(objektUrl), 1000);
  }

  async function merklisteTeilen() {
    const link = `${window.location.origin}/sammlung/?ids=${gemerkt.map((x) => encodeURIComponent(x.angebot.id)).join(",")}`;
    try {
      await navigator.clipboard.writeText(link);
      setMeldung(t.kopiert);
    } catch {
      setMeldung(t.kopieren(link));
    }
  }

  const formular = (kopf?: ReactNode) => (
    <FilterFormular filter={filter} aendere={aendere} meta={meta} zahlen={zahlen} tage={tage} heute={tagSchluessel(jetzt)} kopf={kopf} />
  );

  return (
    <section id="suche" className="el-suche" aria-labelledby="suche-titel">
      <div className="el-suche__kopf">
        <h2 id="suche-titel">{t.titel}</h2>
        <p>{t.unter}</p>
      </div>

      <div className="el-suchfeld" role="search">
        <Symbol name="search" />
        <label className="nur-screenreader" htmlFor="el-suchtext">{t.feld}</label>
        <input
          id="el-suchtext"
          type="search"
          value={filter.suche}
          maxLength={100}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={t.platzhalter}
          onChange={(e) => aendere({ suche: e.target.value })}
        />
        {filter.suche && (
          <button type="button" className="el-suchfeld__leeren" aria-label={t.leeren} onClick={() => aendere({ suche: "" })}>
            <Symbol name="close" />
          </button>
        )}
      </div>

      <div className="el-raster">
        <aside className="el-seitenleiste" aria-label={t.filter}>
          <Card>
            {formular(
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2"><FilterSymbol /> {t.filter}</h2>
                {aktiv.length > 0 && <button type="button" className="el-textknopf" onClick={() => setze(LEERER_ELTERN_FILTER)}>{t.zuruecksetzen}</button>}
              </div>,
            )}
          </Card>
        </aside>

        <div>
          <div className="el-handyleiste">
            <Button variante="ghost" onClick={() => setBlattOffen(true)} ariaLabel={t.filterOeffnen(filterZahl)}>
              <span className="inline-flex items-center gap-2"><FilterSymbol /> {t.filter} {filterZahl > 0 && <span className="el-zahl">{filterZahl}</span>}</span>
            </Button>
            <span className="el-handyleiste__zahl">{t.angebote(liste.length)}</span>
          </div>

          {!nurGemerkt && <Terminband tage={band} gewaehlt={filter.tag} waehlen={(tag) => aendere({ tag })} />}

          {!nurGemerkt && aktiv.length > 0 && (
            <div className="el-aktiv" aria-label={t.aktiv}>
              {aktiv.map((f) => (
                <button key={f.id} type="button" className="el-aktiv__chip" aria-label={t.entfernen(f.text)} onClick={() => setze(f.ohne)}>
                  {f.text} <Symbol name="close" />
                </button>
              ))}
              {aktiv.length > 1 && <button type="button" className="el-textknopf" onClick={() => setze(LEERER_ELTERN_FILTER)}>{t.alleEntfernen}</button>}
            </div>
          )}

          <div className="el-ergebnis__kopf">
            <h3 id="ergebnis" ref={ergebnisRef} tabIndex={-1}>
              {titel} <span className="font-sans text-base font-normal text-ink-soft">({liste.length})</span>
            </h3>
            <Button variante="ghost" ariaPressed={nurGemerkt} onClick={() => { setNurGemerkt(!nurGemerkt); setAnzahl(SCHRITT); setMeldung(""); }}>
              <span className="inline-flex items-center gap-2"><Symbol name="star" /> {t.gemerktKnopf} <span className="el-zahl">{gemerkt.length}</span></span>
            </Button>
          </div>
          <p className="nur-screenreader" aria-live="polite">{nurGemerkt ? t.aufListe(t.angebote(liste.length)) : t.gefunden(t.angebote(liste.length))}</p>

          {nurGemerkt && gemerkt.length > 0 && (
            <div className="el-merkleiste">
              <label className="el-schalter"><input type="checkbox" checked={merk.dauerhaft} onChange={(e) => merk.behalten(e.target.checked)} />{t.behalten}</label>
              <button type="button" className="el-textknopf" onClick={merklisteTeilen}><Symbol name="share" /> {t.teilen}</button>
              <button type="button" className="el-textknopf" onClick={merk.leeren}><Symbol name="close" /> {t.leerenListe}</button>
              <p role="status" className="w-full text-sm empty:hidden">{meldung}</p>
            </div>
          )}

          {angebote.length === 0 && status !== "ok" ? (
            status === "laedt" ? (
              <EmptyState text={t.laedt} />
            ) : (
              <EmptyState text={t.fehler}>
                <Button variante="primary" icon="refresh" onClick={ladeLiveEventsVor}>{t.nochmal}</Button>
              </EmptyState>
            )
          ) : liste.length === 0 ? (
            nurGemerkt ? (
              <EmptyState text={t.nichtsGemerkt}>
                <Button variante="primary" onClick={() => setNurGemerkt(false)}>{t.alleZeigen}</Button>
              </EmptyState>
            ) : (
              <EmptyState text={t.keinTreffer}>
                <Button variante="primary" onClick={() => setze(LEERER_ELTERN_FILTER)}>{t.filterWeg}</Button>
                {filter.suche.trim().length >= 2 && <FehltMelden key={filter.suche} begriff={filter.suche} alter={filter.alter} />}
              </EmptyState>
            )
          ) : (
            gruppen.map((g) => (
              <section key={g.titel} className="el-gruppe" aria-label={g.titel}>
                <h4 className="el-gruppe__titel">{g.titel}</h4>
                <ul className="el-liste">
                  {g.treffer.map((x) => (
                    <li key={x.angebot.id}>
                      <ElternKarte angebot={x.angebot} termin={x.termin} weitere={x.weitere} meta={meta} jetzt={jetzt} gemerkt={merk.ids.includes(x.angebot.id)} merken={merk.merken} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}

          {liste.length > anzahl && (
            <Button variante="ghost" className="el-mehr" onClick={() => setAnzahl(anzahl + SCHRITT)}>{t.mehr(liste.length - anzahl)}</Button>
          )}

          {liste.length > 0 && (
            <div className="el-abo">
              <div>
                <h2><Symbol name="calendar" /> {t.kalenderTitel}</h2>
                <p>{t.kalenderText(liste.length)}</p>
              </div>
              <Button variante="ghost" icon="calendar" onClick={kalenderLaden}>{t.kalenderKnopf}</Button>
            </div>
          )}
        </div>
      </div>

      <BottomSheet offen={blattOffen} onSchliessen={() => setBlattOffen(false)} titel={t.filter}>
        {formular(<h2 className="flex items-center gap-2"><FilterSymbol /> {t.filter}</h2>)}
        <div className="el-blatt-fuss">
          <button type="button" className="el-textknopf" onClick={() => setze(LEERER_ELTERN_FILTER)}>{t.zuruecksetzen}</button>
          <Button variante="primary" onClick={zurListe}>{t.zeigen(t.angebote(liste.length))}</Button>
        </div>
      </BottomSheet>
    </section>
  );
}
