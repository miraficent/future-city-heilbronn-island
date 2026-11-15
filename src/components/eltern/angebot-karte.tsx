import Link from "next/link";
import type { CSSProperties } from "react";
import type { Angebot, Termin } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { alterHinweis, ART_TEXTE, kurzTitel, ortText, preisText, tagSchluessel } from "@/lib/eltern-suche";
import { slugAusId } from "@/lib/routen";
import { kurzname } from "../einrichtung-badge";
import { Symbol } from "../symbol";
import { Badge, Button } from "../ui";
import { DatumBlock } from "./datum-block";
import { datum, useSprache } from "./sprache";
import { TEXTE, type Texte } from "./texte";

/** Plätze nur zeigen, wenn der Anbieter etwas gemeldet hat. */
function PlatzBadge({ status, t }: { status: Angebot["status"]; t: Texte["karte"] }) {
  if (status === "frei") return <Badge art="success" icon="check">{t.frei}</Badge>;
  if (status === "wenige") return <Badge art="accent">{t.wenige}</Badge>;
  if (status === "ausgebucht") return <Badge>{t.ausgebucht}</Badge>;
  return null;
}

/**
 * Ein Angebot in der Eltern-Suche: Kalenderblatt, Einrichtung, Titel, Alter, Uhrzeit, Ort, Preis,
 * kurze Beschreibung und der offizielle Anmeldelink. Die Anmeldung läuft immer beim Anbieter.
 */
export function ElternKarte({ angebot: a, termin, weitere, meta, jetzt, gemerkt, merken }: {
  angebot: Angebot; termin: Termin; weitere: number; meta: Meta; jetzt: string; gemerkt: boolean; merken: (id: string) => void;
}) {
  const sprache = useSprache();
  const t = TEXTE[sprache].karte;
  const d = datum(sprache);
  const quelle = meta.quellen.find((q) => q.id === a.quelle);
  const einrichtung = kurzname(quelle, a.quelle);
  const titel = kurzTitel(a.titel);
  const alter = alterHinweis(a, sprache);
  const themen = a.themen.map((id) => meta.themen.find((x) => x.id === id)?.name ?? id);
  const detail = `/angebot/${slugAusId(a.id)}/`;
  const ausgebucht = a.status === "ausgebucht";
  // Live-Events („ev:…“) haben keine eigene Detailseite – dort führt alles direkt zum Anbieter.
  const hatDetails = !a.id.startsWith("ev:");
  const titelId = `karte-${slugAusId(a.id).replace(/[^\w-]/g, "-")}`;
  const aktion = ausgebucht ? t.ansehen : t.anmelden;

  return (
    <article className="el-karte el-einblenden" aria-labelledby={titelId}>
      <DatumBlock iso={termin.start} heute={tagSchluessel(termin.start) === tagSchluessel(jetzt)} />
      <div>
        <p className="el-karte__oben">
          <span className="el-einrichtung" style={{ ["--farbe" as string]: quelle?.farbe } as CSSProperties}><i aria-hidden="true" />{einrichtung}</span>
          <span>{ART_TEXTE[sprache][a.art]}</span>
          <span>{themen.join(" · ")}</span>
        </p>
        <h3 id={titelId}>{hatDetails ? <Link href={detail}>{titel}</Link> : titel}</h3>
        <ul className="el-infos">
          <li><Symbol name="cake" /><span className="nur-screenreader">{t.alter}</span>{alter.text}</li>
          <li><Symbol name="clock" /><span className="nur-screenreader">{d.tagLang(termin.start)}, </span>{d.zeit(termin.start, termin.ende)}</li>
          <li><Symbol name="pin" /><span className="nur-screenreader">{t.ort}</span>{ortText(a)}</li>
          <li><Symbol name="euro" /><span className="nur-screenreader">{t.preis}</span>{preisText(a, sprache)}</li>
        </ul>
        {a.teaser && <p className="el-karte__text" lang="de">{a.teaser}</p>}
        {(a.status !== "unbekannt" || weitere > 0) && (
          <div className="el-karte__badges">
            <PlatzBadge status={a.status} t={t} />
            {weitere > 0 && <Badge icon="calendar">{t.weitere(weitere)}</Badge>}
          </div>
        )}
      </div>
      <div className="el-karte__aktionen">
        <Button variante={ausgebucht ? "ghost" : "primary"} icon="external" href={a.url} ariaLabel={t.anmeldenLabel(aktion, titel, einrichtung)}>{aktion}</Button>
        {hatDetails && <Button variante="ghost" href={detail} ariaLabel={t.detailsLabel(titel)}>{t.details}</Button>}
        <button type="button" className="el-merken" aria-pressed={gemerkt} aria-label={t.merkenLabel(titel, gemerkt)} onClick={() => merken(a.id)}>
          <Symbol name="star" />{gemerkt ? t.gemerkt : t.merken}
        </button>
      </div>
    </article>
  );
}
