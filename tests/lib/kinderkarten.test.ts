import { describe, expect, it } from "vitest";
import type { Angebot } from "@/lib/angebot";
import type { LiveEvent } from "@/types";
import { kartenFuerOrt, kinderKarten, passtZumAlter } from "@/lib/kinderkarten";
import { kartenOrte } from "@/lib/kinderkarte";

const JETZT = new Date("2026-11-14T12:00:00+01:00");

function angebot(id: string, teil: Partial<Angebot> = {}): Angebot {
  return {
    id, quelle: "aim", titel: `Robotik (8–11 Jahre)`, teaser: "Du baust einen Roboter. Danach programmierst du ihn.", url: "https://example.org/",
    themen: ["coding"], art: "kurs", zielgruppen: ["kinder"], alterMin: 8, alterMax: 11,
    termine: [{ start: "2026-12-01T10:00:00+01:00" }], ort: { name: "Bildungscampus", online: false },
    kosten: { euro: 0, text: "kostenlos" }, status: "frei", sicherheit: 1, ausloeser: [], erstmalsGesehen: "2026-11-13", ...teil,
  };
}

function event(id: string, teil: Partial<LiveEvent> = {}): LiveEvent {
  return {
    id, institutionId: "experimenta", title: "VAST", title_kids: "Reise durchs Weltall", categories: ["astronomy"], ageMin: 8, ageMax: null,
    type: "show", start: "2026-11-20T14:30:00+01:00", end: null, location: "experimenta", cost: "6 €", image: null,
    story_kids: "Du reist durch das Weltall.", kinder: {}, description_parents: "", registrationUrl: "https://example.org", sourceUrl: "https://example.org",
    lastUpdated: "2026-11-14", needsReview: false, isDummy: false, ...teil,
  };
}

describe("Kinderkarten aus Kursen und Live-Events", () => {
  it("nimmt nur, was Kinder sehen dürfen", () => {
    const karten = kinderKarten(
      [angebot("ok"), angebot("ohne-alter", { alterMin: undefined, alterMax: undefined }), angebot("eltern", { zielgruppen: ["eltern"] })],
      [event("ok"), event("pruefen", { needsReview: true }), event("erwachsene", { ageMin: 18 })],
      JETZT,
    );
    expect(karten.map((k) => k.id)).toEqual(["ev:ok", "ok"]);
  });

  it("wandelt Kurse kindgerecht um", () => {
    const [k] = kinderKarten([angebot("a")], [], JETZT);
    expect(k).toMatchObject({ titel: "Robotik", kategorien: ["coding"], gratis: true, geschichte: "Du baust einen Roboter." });
  });

  it("filtert nach dem Alter des Kindes", () => {
    const [k] = kinderKarten([angebot("a")], [], JETZT);
    expect(passtZumAlter(k!, 9)).toBe(true);
    expect(passtZumAlter(k!, 13)).toBe(false);
    expect(passtZumAlter(k!, null)).toBe(true);
  });

  it("COSMOS zeigt alle Angebote, andere Orte nur ihre eigenen", () => {
    const karten = kinderKarten([angebot("a")], [event("e")], JETZT);
    expect(kartenFuerOrt(karten, "cosmos")).toHaveLength(2);
    expect(kartenFuerOrt(karten, "aim").map((k) => k.id)).toEqual(["a"]);
  });

  it("COSMOS steht immer auf der Karte, neue Quellen bekommen ein Haus", () => {
    const orte = kartenOrte([{ id: "neu", name: "Stadtbibliothek – Heilbronn", farbe: "#123456" }]);
    expect(orte.map((o) => o.id)).toEqual(["neu", "cosmos"]);
    expect(orte[0]).toMatchObject({ name: "Stadtbibliothek", gebaeude: "haus" });
  });
});
