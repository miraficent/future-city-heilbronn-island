import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseKuferWpApi, slugify } from "../../pipeline/adapters/kufer-wp-api";

const kurse = JSON.parse(readFileSync("tests/fixtures/hdf-kurse.json", "utf8")) as unknown[];

describe("HdF-Adapter (kufer-wp-api)", () => {
  const roh = parseKuferWpApi(kurse, "https://hdf-hn.de/");

  it("liest alle web-aktiven Kurse", () => {
    expect(roh.map((r) => r.externeId)).toEqual(["261N103102", "261H304002", "261H207008"]);
  });

  it("baut die Detail-URL wie die HdF-Seite", () => {
    expect(roh[1]?.url).toBe("https://hdf-hn.de/kurs/programmieren-lernen-scratch-261H304002/");
    expect(slugify("Märchenhaft: Groß & klein")).toBe("maerchenhaft-gross-klein");
  });

  it("übernimmt Termine mit Berliner Offset und lässt ausgefallene weg", () => {
    const pekip = roh[0];
    expect(pekip?.termine[0]?.start).toBe("2026-11-17T11:00:00+01:00");
    expect(pekip?.termine.some((t) => t.start.startsWith("2026-11-10"))).toBe(false);
  });

  it("leitet Status und Kosten ab", () => {
    expect(roh[0]?.status).toBe("ausgebucht");
    expect(roh[1]?.kostenEuro).toBe(30);
  });

  it("nimmt Kategorien, Themen und Keywords als Tags", () => {
    expect(roh[1]?.quellTags).toContain("Schulkinder & Jugendliche (ab 6 Jahren)");
  });

  it("übernimmt keine Daten von Kursleitenden", () => {
    const alles = JSON.stringify(roh);
    expect(alles).not.toMatch(/@/);
    expect(alles).not.toContain("Nachname");
  });
});
