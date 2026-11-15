"use client";

/**
 * Eltern-Seite ganz oben: „Das möchte Ihr Kind besuchen“ – was das Kind im Kinderbereich mit
 * „Da will ich hin!“ gewählt hat (Kurse und Live-Events). Groß, mit Datum, Ort, Preis und Anmeldelink.
 * Die Wünsche liegen nur in dieser Browsersitzung auf diesem Gerät. Die Live-Events kommen aus Mobilizon
 * (src/lib/live-events.ts). Ohne Wünsche erklären drei Schritte, wie sie hierherkommen.
 */
import { useMemo } from "react";
import type { Angebot } from "@/lib/angebot";
import { kindWuensche, tagSchluessel, type Sprache, type Wunsch } from "@/lib/eltern-suche";
import { useLiveEvents } from "@/lib/live-events";
import { useJetzt } from "./browser-werte";
import { DatumBlock } from "./eltern/datum-block";
import { datum, useSprache } from "./eltern/sprache";
import { TEXTE } from "./eltern/texte";
import { useSammlung } from "./sammlung";
import { Symbol } from "./symbol";
import { Badge, Button, Owl } from "./ui";

function WunschKarte({ w, jetzt, sprache, entfernen }: { w: Wunsch; jetzt: string; sprache: Sprache; entfernen: () => void }) {
  const t = TEXTE[sprache].wunsch;
  const k = TEXTE[sprache].karte;
  const d = datum(sprache);
  return (
    <li className="el-wunschkarte el-einblenden">
      <DatumBlock iso={w.start} heute={tagSchluessel(w.start) === tagSchluessel(jetzt)} />
      <div>
        <h3 lang="de">{w.titel}</h3>
        <ul className="el-infos">
          <li><Symbol name="clock" /><span><strong>{d.tagKurz(w.start)}</strong>, {d.zeit(w.start, w.ende)}{!w.vorbei && <> · {d.relativ(w.start, new Date(jetzt))}</>}</span></li>
          <li><Symbol name="pin" /><span className="nur-screenreader">{k.ort}</span>{w.einrichtung}{w.ort && w.ort !== w.einrichtung ? `, ${w.ort}` : ""}</li>
          <li><Symbol name="cake" /><span className="nur-screenreader">{k.alter}</span>{w.alter}</li>
          <li><Symbol name="euro" /><span className="nur-screenreader">{k.preis}</span>{w.preis}</li>
        </ul>
        {(w.vorbei || w.beispiel || w.status === "ausgebucht" || w.status === "wenige") && (
          <div className="el-wunschkarte__badges">
            {w.vorbei && <Badge>{t.vorbei}</Badge>}
            {w.beispiel && <Badge art="demo">{t.beispiel}</Badge>}
            {w.status === "ausgebucht" && <Badge>{t.ausgebucht}</Badge>}
            {w.status === "wenige" && <Badge art="accent">{t.wenige}</Badge>}
          </div>
        )}
      </div>
      <div className="el-wunschkarte__aktionen">
        {w.vorbei || w.status === "ausgebucht" ? (
          <Button variante="ghost" icon="external" href={w.anmeldeUrl} ariaLabel={k.anmeldenLabel(k.ansehen, w.titel, w.einrichtung)}>{k.ansehen}</Button>
        ) : (
          <Button variante="primary" icon="external" href={w.anmeldeUrl} ariaLabel={k.anmeldenLabel(k.anmelden, w.titel, w.einrichtung)}>{k.anmelden}</Button>
        )}
        {w.detailPfad && <Button variante="ghost" href={w.detailPfad} ariaLabel={k.detailsLabel(w.titel)}>{k.details}</Button>}
        <button type="button" className="el-textknopf" onClick={entfernen} aria-label={t.entfernenLabel(w.titel)}>
          <Symbol name="close" /> {t.entfernen}
        </button>
      </div>
    </li>
  );
}

function LeererWunschzettel({ sprache }: { sprache: Sprache }) {
  const t = TEXTE[sprache].wunsch;
  return (
    <section aria-labelledby="kind-wuensche" className="el-wunsch-leer">
      <div className="el-wunsch-leer__kopf">
        <Owl />
        <h2 id="kind-wuensche">{t.leerTitel}</h2>
      </div>
      <ol className="el-schritte">
        {t.schritte.map((s) => <li key={s}>{s}</li>)}
      </ol>
      <Button variante="ghost" icon="map" href="/kinder/">{t.zumKinderbereich}</Button>
    </section>
  );
}

export function KindWuensche({ angebote, einrichtungen, jetzt: start }: { angebote: Angebot[]; einrichtungen: Record<string, string>; jetzt: string }) {
  const merk = useSammlung("kind");
  const liveEvents = useLiveEvents().events;
  const jetzt = useJetzt(start);
  const sprache = useSprache();
  const t = TEXTE[sprache].wunsch;
  const liste = useMemo(
    () => kindWuensche(merk.ids, angebote, liveEvents, einrichtungen, new Date(jetzt), sprache),
    [merk.ids, angebote, liveEvents, einrichtungen, jetzt, sprache],
  );

  // Auf dem Server gibt es keine Browsersitzung – erst danach wissen wir, ob Wünsche da sind.
  if (!merk.geladen) return null;
  if (liste.length === 0) return <LeererWunschzettel sprache={sprache} />;

  const kommend = liste.filter((w) => !w.vorbei).length;
  return (
    <section aria-labelledby="kind-wuensche" className="el-wunsch">
      <div className="el-wunsch__kopf">
        <div>
          <p className="el-wunsch__oben"><Symbol name="heart" /> {t.oben}</p>
          <h2 id="kind-wuensche">{t.titel}</h2>
          <p className="el-wunsch__unter">
            {t.anzahl(liste.length)}
            {kommend < liste.length && ` · ${t.geplant(kommend)}`} · {t.anmeldung}
          </p>
        </div>
        <Owl className="el-wunsch__eule" />
      </div>
      <ul className="el-wunsch__liste">
        {liste.map((w) => <WunschKarte key={w.id} w={w} jetzt={jetzt} sprache={sprache} entfernen={() => merk.merken(w.id)} />)}
      </ul>
      <p className="el-wunsch__fuss">
        <Symbol name="info" />
        {t.fuss}
      </p>
    </section>
  );
}
