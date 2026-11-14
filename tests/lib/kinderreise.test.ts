import { describe, expect, it } from "vitest";
import type { Angebot } from "@/lib/angebot";
import { angeboteFuerKind, kartenFuerOrakel, orakelPunkte, zaehleProOrt } from "@/lib/kinderreise";
import { kartenOrte } from "@/lib/kinderkarte";

const JETZT = new Date("2026-11-14T12:00:00+01:00");

function a(id: string, teil: Partial<Angebot> = {}): Angebot {
  return {
    id, quelle: "aim", titel: `Kurs ${id}`, teaser: "", url: "https://example.org/", themen: ["coding"],
    art: "kurs", zielgruppen: ["kinder"], alterMin: 8, alterMax: 11,
    termine: [{ start: "2026-12-01T10:00:00+01:00", ende: "2026-12-01T12:00:00+01:00" }],
    ort: { name: "Bildungscampus", online: false }, kosten: { euro: 0, text: "kostenlos" },
    status: "frei", sicherheit: 1, ausloeser: [], erstmalsGesehen: "2026-11-13", ...teil,
  };
}

describe("Kinderreise", () => {
  it("zeigt nur Angebote, die zum Alter passen und ein bekanntes Alter haben", () => {
    const liste = [
      a("passt"),
      a("zu-alt", { alterMin: 12, alterMax: 16 }),
      a("ohne-alter", { alterMin: undefined, alterMax: undefined }),
      a("vorbei", { termine: [{ start: "2026-10-01T10:00:00+01:00" }] }),
      a("eltern", { zielgruppen: ["eltern"] }),
    ];
    expect(angeboteFuerKind(liste, 9, JETZT).map((x) => x.id)).toEqual(["passt"]);
  });

  it("zählt Angebote pro Einrichtung für das gewählte Thema", () => {
    const liste = [a("1"), a("2", { quelle: "hdf" }), a("3", { themen: ["ki"] })];
    expect(zaehleProOrt(liste, "coding")).toEqual({ aim: 1, hdf: 1 });
    expect(zaehleProOrt(liste, null)).toEqual({ aim: 2, hdf: 1 });
  });

  it("das Orakel sortiert, schließt aber nichts aus", () => {
    const show = a("show", { art: "veranstaltung", zielgruppen: ["kinder", "familien"] });
    const kurs = a("kurs", { termine: [{ start: "2026-12-01T10:00:00+01:00" }, { start: "2026-12-08T10:00:00+01:00" }] });
    expect(orakelPunkte(show, { wie: "zuschauen", mitWem: "familie", dauer: "kurz" })).toBe(3);
    expect(orakelPunkte(kurs, { wie: "bauen", mitWem: "allein", dauer: "lang" })).toBe(3);
    const karten = kartenFuerOrakel([kurs, show], { wie: "zuschauen", mitWem: "familie", dauer: "kurz" }, JETZT);
    expect(karten.map((x) => x.id)).toEqual(["show", "kurs"]);
  });

  it("neue Einrichtungen aus quellen.csv bekommen automatisch ein Haus auf der Karte", () => {
    const orte = kartenOrte([
      { id: "aim", name: "aim – Akademie", farbe: "#000" },
      { id: "neu", name: "Stadtbibliothek – Heilbronn", farbe: "#123456" },
    ]);
    expect(orte[1]).toMatchObject({ id: "neu", name: "Stadtbibliothek", gebaeude: "haus", farbe: "#123456" });
  });
});
