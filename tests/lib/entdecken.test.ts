import { describe, expect, it } from "vitest";
import { fuerModus, interessenThemen } from "@/lib/entdecken";
import { oeffentlicheAngebote } from "@/lib/daten";

describe("Interessen-Kompass", () => {
  it("empfiehlt beim Wunsch nach eigener Spieleentwicklung beide relevanten Themen", () => {
    expect(interessenThemen(["spiele"]).sort()).toEqual(["coding", "gaming"]);
  });
  it("gewichtet mehrere gewählte Interessen und zählt jedes Bild nur einmal", () => {
    expect(interessenThemen(["tuefteln", "roboter", "roboter"])).toEqual(["coding"]);
    expect(interessenThemen([])).toEqual([]);
    expect(interessenThemen(["unbekannt"])).toEqual([]);
  });
});

describe("Altersgerechte Ansichten mit echten Projektdaten", () => {
  const alle = oeffentlicheAngebote();
  it("zeigt Kindern keine reinen Erwachsenen- oder Teen-Angebote", () => {
    const kinder = fuerModus(alle, "kind");
    expect(kinder.length).toBeGreaterThan(0);
    expect(kinder.every((a) => a.zielgruppen.includes("kinder") && (a.alterMin ?? 0) <= 11)).toBe(true);
    expect(kinder.some((a) => a.id === "aim:262420PAI")).toBe(false);
  });
  it("zeigt Teens keine ausschließlich für jüngere Kinder begrenzten Kurse", () => {
    const teens = fuerModus(alle, "teen");
    expect(teens.length).toBeGreaterThan(0);
    expect(teens.some((a) => a.id === "aim:262420SC")).toBe(false);
    expect(fuerModus(alle, "eltern")).toHaveLength(alle.length);
  });
});
