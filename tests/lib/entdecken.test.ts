import { describe, expect, it } from "vitest";
import { fuerModus, interessenThemen } from "@/lib/entdecken";
import { beispielAngebote } from "../fixtures/angebote";
import type { Angebot } from "@/lib/angebot";

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

describe("Altersgerechte Ansichten mit Beispiel-Kursen", () => {
  const alle = beispielAngebote();
  it("zeigt Kindern keine reinen Erwachsenen- oder Teen-Angebote", () => {
    const kinder = fuerModus(alle, "kind");
    expect(kinder.length).toBeGreaterThan(0);
    expect(kinder.every((a) => a.zielgruppen.includes("kinder") && (a.alterMin ?? 0) <= 11)).toBe(true);
    expect(kinder.some((a) => a.id === "aim:262420PAI")).toBe(false);
  });
  it("zeigt Kindern und Teens nur Angebote mit bekannter Altersangabe", () => {
    const ohneAlter = { ...alle[0]!, id: "test:ohne-alter", zielgruppen: ["kinder", "teens"] as Angebot["zielgruppen"] };
    delete ohneAlter.alterMin;
    delete ohneAlter.alterMax;
    expect(fuerModus([ohneAlter], "kind")).toHaveLength(0);
    expect(fuerModus([ohneAlter], "teen")).toHaveLength(0);
    expect(fuerModus([ohneAlter], "eltern")).toHaveLength(1);
    for (const modus of ["kind", "teen"] as const) {
      expect(fuerModus(alle, modus).every((a) => a.alterMin !== undefined || a.alterMax !== undefined)).toBe(true);
    }
  });
  it("blendet den Eltern-Vortrag zu Social Media im Kinder- und Teen-Modus aus", () => {
    const vortrag = alle.find((a) => a.id === "hdf:261H207010");
    if (!vortrag) return; // Angebot ist inzwischen abgelaufen
    expect(fuerModus(alle, "kind")).not.toContain(vortrag);
    expect(fuerModus(alle, "teen")).not.toContain(vortrag);
  });
  it("zeigt Teens keine ausschließlich für jüngere Kinder begrenzten Kurse", () => {
    const teens = fuerModus(alle, "teen");
    expect(teens.length).toBeGreaterThan(0);
    expect(teens.some((a) => a.id === "aim:262420SC")).toBe(false);
    expect(fuerModus(alle, "eltern")).toHaveLength(alle.length);
  });
});
