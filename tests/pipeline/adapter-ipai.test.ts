import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSitemap, parseWpEvent } from "../../pipeline/adapters/wp-sitemap-events";

const URL_EVENT = "https://ipai-foundation.ai/event/ki-salon-workshop-vibe-coding-ki-agenten-von-der-idee-zur-anwendung/";

describe("IPAI-Eventseite", () => {
  const roh = parseWpEvent(readFileSync("tests/fixtures/ipai-event.html", "utf8"), URL_EVENT);

  it("liest Titel, Typ und Ort", () => {
    expect(roh?.titel).toBe("KI SALON WORKSHOP: Vibe Coding & KI-Agenten: Von der Idee zur Anwendung");
    expect(roh?.artHinweis).toBe("Workshop");
    expect(roh?.ort?.adresse).toBe("IPAI Spaces, Im Zukunftspark 11/13, 74076 Heilbronn");
    expect(roh?.externeId).toBe("ki-salon-workshop-vibe-coding-ki-agenten-von-der-idee-zur-anwendung");
  });

  it("baut den Termin aus Datum und Uhrzeit", () => {
    expect(roh?.termine).toEqual([{ start: "2026-11-23T15:00:00+01:00", ende: "2026-11-23T17:00:00+01:00" }]);
  });

  it("liest Keyfacts: kostenfrei und Zielgruppe", () => {
    expect(roh?.kostenEuro).toBe(0);
    expect(roh?.quellTags.join(" ")).toMatch(/KI-Nutzer/);
  });

  it("nimmt die Beschreibung ab „Was erwartet euch?“ und keine Personennamen", () => {
    expect(roh?.beschreibung).toMatch(/^Software primär durch intuitive/);
    expect(roh?.beschreibung).not.toContain("Vorname Nachname");
  });
});

describe("parseSitemap", () => {
  it("liest alle loc-Einträge", () => {
    const xml = `<?xml version="1.0"?><urlset><url><loc>https://a.de/event/x/</loc></url><url><loc>https://a.de/event/y/</loc></url></urlset>`;
    expect(parseSitemap(xml)).toEqual(["https://a.de/event/x/", "https://a.de/event/y/"]);
  });
});
