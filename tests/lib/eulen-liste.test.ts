import { describe, expect, it } from "vitest";
import { eulenZeilen } from "@/lib/eulen-liste";
import type { LiveEvent } from "@/types";

const JETZT = new Date("2026-11-15T12:00:00+01:00");

function event(id: string, teil: Partial<LiveEvent> = {}): LiveEvent {
  return {
    id, institutionId: "experimenta", title: "Polarnacht", title_kids: "Polarnacht", categories: [], ageMin: 6, ageMax: null,
    type: "show", start: "2026-11-20T10:00:00+01:00", end: null, location: "", cost: null, image: null,
    story_kids: "", kinder: {}, description_parents: "", registrationUrl: "", sourceUrl: "", lastUpdated: "", needsReview: false, isDummy: false, ...teil,
  };
}

describe("eulenZeilen – Zeilen der Prüfliste", () => {
  it("fasst Termine mit gleichen Texten zusammen", () => {
    expect(eulenZeilen([event("a"), event("b", { start: "2026-11-21T10:00:00+01:00" })], JETZT).map((e) => e.id)).toEqual(["a"]);
  });
  it("zeigt Termine mit anderen Texten einzeln – ein fehlender Text bleibt sichtbar", () => {
    const mitText = event("a", { kinder: { de: { satz: "Hier staunst du." } } });
    expect(eulenZeilen([mitText, event("b", { start: "2026-11-21T10:00:00+01:00" })], JETZT).map((e) => e.id)).toEqual(["a", "b"]);
  });
  it("lässt vergangene Termine weg und verträgt Events ohne kinder", () => {
    const alt = { ...event("c", { start: "2026-11-21T10:00:00+01:00" }) } as Partial<LiveEvent>;
    delete alt.kinder;
    expect(eulenZeilen([event("a", { start: "2026-11-01T10:00:00+01:00" }), alt as LiveEvent], JETZT).map((e) => e.id)).toEqual(["c"]);
  });
});
