import Link from "next/link";
import type { CSSProperties } from "react";
import type { Angebot, Termin } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { alterHinweis, kurzTitel, ortText, preisText, tagSchluessel } from "@/lib/eltern-suche";
import { ART_TEXT, formatTagLang, formatZeit } from "@/lib/format";
import { slugAusId } from "@/lib/routen";
import { kurzname } from "../einrichtung-badge";
import { Symbol } from "../symbol";
import { Badge, Button } from "../ui";
import { DatumBlock } from "./datum-block";

/** Plätze nur zeigen, wenn der Anbieter etwas gemeldet hat. */
function PlatzBadge({ status }: { status: Angebot["status"] }) {
  if (status === "frei") return <Badge art="success" icon="check">Plätze frei</Badge>;
  if (status === "wenige") return <Badge art="accent">Nur noch wenige Plätze</Badge>;
  if (status === "ausgebucht") return <Badge>Ausgebucht</Badge>;
  return null;
}

/**
 * Ein Angebot in der Eltern-Suche: Kalenderblatt, Einrichtung, Titel, Alter, Uhrzeit, Ort, Preis,
 * kurze Beschreibung und der offizielle Anmeldelink. Die Anmeldung läuft immer beim Anbieter.
 */
export function ElternKarte({ angebot: a, termin, weitere, meta, jetzt, gemerkt, merken }: {
  angebot: Angebot; termin: Termin; weitere: number; meta: Meta; jetzt: string; gemerkt: boolean; merken: (id: string) => void;
}) {
  const quelle = meta.quellen.find((q) => q.id === a.quelle);
  const einrichtung = kurzname(quelle, a.quelle);
  const titel = kurzTitel(a.titel);
  const alter = alterHinweis(a);
  const themen = a.themen.map((id) => meta.themen.find((t) => t.id === id)?.name ?? id);
  const zeit = termin.ende ? `${formatZeit(termin.start)}–${formatZeit(termin.ende)} Uhr` : `${formatZeit(termin.start)} Uhr`;
  const detail = `/angebot/${slugAusId(a.id)}/`;
  const ausgebucht = a.status === "ausgebucht";
  // Live-Events („ev:…“) haben keine eigene Detailseite – dort führt alles direkt zum Anbieter.
  const hatDetails = !a.id.startsWith("ev:");
  const titelId = `karte-${slugAusId(a.id).replace(/[^\w-]/g, "-")}`;

  return (
    <article className="el-karte el-einblenden" aria-labelledby={titelId}>
      <DatumBlock iso={termin.start} heute={tagSchluessel(termin.start) === tagSchluessel(jetzt)} />
      <div>
        <p className="el-karte__oben">
          <span className="el-einrichtung" style={{ ["--farbe" as string]: quelle?.farbe } as CSSProperties}><i aria-hidden="true" />{einrichtung}</span>
          <span>{ART_TEXT[a.art]}</span>
          <span>{themen.join(" · ")}</span>
        </p>
        <h3 id={titelId}>{hatDetails ? <Link href={detail}>{titel}</Link> : titel}</h3>
        <ul className="el-infos">
          <li><Symbol name="cake" /><span className="nur-screenreader">Alter: </span>{alter.text}</li>
          <li><Symbol name="clock" /><span className="nur-screenreader">{formatTagLang(termin.start)}, </span>{zeit}</li>
          <li><Symbol name="pin" /><span className="nur-screenreader">Ort: </span>{ortText(a)}</li>
          <li><Symbol name="euro" /><span className="nur-screenreader">Preis: </span>{preisText(a)}</li>
        </ul>
        {a.teaser && <p className="el-karte__text">{a.teaser}</p>}
        {(a.status !== "unbekannt" || weitere > 0) && (
          <div className="el-karte__badges">
            <PlatzBadge status={a.status} />
            {weitere > 0 && <Badge icon="calendar">{weitere === 1 ? "1 weiterer Termin" : `${weitere} weitere Termine`}</Badge>}
          </div>
        )}
      </div>
      <div className="el-karte__aktionen">
        <Button variante={ausgebucht ? "ghost" : "primary"} icon="external" href={a.url} ariaLabel={`${ausgebucht ? "Beim Anbieter ansehen" : "Zur Anmeldung"}: ${titel} (öffnet die Seite von ${einrichtung})`}>
          {ausgebucht ? "Beim Anbieter ansehen" : "Zur Anmeldung"}
        </Button>
        {hatDetails && <Button variante="ghost" href={detail} ariaLabel={`Details zu ${titel}`}>Details</Button>}
        <button type="button" className="el-merken" aria-pressed={gemerkt} aria-label={`${titel} ${gemerkt ? "von der Merkliste nehmen" : "merken"}`} onClick={() => merken(a.id)}>
          <Symbol name="star" />{gemerkt ? "Gemerkt" : "Merken"}
        </button>
      </div>
    </article>
  );
}
