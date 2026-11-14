import { describe, expect, it } from "vitest";
import { META } from "@/lib/daten";
import { STATIONEN } from "@/lib/spiel";
import { alsText, pfadText, pruefe, VORLAGE } from "@/lib/werkstatt";

const themen = META.themen.map((t) => t.id);

describe("Lernhaus-Werkstatt", () => {
  it("akzeptiert alle echten Häuser und die Vorlage für neue Einrichtungen", () => {
    for (const c of [...STATIONEN, VORLAGE]) expect(pruefe(alsText(c), themen).fehler).toEqual([]);
  });

  it("meldet JSON-Syntaxfehler, ohne abzustürzen", () => {
    const e = pruefe('{ "id": "aim", }', themen);
    expect(e.checkpoint).toBeUndefined();
    expect(e.fehler[0]?.pfad).toBe("JSON");
  });

  it("nennt den genauen Pfad und eine deutsche Meldung", () => {
    const kaputt = { ...VORLAGE, farbe: "rot", aktivitaeten: [{ titel: "", modul: "stromkreis" }] };
    const { fehler } = pruefe(JSON.stringify(kaputt), themen);
    expect(fehler.map((f) => f.pfad)).toEqual(expect.arrayContaining(["farbe", "aktivitaeten[0].titel"]));
    expect(fehler.find((f) => f.pfad === "farbe")?.meldung).toMatch(/Ungültig/i);
  });

  it("lehnt Themen ab, die es in themen.csv nicht gibt", () => {
    expect(pruefe(alsText({ ...VORLAGE, thema: "kochen" }), themen).fehler[0]?.pfad).toBe("thema");
  });

  it("schreibt Pfade lesbar", () => {
    expect(pfadText(["aktivitaeten", 0, "folien", 2, "titel"])).toBe("aktivitaeten[0].folien[2].titel");
    expect(pfadText([])).toBe("(gesamte Datei)");
  });
});
