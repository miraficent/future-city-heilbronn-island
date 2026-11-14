import { Symbol } from "../symbol";

const standFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long" });

/** Kopf der Eltern-Seite: kurz, damit die Wünsche des Kindes auf dem Handy gleich sichtbar sind. */
export function ElternKopf({ anzahl, kostenlos, einrichtungen, stand }: { anzahl: number; kostenlos: number; einrichtungen: string[]; stand: string }) {
  const namen = einrichtungen.length > 1 ? `${einrichtungen.slice(0, -1).join(", ")} und ${einrichtungen.at(-1)}` : einrichtungen.join("");
  return (
    <header className="el-kopf">
      <p className="el-oben"><Symbol name="users" /> Für Eltern und Fachkräfte</p>
      <h1>Kurse zu KI, Coding und Gaming für Ihr Kind</h1>
      <p className="el-kopf__text">
        Alle Angebote von {namen} in Heilbronn an einem Ort. Sie finden hier, was passt – und melden Ihr Kind direkt beim Anbieter an.
      </p>
      <ul className="el-fakten" aria-label="Auf einen Blick">
        <li className="el-fakt"><Symbol name="calendar" /><strong>{anzahl}</strong> Angebote mit Termin</li>
        <li className="el-fakt"><Symbol name="euro" /><strong>{kostenlos}</strong> davon kostenlos</li>
        <li className="el-fakt el-fakt--extra"><Symbol name="building" /><strong>{einrichtungen.length}</strong> Einrichtungen</li>
        <li className="el-fakt el-fakt--extra"><Symbol name="refresh" />Stand: {standFormat.format(new Date(stand))}</li>
      </ul>
    </header>
  );
}
