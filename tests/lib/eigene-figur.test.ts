import { describe, expect, it } from "vitest";
import { beschreibe, HAARFARBEN, KLEIDERFARBEN, pruefeAussehen, STANDARD_AUSSEHEN, toene, zufallsAussehen } from "@/lib/eigene-figur";

describe("pruefeAussehen", () => {
  it("übernimmt gültige Werte", () => {
    const a = { ...STANDARD_AUSSEHEN, haut: 3, frisur: "locken", haar: "#e0b24a", tasche: null };
    expect(pruefeAussehen(a)).toEqual(a);
  });

  it("ersetzt unbekannte oder fremde Werte durch den Standard", () => {
    const a = pruefeAussehen({ haut: 99, frisur: "glatze", haar: "#123456", pulli: "red", mund: 3, tasche: "<script>" });
    expect(a).toEqual(STANDARD_AUSSEHEN);
    expect(pruefeAussehen(null)).toEqual(STANDARD_AUSSEHEN);
    expect(pruefeAussehen("kaputt")).toEqual(STANDARD_AUSSEHEN);
  });
});

describe("zufallsAussehen", () => {
  it("wählt nur aus den festen Listen", () => {
    let i = 0;
    const zahlen = [0.99, 0.5, 0.1, 0.7, 0.3, 0.95, 0.2, 0.6, 0.9, 0.4];
    const a = zufallsAussehen(() => zahlen[i++ % zahlen.length]!);
    expect(pruefeAussehen(a)).toEqual(a);
    expect(HAARFARBEN.some((h) => h.wert === a.haar)).toBe(true);
    expect(KLEIDERFARBEN.some((k) => k.wert === a.pulli)).toBe(true);
  });
});

describe("toene", () => {
  it("hellt auf und dunkelt ab", () => {
    expect(toene("#000000", 0.5)).toBe("#808080");
    expect(toene("#ffffff", 0)).toBe("#ffffff");
    expect(toene("#ffffff", -1)).toBe("#1f2559");
  });
});

describe("beschreibe", () => {
  it("beschreibt die Figur in einem kurzen Satz", () => {
    expect(beschreibe({ ...STANDARD_AUSSEHEN, frisur: "locken", pulli: "#3b6fe0", tasche: null })).toBe("Deine Figur mit Locken, Pulli in Blau");
    expect(beschreibe({ ...STANDARD_AUSSEHEN, pulli: "#6c4ce0", tasche: "#ff6b6b" })).toBe("Deine Figur mit kurzen Haaren, Pulli in Lila und Tasche in Rot");
  });
});
