import type { Thema } from "@/lib/angebot";
import { Symbol } from "../symbol";
import { Card } from "../ui";

/** Kalenderdateien je Thema (public/abo/, nachts neu erzeugt) – Termine für Kinder. */
export function KalenderAbo({ themen }: { themen: Thema[] }) {
  return (
    <Card className="el-abo">
      <div>
        <h2><Symbol name="calendar" /> Termine in Ihren Kalender</h2>
        <p>Laden Sie alle kommenden Termine eines Themas als Kalenderdatei. Sie passt zu Outlook, Google und Apple. Freie Plätze bitte vor der Anmeldung beim Anbieter prüfen.</p>
      </div>
      <div className="el-abo__links">
        {themen.map((t) => (
          <a key={t.id} className="ui-btn ui-btn--ghost ui-btn--parents" href={`/abo/${t.id}-kinder.ics`} download>
            <Symbol name="calendar" /><span>{t.name.split("&")[0]?.trim()}</span>
          </a>
        ))}
        <a className="ui-btn ui-btn--ghost ui-btn--parents" href="/abo/alle.ics" download><Symbol name="calendar" /><span>Alle Termine</span></a>
      </div>
    </Card>
  );
}
