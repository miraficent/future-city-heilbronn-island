"use client";

/**
 * Eltern-Seite ganz oben: „Das möchte Ihr Kind besuchen“ – was das Kind im Kinderbereich mit
 * „Da will ich hin!“ gewählt hat (Kurse und Live-Events). Groß, mit Datum, Ort, Preis und Anmeldelink.
 * Die Wünsche liegen nur in dieser Browsersitzung auf diesem Gerät. Ohne Wünsche erklären drei Schritte,
 * wie sie hierherkommen.
 */
import { useMemo } from "react";
import type { Angebot } from "@/lib/angebot";
import { kindWuensche, tagSchluessel, type Wunsch } from "@/lib/eltern-suche";
import { formatTag, formatZeit, relativ } from "@/lib/format";
import type { LiveEvent } from "@/types";
import { useJetzt } from "./browser-werte";
import { DatumBlock } from "./eltern/datum-block";
import { useSammlung } from "./sammlung";
import { Symbol } from "./symbol";
import { Badge, Button, Owl } from "./ui";

function WunschKarte({ w, jetzt, entfernen }: { w: Wunsch; jetzt: string; entfernen: () => void }) {
  const zeit = w.ende ? `${formatZeit(w.start)}–${formatZeit(w.ende)} Uhr` : `${formatZeit(w.start)} Uhr`;
  return (
    <li className="el-wunschkarte el-einblenden">
      <DatumBlock iso={w.start} heute={tagSchluessel(w.start) === tagSchluessel(jetzt)} />
      <div>
        <h3>{w.titel}</h3>
        <ul className="el-infos">
          <li><Symbol name="clock" /><span><strong>{formatTag(w.start)}</strong>, {zeit}{!w.vorbei && <> · {relativ(w.start, new Date(jetzt))}</>}</span></li>
          <li><Symbol name="pin" /><span className="nur-screenreader">Ort: </span>{w.einrichtung}{w.ort && w.ort !== w.einrichtung ? `, ${w.ort}` : ""}</li>
          <li><Symbol name="cake" /><span className="nur-screenreader">Alter: </span>{w.alter}</li>
          <li><Symbol name="euro" /><span className="nur-screenreader">Preis: </span>{w.preis}</li>
        </ul>
        {(w.vorbei || w.beispiel || w.status === "ausgebucht" || w.status === "wenige") && (
          <div className="el-wunschkarte__badges">
            {w.vorbei && <Badge>Termin ist vorbei</Badge>}
            {w.beispiel && <Badge art="demo">Beispiel</Badge>}
            {w.status === "ausgebucht" && <Badge>Ausgebucht</Badge>}
            {w.status === "wenige" && <Badge art="accent">Nur noch wenige Plätze</Badge>}
          </div>
        )}
      </div>
      <div className="el-wunschkarte__aktionen">
        {w.vorbei || w.status === "ausgebucht" ? (
          <Button variante="ghost" icon="external" href={w.anmeldeUrl} ariaLabel={`Beim Anbieter ansehen: ${w.titel}`}>Beim Anbieter ansehen</Button>
        ) : (
          <Button variante="primary" icon="external" href={w.anmeldeUrl} ariaLabel={`Zur Anmeldung: ${w.titel} (öffnet die Seite von ${w.einrichtung})`}>Zur Anmeldung</Button>
        )}
        {w.detailPfad && <Button variante="ghost" href={w.detailPfad} ariaLabel={`Details zu ${w.titel}`}>Details</Button>}
        <button type="button" className="el-textknopf" onClick={entfernen} aria-label={`${w.titel} von der Wunschliste nehmen`}>
          <Symbol name="close" /> Entfernen
        </button>
      </div>
    </li>
  );
}

function LeererWunschzettel() {
  return (
    <section aria-labelledby="kind-wuensche" className="el-wunsch-leer">
      <div className="el-wunsch-leer__kopf">
        <Owl />
        <h2 id="kind-wuensche">Hat Ihr Kind schon etwas ausgesucht?</h2>
      </div>
      <ol className="el-schritte">
        <li>Ihr Kind entdeckt im Kinderbereich die Orte in Heilbronn.</li>
        <li>Gefällt ihm etwas, tippt es auf „Da will ich hin!“.</li>
        <li>Der Wunsch erscheint hier – mit Datum, Ort, Preis und Anmeldelink.</li>
      </ol>
      <Button variante="ghost" icon="map" href="/kinder/">Zum Kinderbereich</Button>
    </section>
  );
}

export function KindWuensche({ angebote, liveEvents, einrichtungen, jetzt: start }: {
  angebote: Angebot[]; liveEvents: LiveEvent[]; einrichtungen: Record<string, string>; jetzt: string;
}) {
  const merk = useSammlung("kind");
  const jetzt = useJetzt(start);
  const liste = useMemo(() => kindWuensche(merk.ids, angebote, liveEvents, einrichtungen, new Date(jetzt)), [merk.ids, angebote, liveEvents, einrichtungen, jetzt]);

  // Auf dem Server gibt es keine Browsersitzung – erst danach wissen wir, ob Wünsche da sind.
  if (!merk.geladen) return null;
  if (liste.length === 0) return <LeererWunschzettel />;

  const kommend = liste.filter((w) => !w.vorbei).length;
  return (
    <section aria-labelledby="kind-wuensche" className="el-wunsch">
      <div className="el-wunsch__kopf">
        <div>
          <p className="el-wunsch__oben"><Symbol name="heart" /> Aus dem Kinderbereich</p>
          <h2 id="kind-wuensche">Das möchte Ihr Kind besuchen</h2>
          <p className="el-wunsch__unter">
            {liste.length === 1 ? "1 Wunsch" : `${liste.length} Wünsche`}
            {kommend < liste.length && ` · ${kommend} davon noch geplant`} · Anmeldung direkt beim Anbieter
          </p>
        </div>
        <Owl className="el-wunsch__eule" />
      </div>
      <ul className="el-wunsch__liste">
        {liste.map((w) => <WunschKarte key={w.id} w={w} jetzt={jetzt} entfernen={() => merk.merken(w.id)} />)}
      </ul>
      <p className="el-wunsch__fuss">
        <Symbol name="info" />
        Die Wünsche sind nur auf diesem Gerät gespeichert, bis das Browserfenster geschlossen wird. Wir sehen sie nicht.
      </p>
    </section>
  );
}
