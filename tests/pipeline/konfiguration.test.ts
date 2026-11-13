import { describe, expect, it } from "vitest";
import { parseQuellen, parseThemen, parseKorrekturen } from "../../pipeline/konfiguration";

describe("parseQuellen", () => {
  it("liest Zeilen und teilt start_urls an |", () => {
    const csv = [
      "id,name,website,adapter,start_urls,farbe,adresse",
      'aim,aim,https://a.de/,kufer-html,https://a.de/1|https://a.de/2,#fff,"Weg 1, 74076 HN"',
      "",
    ].join("\n");
    const [q] = parseQuellen(csv);
    expect(q?.startUrls).toEqual(["https://a.de/1", "https://a.de/2"]);
    expect(q?.adresse).toBe("Weg 1, 74076 HN");
  });

  it("meldet fehlenden Adapter mit Zeilennummer", () => {
    const csv = ["id,name,website,adapter,start_urls,farbe,adresse", "x,X,https://x.de/,,https://x.de/,#000,"].join("\n");
    expect(() => parseQuellen(csv)).toThrow(/Zeile 2.*adapter/);
  });

  it("meldet unbekannten Adapter", () => {
    const csv = ["id,name,website,adapter,start_urls,farbe,adresse", "x,X,https://x.de/,gibtsnicht,https://x.de/,#000,"].join("\n");
    expect(() => parseQuellen(csv)).toThrow(/gibtsnicht/);
  });
});

describe("parseThemen", () => {
  it("trennt Schlagwörter und entfernt Leerraum", () => {
    const csv = ["id,name,emoji,schlagwoerter", "ki,KI,🤖, KI | künstliche Intelligenz |"].join("\n");
    expect(parseThemen(csv)).toEqual([{ id: "ki", name: "KI", emoji: "🤖", schlagwoerter: ["KI", "künstliche Intelligenz"] }]);
  });
});

describe("parseKorrekturen", () => {
  it("akzeptiert nur bekannte Aktionen", () => {
    const csv = ["angebot_id,aktion,wert", "aim:1,ausblenden,", "aim:2,thema,gaming"].join("\n");
    expect(parseKorrekturen(csv)).toHaveLength(2);
    expect(() => parseKorrekturen(["angebot_id,aktion,wert", "aim:1,loeschen,"].join("\n"))).toThrow(/loeschen/);
  });
});
