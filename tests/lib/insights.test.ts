import { describe, expect, it } from "vitest";
import { altersgruppeFuer, angebotsMatrix, bereinigeBegriff, leererStand, lueckenRadar, pruefeSignal, pruefeStand, topFehlt, zaehle } from "@/lib/insights";
import { META, oeffentlicheAngebote } from "@/lib/daten";

describe("Angebotsmatrix aus echten Daten", () => {
  const matrix = angebotsMatrix(oeffentlicheAngebote(), META.themen);

  it("hat für jedes Thema jede Altersgruppe", () => {
    expect(matrix).toHaveLength(META.themen.length * 4);
  });

  it("zeigt echte Lücken – z. B. kein KI-Angebot für 6- bis 8-Jährige", () => {
    const ki68 = matrix.find((z) => z.thema === "ki" && z.gruppe === "6-8");
    expect(ki68?.angebote).toBeGreaterThanOrEqual(0);
    expect(matrix.some((z) => z.angebote === 0)).toBe(true);
    expect(matrix.some((z) => z.angebote > 0)).toBe(true);
  });
});

describe("Signale", () => {
  it("ordnet Alter einer Gruppe zu", () => {
    expect([6, 8, 9, 11, 12, 17, 18].map(altersgruppeFuer)).toEqual(["6-8", "6-8", "9-11", "9-11", "12-14", "15-17", undefined]);
  });

  it("entfernt Personendaten aus Suchbegriffen", () => {
    expect(bereinigeBegriff("Minecraft Kurs für Ben, ruf an 0171 2345678")).not.toMatch(/\d{4}/);
    expect(bereinigeBegriff("ich heiße Lena und will Roblox")).not.toContain("lena");
    expect(bereinigeBegriff("max@example.org")).toBeNull();
    expect(bereinigeBegriff("Roblox Studio")).toBe("roblox studio");
  });

  it("zählt Wünsche und fehlende Begriffe nur als Tageszähler", () => {
    let stand = leererStand();
    stand = zaehle(stand, { art: "wunsch", thema: "ki", gruppe: "6-8" }, "2026-11-14");
    stand = zaehle(stand, { art: "wunsch", thema: "ki", gruppe: "6-8" }, "2026-11-14");
    stand = zaehle(stand, { art: "fehlt", begriff: "Roblox" }, "2026-11-14");
    expect(stand.wuensche["ki|6-8"]).toBe(2);
    expect(stand.fehlt.roblox).toBe(1);
    expect(stand.tage["2026-11-14"]).toBe(3);
    expect(JSON.stringify(stand)).not.toMatch(/T\d{2}:/);
  });

  it("lehnt unbekannte, überlange oder verdächtige Signale ab", () => {
    expect(pruefeSignal({ art: "wunsch", thema: "ki", gruppe: "99" })).toBeNull();
    expect(pruefeSignal({ art: "spion", ip: "1.2.3.4" })).toBeNull();
    expect(pruefeSignal({ art: "wunsch", thema: "<script>", gruppe: "6-8" })).toBeNull();
    expect(pruefeSignal({ art: "fehlt", begriff: "x".repeat(500) })).toBeNull();
    expect(pruefeSignal({ art: "fehlt", begriff: "lena@schule.de" })).toBeNull();
    expect(pruefeSignal({ art: "wunsch", thema: "ki", gruppe: "12-14", name: "Max" })).toEqual({ art: "wunsch", thema: "ki", gruppe: "12-14" });
    expect(pruefeSignal({ art: "fehlt", begriff: "  Roblox  Studio ", gruppe: "12-14" })).toEqual({ art: "fehlt", begriff: "roblox studio", gruppe: "12-14" });
  });

  it("liest gespeicherte Zähler nur, wenn sie wie Zähler aussehen", () => {
    const stand = pruefeStand({ wuensche: { "ki|6-8": 3, boese: "x", neg: -1 }, fehlt: { roblox: 2 }, tage: { "2026-11-14": 5 }, ip: "1.2.3.4" });
    expect(stand).toEqual({ wuensche: { "ki|6-8": 3 }, fehlt: { roblox: 2 }, tage: { "2026-11-14": 5 } });
    expect(topFehlt(stand)).toEqual([{ begriff: "roblox", anzahl: 2 }]);
  });

  it("verbindet Nachfrage mit Angebot im Lücken-Radar", () => {
    const matrix = angebotsMatrix(oeffentlicheAngebote(), META.themen);
    const stand = zaehle(leererStand(), { art: "wunsch", thema: "gaming", gruppe: "6-8" }, "2026-11-14");
    const radar = lueckenRadar(matrix, stand);
    expect(radar.find((z) => z.thema === "gaming" && z.gruppe === "6-8")?.wuensche).toBe(1);
  });
});
