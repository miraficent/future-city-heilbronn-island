"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { erzeugeIcs } from "@/lib/ics";
import { ladeLiveEventsVor } from "@/lib/live-events";
import {
  aktiveFilter,
  elternSuche,
  LEERER_ELTERN_FILTER,
  nachZeitGruppieren,
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
import { FilterSymbol } from "./symbole";
import { Terminband } from "./terminband";

/** So viele Karten auf einmal – danach „Weitere zeigen“. Hält die Seite kurz, vor allem auf dem Handy. */
const SCHRITT = 10;

const angeboteText = (n: number) => (n === 1 ? "1 Angebot" : `${n} Angebote`);

/**
 * Eltern-Suche: Suchfeld, Filter (links bzw. als Blatt auf dem Handy), Terminband,
 * Ergebnisse nach Woche/Monat und eine Merkliste, die sich als Link teilen lässt.
 * Filter und Suchtext bleiben nur im Arbeitsspeicher dieser Seite.
 */
export function ElternSuche({ angebote: kurse, meta: grundMeta, jetzt: start }: { angebote: Angebot[]; meta: Meta; jetzt: string }) {
  const jetzt = useJetzt(start);
  const { status, alle: angebote, meta } = useElternDaten(kurse, grundMeta);
  const [filter, setFilter] = useState<ElternFilter>(LEERER_ELTERN_FILTER);
  const [anzahl, setAnzahl] = useState(SCHRITT);
  const [blattOffen, setBlattOffen] = useState(false);
  const [nurGemerkt, setNurGemerkt] = useState(false);
  const [meldung, setMeldung] = useState("");
  const ergebnisRef = useRef<HTMLHeadingElement>(null);
  const merk = useSammlung("eltern");

  const namen = useMemo(() => ({
    themen: Object.fromEntries(meta.themen.map((t) => [t.id, t.name])),
    quellen: Object.fromEntries(meta.quellen.map((q) => [q.id, kurzname(q, q.id)])),
  }), [meta]);

  const treffer = useMemo(() => elternSuche(angebote, filter, new Date(jetzt)), [angebote, filter, jetzt]);
  const band = useMemo(() => terminband(angebote, filter, new Date(jetzt), filter.zeitraum === "woche" ? 7 : 28), [angebote, filter, jetzt]);
  const zahlen = useMemo(() => {
    const zaehle = (teil: Partial<ElternFilter>) => elternSuche(angebote, { ...filter, ...teil }, new Date(jetzt)).length;
    return {
      themen: Object.fromEntries(meta.themen.map((t) => [t.id, zaehle({ themen: [t.id] })])),
      quellen: Object.fromEntries(meta.quellen.map((q) => [q.id, zaehle({ quellen: [q.id] })])),
    };
  }, [angebote, filter, jetzt, meta]);
  const gemerkt = useMemo(
    () => elternSuche(angebote.filter((a) => merk.ids.includes(a.id)), LEERER_ELTERN_FILTER, new Date(jetzt)),
    [angebote, merk.ids, jetzt],
  );

  const liste = nurGemerkt ? gemerkt : treffer;
  const gruppen = nachZeitGruppieren(liste.slice(0, anzahl), new Date(jetzt));
  const aktiv = aktiveFilter(filter, namen);
  const filterZahl = aktiv.filter((f) => f.id !== "suche").length;
  const titel = nurGemerkt ? "Ihre Merkliste" : aktiv.length > 0 ? "Passende Angebote" : "Alle kommenden Angebote";

  function setze(neu: ElternFilter) {
    setFilter(neu);
    setAnzahl(SCHRITT);
    setNurGemerkt(false);
  }
  const aendere = (teil: Partial<ElternFilter>) => setze({ ...filter, ...teil });

  function zurListe() {
    setBlattOffen(false);
    ergebnisRef.current?.scrollIntoView({ block: "start" });
    ergebnisRef.current?.focus({ preventScroll: true });
  }

  /** Die angezeigten Treffer als Kalenderdatei – erzeugt im Browser, nichts wird gesendet. */
  function kalenderLaden() {
    const datei = new Blob([erzeugeIcs(liste.map((t) => t.angebot), "Heilbronn Island", new Date(jetzt))], { type: "text/calendar;charset=utf-8" });
    const objektUrl = URL.createObjectURL(datei);
    const link = document.createElement("a");
    link.href = objektUrl;
    link.download = "heilbronn-island-termine.ics";
    link.click();
    setTimeout(() => URL.revokeObjectURL(objektUrl), 1000);
  }

  async function merklisteTeilen() {
    const link = `${window.location.origin}/sammlung/?ids=${gemerkt.map((t) => encodeURIComponent(t.angebot.id)).join(",")}`;
    try {
      await navigator.clipboard.writeText(link);
      setMeldung("Link kopiert. Sie können ihn jetzt zum Beispiel per Nachricht teilen.");
    } catch {
      setMeldung(`Bitte kopieren Sie diesen Link: ${link}`);
    }
  }

  const formular = (kopf?: ReactNode) => <FilterFormular filter={filter} aendere={aendere} meta={meta} zahlen={zahlen} kopf={kopf} />;

  return (
    <section id="suche" className="el-suche" aria-labelledby="suche-titel">
      <div className="el-suche__kopf">
        <h2 id="suche-titel">Angebote finden</h2>
        <p>Suchen Sie nach Thema, Alter oder Tag. Anmelden können Sie sich direkt beim Anbieter.</p>
      </div>

      <div className="el-suchfeld" role="search">
        <Symbol name="search" />
        <label className="nur-screenreader" htmlFor="el-suchtext">Angebote durchsuchen</label>
        <input
          id="el-suchtext"
          type="search"
          value={filter.suche}
          maxLength={100}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="z. B. Scratch, Roboter, Python"
          onChange={(e) => aendere({ suche: e.target.value })}
        />
        {filter.suche && (
          <button type="button" className="el-suchfeld__leeren" aria-label="Suchtext löschen" onClick={() => aendere({ suche: "" })}>
            <Symbol name="close" />
          </button>
        )}
      </div>

      <div className="el-raster">
        <aside className="el-seitenleiste" aria-label="Filter">
          <Card>
            {formular(
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2"><FilterSymbol /> Filter</h2>
                {aktiv.length > 0 && <button type="button" className="el-textknopf" onClick={() => setze(LEERER_ELTERN_FILTER)}>Zurücksetzen</button>}
              </div>,
            )}
          </Card>
        </aside>

        <div>
          <div className="el-handyleiste">
            <Button variante="ghost" onClick={() => setBlattOffen(true)} ariaLabel={`Filter öffnen${filterZahl ? `, ${filterZahl} aktiv` : ""}`}>
              <span className="inline-flex items-center gap-2"><FilterSymbol /> Filter {filterZahl > 0 && <span className="el-zahl">{filterZahl}</span>}</span>
            </Button>
            <span className="el-handyleiste__zahl">{angeboteText(liste.length)}</span>
          </div>

          {!nurGemerkt && <Terminband tage={band} gewaehlt={filter.tag} waehlen={(tag) => aendere({ tag })} />}

          {!nurGemerkt && aktiv.length > 0 && (
            <div className="el-aktiv" aria-label="Aktive Filter">
              {aktiv.map((f) => (
                <button key={f.id} type="button" className="el-aktiv__chip" aria-label={`Filter entfernen: ${f.text}`} onClick={() => setze(f.ohne)}>
                  {f.text} <Symbol name="close" />
                </button>
              ))}
              {aktiv.length > 1 && <button type="button" className="el-textknopf" onClick={() => setze(LEERER_ELTERN_FILTER)}>Alle entfernen</button>}
            </div>
          )}

          <div className="el-ergebnis__kopf">
            <h3 id="ergebnis" ref={ergebnisRef} tabIndex={-1}>
              {titel} <span className="font-sans text-base font-normal text-ink-soft">({liste.length})</span>
            </h3>
            <Button variante="ghost" ariaPressed={nurGemerkt} onClick={() => { setNurGemerkt(!nurGemerkt); setAnzahl(SCHRITT); setMeldung(""); }}>
              <span className="inline-flex items-center gap-2"><Symbol name="star" /> Gemerkt <span className="el-zahl">{gemerkt.length}</span></span>
            </Button>
          </div>
          <p className="nur-screenreader" aria-live="polite">{nurGemerkt ? `${angeboteText(liste.length)} auf Ihrer Merkliste` : `${angeboteText(liste.length)} gefunden`}</p>

          {nurGemerkt && gemerkt.length > 0 && (
            <div className="el-merkleiste">
              <label className="el-schalter"><input type="checkbox" checked={merk.dauerhaft} onChange={(e) => merk.behalten(e.target.checked)} />Auf diesem Gerät behalten</label>
              <button type="button" className="el-textknopf" onClick={merklisteTeilen}><Symbol name="share" /> Als Link teilen</button>
              <button type="button" className="el-textknopf" onClick={merk.leeren}><Symbol name="close" /> Liste leeren</button>
              <p role="status" className="w-full text-sm empty:hidden">{meldung}</p>
            </div>
          )}

          {angebote.length === 0 && status !== "ok" ? (
            status === "laedt" ? (
              <EmptyState text="Die aktuellen Termine werden geladen …" />
            ) : (
              <EmptyState text="Die Termine konnten gerade nicht geladen werden. Bitte versuchen Sie es in ein paar Minuten noch einmal.">
                <Button variante="primary" icon="refresh" onClick={ladeLiveEventsVor}>Erneut versuchen</Button>
              </EmptyState>
            )
          ) : liste.length === 0 ? (
            nurGemerkt ? (
              <EmptyState text="Noch nichts gemerkt. Tippen Sie bei einem Angebot auf „Merken“ – es bleibt dann in diesem Browserfenster.">
                <Button variante="primary" onClick={() => setNurGemerkt(false)}>Alle Angebote zeigen</Button>
              </EmptyState>
            ) : (
              <EmptyState text="Dazu gibt es gerade kein Angebot. Entfernen Sie einen Filter oder wählen Sie einen längeren Zeitraum. Wir zeigen nur echte Termine.">
                <Button variante="primary" onClick={() => setze(LEERER_ELTERN_FILTER)}>Alle Filter entfernen</Button>
                {filter.suche.trim().length >= 2 && <FehltMelden key={filter.suche} begriff={filter.suche} alter={filter.alter} />}
              </EmptyState>
            )
          ) : (
            gruppen.map((g) => (
              <section key={g.titel} className="el-gruppe" aria-label={g.titel}>
                <h4 className="el-gruppe__titel">{g.titel}</h4>
                <ul className="el-liste">
                  {g.treffer.map((t) => (
                    <li key={t.angebot.id}>
                      <ElternKarte angebot={t.angebot} termin={t.termin} weitere={t.weitere} meta={meta} jetzt={jetzt} gemerkt={merk.ids.includes(t.angebot.id)} merken={merk.merken} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}

          {liste.length > anzahl && (
            <Button variante="ghost" className="el-mehr" onClick={() => setAnzahl(anzahl + SCHRITT)}>
              Weitere Angebote zeigen (noch {liste.length - anzahl})
            </Button>
          )}

          {liste.length > 0 && (
            <div className="el-abo">
              <div>
                <h2><Symbol name="calendar" /> Termine in Ihren Kalender</h2>
                <p>Laden Sie {liste.length === 1 ? "diesen Termin" : `diese ${liste.length} Termine`} als Kalenderdatei – passend für Outlook, Google und Apple. Freie Plätze bitte vorher beim Anbieter prüfen.</p>
              </div>
              <Button variante="ghost" icon="calendar" onClick={kalenderLaden}>Kalenderdatei laden</Button>
            </div>
          )}
        </div>
      </div>

      <BottomSheet offen={blattOffen} onSchliessen={() => setBlattOffen(false)} titel="Filter">
        {formular(<h2 className="flex items-center gap-2"><FilterSymbol /> Filter</h2>)}
        <div className="el-blatt-fuss">
          <button type="button" className="el-textknopf" onClick={() => setze(LEERER_ELTERN_FILTER)}>Zurücksetzen</button>
          <Button variante="primary" onClick={zurListe}>{angeboteText(liste.length)} zeigen</Button>
        </div>
      </BottomSheet>
    </section>
  );
}
