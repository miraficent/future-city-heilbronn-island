import { describe, expect, it } from "vitest";
import { filtere, LEERER_FILTER, normalisiereSuchtext, passtZuAlter } from "@/lib/filter";
import type { Angebot } from "@/lib/angebot";

const JETZT = new Date("2026-11-13T12:00:00+01:00");

function a(id: string, teil: Partial<Angebot> = {}): Angebot {
  return {
    id,
    quelle: "aim",
    titel: `Kurs ${id}`,
    teaser: "",
    url: "https://example.org/",
    themen: ["coding"],
    art: "kurs",
    zielgruppen: ["kinder"],
    termine: [{ start: "2026-12-01T10:00:00+01:00" }],
    ort: { name: "Bildungscampus", online: false },
    kosten: { euro: 0, text: "kostenlos" },
    status: "frei",
    sicherheit: 0.9,
    ausloeser: [],
    erstmalsGesehen: "2026-11-13",
    ...teil,
  };
}

describe("normalisiereSuchtext", () => {
  it("macht Umlaute und Umschreibungen vergleichbar", () => {
    expect(normalisiereSuchtext("Künstliche")).toBe(normalisiereSuchtext("kuenstliche"));
    expect(normalisiereSuchtext("Künstliche")).toBe(normalisiereSuchtext("kunstliche"));
    expect(normalisiereSuchtext("Straße")).toBe("strasse");
  });
});

describe("passtZuAlter", () => {
  it("prüft Spannen und offene Grenzen", () => {
    expect(passtZuAlter(a("1", { alterMin: 8, alterMax: 11 }), 9)).toBe(true);
    expect(passtZuAlter(a("1", { alterMin: 12, alterMax: 16 }), 9)).toBe(false);
    expect(passtZuAlter(a("1", { alterMin: 6 }), 15)).toBe(true);
  });

  it("nutzt ohne Altersangabe die Zielgruppen", () => {
    expect(passtZuAlter(a("1", { zielgruppen: ["fachkraefte"] }), 9)).toBe(false);
    expect(passtZuAlter(a("1", { zielgruppen: ["teens"] }), 14)).toBe(true);
    expect(passtZuAlter(a("1", { zielgruppen: ["familien"] }), 7)).toBe(true);
  });
});

describe("filtere", () => {
  const liste = [
    a("ki", { titel: "Künstliche Intelligenz entdecken", themen: ["ki"], termine: [{ start: "2026-12-10T10:00:00+01:00" }] }),
    a("scratch", { titel: "Scratch", alterMin: 8, alterMax: 11, termine: [{ start: "2026-11-20T10:00:00+01:00" }] }),
    a("teuer", { titel: "Robotik", themen: ["coding"], kosten: { euro: 30, text: "30 €" }, termine: [{ start: "2027-03-01T10:00:00+01:00" }] }),
    a("voll", { titel: "Games", themen: ["gaming"], status: "ausgebucht", termine: [{ start: "2026-11-15T10:00:00+01:00" }] }),
  ];

  it("sortiert nach dem nächsten Termin", () => {
    expect(filtere(liste, LEERER_FILTER, JETZT).map((x) => x.id)).toEqual(["voll", "scratch", "ki", "teuer"]);
  });

  it("sucht ohne Umlaut-Probleme in Titel und Themen", () => {
    expect(filtere(liste, { ...LEERER_FILTER, suche: "kunstliche" }, JETZT).map((x) => x.id)).toEqual(["ki"]);
  });

  it("verknüpft mehrere Themen mit ODER", () => {
    expect(filtere(liste, { ...LEERER_FILTER, themen: ["ki", "gaming"] }, JETZT).map((x) => x.id)).toEqual(["voll", "ki"]);
  });

  it("filtert nach Alter, Kosten, freien Plätzen und Zeitraum", () => {
    expect(filtere(liste, { ...LEERER_FILTER, alter: 9 }, JETZT).map((x) => x.id)).toContain("scratch");
    expect(filtere(liste, { ...LEERER_FILTER, nurKostenlos: true }, JETZT).map((x) => x.id)).not.toContain("teuer");
    expect(filtere(liste, { ...LEERER_FILTER, nurFrei: true }, JETZT).map((x) => x.id)).not.toContain("voll");
    expect(filtere(liste, { ...LEERER_FILTER, zeitraum: "monat" }, JETZT).map((x) => x.id)).toEqual(["voll", "scratch", "ki"]);
  });
});
