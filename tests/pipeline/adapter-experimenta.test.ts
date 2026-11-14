import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExperimentaKalender } from "../../pipeline/adapters/experimenta-kalender";

const html = readFileSync("tests/fixtures/experimenta-kalender.html", "utf8");

describe("experimenta-Adapter", () => {
  const roh = parseExperimentaKalender(html);
  const nachTitel = (t: string) => roh.find((r) => r.titel.includes(t));

  it("fasst Termine derselben Veranstaltung zusammen", () => {
    expect(roh).toHaveLength(5);
    expect(nachTitel("Plätzchen-Party")?.termine).toHaveLength(2);
  });

  it("liest Startzeit aus dem termin-Parameter und Ende aus dem Uhrzeit-Text", () => {
    const bpt = nachTitel("Berufspraxistag");
    expect(bpt?.termine[0]).toEqual({ start: "2026-11-14T10:00:00+01:00", ende: "2026-11-14T16:00:00+01:00" });
  });

  it("übernimmt data-groups als Tags und entfernt den termin-Parameter aus der URL", () => {
    const bpt = nachTitel("Berufspraxistag");
    expect(bpt?.quellTags).toContain("jugendliche");
    expect(bpt?.url).toBe("https://www.experimenta.science/besuchen/veranstaltungskalender/berufspraxistag/");
  });

  it("erkennt ausgebuchte Veranstaltungen und entfernt den Hinweis aus dem Text", () => {
    const bpt = nachTitel("Berufspraxistag");
    expect(bpt?.status).toBe("ausgebucht");
    expect(bpt?.beschreibung).not.toContain("***");
  });

  it("nimmt das Bild mit", () => {
    expect(nachTitel("Maker Faire")?.bild).toMatch(/^https:\/\/www\.experimenta\.science\/wp-content\/uploads\//);
  });
});
