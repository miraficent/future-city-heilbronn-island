import { ZIELGRUPPEN, type Angebot, type Korrektur, type Zielgruppe } from "../../src/lib/angebot";
import { zielgruppenAusAlter } from "./normalisieren";

function teile(wert: string): string[] {
  return wert
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function wendeAn(angebot: Angebot, k: Korrektur): Angebot | null {
  switch (k.aktion) {
    case "ausblenden":
      return null;
    case "thema":
      return { ...angebot, themen: teile(k.wert), sicherheit: 1, ausloeser: ["Korrektur"] };
    case "alter": {
      const [min, max] = k.wert.split("-").map((s) => Number(s.trim()));
      const alterMin = Number.isFinite(min) ? min : undefined;
      const alterMax = Number.isFinite(max) ? max : undefined;
      const { alterMin: _a, alterMax: _b, ...rest } = angebot;
      return {
        ...rest,
        ...(alterMin !== undefined ? { alterMin } : {}),
        ...(alterMax !== undefined ? { alterMax } : {}),
        zielgruppen: zielgruppenAusAlter(alterMin, alterMax),
      };
    }
    case "zielgruppe": {
      const gueltig = teile(k.wert).filter((z): z is Zielgruppe => (ZIELGRUPPEN as readonly string[]).includes(z));
      return { ...angebot, zielgruppen: gueltig };
    }
  }
}

/** Wendet die Zeilen aus korrekturen.csv in Reihenfolge an. */
export function wendeKorrekturenAn(angebote: Angebot[], korrekturen: Korrektur[]): Angebot[] {
  const nachId = new Map<string, Korrektur[]>();
  for (const k of korrekturen) nachId.set(k.angebotId, [...(nachId.get(k.angebotId) ?? []), k]);

  const ergebnis: Angebot[] = [];
  for (const angebot of angebote) {
    let aktuell: Angebot | null = angebot;
    for (const k of nachId.get(angebot.id) ?? []) {
      if (!aktuell) break;
      aktuell = wendeAn(aktuell, k);
    }
    if (aktuell) ergebnis.push(aktuell);
  }
  return ergebnis;
}
