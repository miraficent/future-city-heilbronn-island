import { describe, expect, it } from "vitest";
import type { LiveEvent } from "@/types";
import { countUpcoming, getEventsForInstitution, getUpcoming, groupByCategory, isEvening, isForKids, isFree, isToday } from "@/lib/events";

const JETZT = new Date("2026-11-14T12:00:00+01:00");

function ev(id: string, teil: Partial<LiveEvent> = {}): LiveEvent {
  return {
    id, institutionId: "experimenta", title: id, title_kids: id, categories: ["astronomy"], ageMin: 8, ageMax: null,
    type: "show", start: "2026-11-20T14:30:00+01:00", end: null, location: "experimenta", cost: "kostenlos", image: null,
    story_kids: "", kinder: {}, description_parents: "", registrationUrl: "https://example.org", sourceUrl: "https://example.org",
    lastUpdated: "2026-11-14", needsReview: false, isDummy: false, ...teil,
  };
}

describe("Live-Events", () => {
  it("filtert nach Einrichtung und lässt vergangene Events weg", () => {
    const liste = [ev("a"), ev("b", { institutionId: "aim" }), ev("alt", { start: "2026-11-01T10:00:00+01:00" })];
    expect(getEventsForInstitution(liste, "aim").map((e) => e.id)).toEqual(["b"]);
    expect(getUpcoming(liste, JETZT).map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("gruppiert nach Kategorien (ein Event kann in mehreren stehen)", () => {
    const g = groupByCategory([ev("a", { categories: ["astronomy", "physics"] }), ev("b")]);
    expect(g.astronomy?.map((e) => e.id)).toEqual(["a", "b"]);
    expect(g.physics?.map((e) => e.id)).toEqual(["a"]);
  });

  it("zählt nur geprüfte Kinder-Events", () => {
    const liste = [ev("ok"), ev("pruefen", { needsReview: true }), ev("erwachsene", { ageMin: 18 }), ev("ohne-alter", { ageMin: null })];
    expect(countUpcoming(liste, "experimenta", JETZT)).toBe(1);
    expect(liste.filter(isForKids).map((e) => e.id)).toEqual(["ok"]);
  });

  it("erkennt heute, abends und kostenlos", () => {
    expect(isToday(ev("h", { start: "2026-11-14T18:00:00+01:00" }), JETZT)).toBe(true);
    expect(isEvening(ev("h", { start: "2026-11-14T18:00:00+01:00" }))).toBe(true);
    expect(isEvening(ev("t", { start: "2026-11-14T10:00:00+01:00" }))).toBe(false);
    expect(isFree(ev("f"))).toBe(true);
    expect(isFree(ev("p", { cost: "6 € / 4 €" }))).toBe(false);
  });
});
