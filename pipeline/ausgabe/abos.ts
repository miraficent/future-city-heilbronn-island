import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Angebot, Thema, Zielgruppe } from "../../src/lib/angebot";
import { erzeugeIcs } from "../../src/lib/ics";

export const ABO_GRUPPEN: Array<{ id: string; name: string; zielgruppen: Zielgruppe[] }> = [
  { id: "kinder", name: "für Kinder", zielgruppen: ["kinder"] },
  { id: "teens", name: "für Teens", zielgruppen: ["teens"] },
  { id: "eltern", name: "für Eltern & Familien", zielgruppen: ["eltern", "familien", "erwachsene", "fachkraefte"] },
];

/** Schreibt je Thema × Gruppe einen abonnierbaren Kalender sowie alle.ics. */
export async function schreibeAbos(angebote: Angebot[], themen: Thema[], ordner: string): Promise<string[]> {
  await mkdir(ordner, { recursive: true });
  for (const datei of await readdir(ordner)) if (datei.endsWith(".ics")) await rm(path.join(ordner, datei));

  const geschrieben: string[] = [];
  const schreibe = async (name: string, titel: string, liste: Angebot[]) => {
    await writeFile(path.join(ordner, name), erzeugeIcs(liste, titel));
    geschrieben.push(name);
  };

  await schreibe("alle.ics", "COSMOS-Entdecker – alle Angebote", angebote);
  for (const thema of themen) {
    for (const gruppe of ABO_GRUPPEN) {
      const liste = angebote.filter((a) => a.themen.includes(thema.id) && a.zielgruppen.some((z) => gruppe.zielgruppen.includes(z)));
      await schreibe(`${thema.id}-${gruppe.id}.ics`, `${thema.name} ${gruppe.name} – COSMOS-Entdecker`, liste);
    }
  }
  return geschrieben;
}
