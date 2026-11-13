import { describe, expect, it } from "vitest";
import { htmlZuText, teaser, normalisiereLeerraum } from "../../pipeline/verarbeitung/text";

describe("htmlZuText", () => {
  it("entfernt Tags, löst Entities auf und behält Absätze", () => {
    expect(htmlZuText("<p>A&amp;B</p><br>C")).toBe("A&B\nC");
  });

  it("ignoriert script und style", () => {
    expect(htmlZuText("<style>p{}</style><p>Hallo</p><script>x()</script>")).toBe("Hallo");
  });
});

describe("teaser", () => {
  it("lässt kurze Texte unverändert", () => {
    expect(teaser("Kurz und gut.", 300)).toBe("Kurz und gut.");
  });

  it("kürzt an einer Wortgrenze mit Auslassungszeichen", () => {
    const lang = "Wort ".repeat(100).trim();
    const t = teaser(lang, 50);
    expect(t.length).toBeLessThanOrEqual(50);
    expect(t.endsWith("…")).toBe(true);
    expect(t).not.toMatch(/Wor…$/);
  });

  it("macht aus Zeilenumbrüchen Leerzeichen", () => {
    expect(teaser("Zeile 1\nZeile 2", 300)).toBe("Zeile 1 Zeile 2");
  });
});

describe("normalisiereLeerraum", () => {
  it("fasst Leerzeichen und geschützte Leerzeichen zusammen", () => {
    expect(normalisiereLeerraum("  a   b\t c ")).toBe("a b c");
  });
});
