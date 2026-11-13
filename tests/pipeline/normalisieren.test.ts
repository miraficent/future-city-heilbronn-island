import { describe, expect, it } from "vitest";
import { normalisiere } from "../../pipeline/verarbeitung/normalisieren";
import { wendeKorrekturenAn } from "../../pipeline/verarbeitung/korrekturen";
import { fuehreZusammen } from "../../pipeline/verarbeitung/zusammenfuehren";
import type { Angebot, Quelle, RohAngebot, Thema } from "../../src/lib/angebot";

const JETZT = new Date("2026-11-13T12:00:00+01:00");

const QUELLE: Quelle = {
  id: "aim",
  name: "aim",
  website: "https://www.aim-akademie.org/",
  adapter: "kufer-html",
  startUrls: [],
  farbe: "#E8513A",
  adresse: "Bildungscampus 7, 74076 Heilbronn",
};

const THEMEN: Thema[] = [
  { id: "coding", name: "Coding", symbol: "robot", schlagwoerter: ["Scratch", "Python"] },
  { id: "gaming", name: "Gaming", symbol: "robot", schlagwoerter: ["Game"] },
];

function roh(teil: Partial<RohAngebot> = {}): RohAngebot {
  return {
    externeId: "271420SC",
    titel: "Scratch – Reise zum Mars (8–11 Jahre)",
    beschreibung: "Lerne programmieren.",
    url: "https://www.aim-akademie.org/kurse/kurs/x/271420SC",
    termine: [{ start: "2027-02-23T16:30:00+01:00", ende: "2027-02-23T18:10:00+01:00" }],
    kostenEuro: 0,
    quellTags: [],
    artHinweis: "kurs",
    ...teil,
  };
}

describe("normalisiere", () => {
  it("baut ein vollständiges Angebot", () => {
    const a = normalisiere(roh(), QUELLE, THEMEN, JETZT);
    expect(a).toMatchObject({
      id: "aim:271420SC",
      quelle: "aim",
      themen: ["coding"],
      alterMin: 8,
      alterMax: 11,
      zielgruppen: ["kinder"],
      art: "kurs",
      kosten: { euro: 0, text: "kostenlos" },
      status: "unbekannt",
      ort: { name: "aim", adresse: "Bildungscampus 7, 74076 Heilbronn", online: false },
    });
  });

  it("liefert leere Themen, wenn nichts passt (Korrekturen können noch eingreifen)", () => {
    expect(normalisiere(roh({ titel: "Yoga für Eltern", beschreibung: "" }), QUELLE, THEMEN, JETZT)?.themen).toEqual([]);
  });

  it("entfernt vergangene Termine und verwirft Angebote ohne Zukunft", () => {
    const termine = [{ start: "2026-10-01T10:00:00+02:00" }, { start: "2027-01-10T10:00:00+01:00" }];
    expect(normalisiere(roh({ termine }), QUELLE, THEMEN, JETZT)?.termine).toEqual([{ start: "2027-01-10T10:00:00+01:00" }]);
    expect(normalisiere(roh({ termine: [{ start: "2026-10-01T10:00:00+02:00" }] }), QUELLE, THEMEN, JETZT)).toBeNull();
  });

  it("leitet Zielgruppen aus Alter und Quell-Tags ab", () => {
    expect(normalisiere(roh({ titel: "Python (12–16 Jahre)" }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["teens"]);
    expect(normalisiere(roh({ titel: "Python", quellTags: ["Eltern"] }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["eltern"]);
    expect(normalisiere(roh({ titel: "Python ab 16 Jahren" }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["teens", "erwachsene"]);
    expect(normalisiere(roh({ titel: "Python ab 6 Jahren" }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["kinder", "teens"]);
    expect(normalisiere(roh({ titel: "Python mit KI in der Kita", quellTags: ["pädagogische Fachkraft Krippe und Kita"] }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["fachkraefte"]);
    expect(normalisiere(roh({ titel: "Python (Kl. 9-10)", quellTags: ["Juniorstudierende"] }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["teens"]);
    expect(normalisiere(roh({ titel: "Python", quellTags: ["Schüler/in"] }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["kinder", "teens"]);
    expect(normalisiere(roh({ titel: "Python (12–16 Jahre)", quellTags: ["Schüler/in"] }), QUELLE, THEMEN, JETZT)?.zielgruppen).toEqual(["teens"]);
  });

  it("vereinigt Altersgruppen aus mehreren Tags", () => {
    const a = normalisiere(roh({ titel: "Python", quellTags: ["Kindergartenkind (3-6 Jahre)", "Schulkinder & Jugendliche (ab 6 Jahren)"] }), QUELLE, THEMEN, JETZT);
    expect(a?.alterMin).toBe(3);
    expect(a?.alterMax).toBeUndefined();
  });

  it("formatiert Kosten", () => {
    expect(normalisiere(roh({ kostenEuro: 30 }), QUELLE, THEMEN, JETZT)?.kosten).toEqual({ euro: 30, text: "30 €" });
    expect(normalisiere(roh({ kostenEuro: 12.5 }), QUELLE, THEMEN, JETZT)?.kosten.text).toBe("12,50 €");
    expect(normalisiere(roh({ kostenEuro: null, kostenText: undefined }), QUELLE, THEMEN, JETZT)?.kosten.text).toBe("siehe Anbieter");
  });

  it("erkennt Ferienprogramme", () => {
    expect(normalisiere(roh({ artHinweis: undefined, quellTags: ["ferienprogramm"] }), QUELLE, THEMEN, JETZT)?.art).toBe("ferienprogramm");
  });
});

function angebot(teil: Partial<Angebot> = {}): Angebot {
  const basis = normalisiere(roh(), QUELLE, THEMEN, JETZT);
  if (!basis) throw new Error("Testdaten ungültig");
  return { ...basis, ...teil };
}

describe("wendeKorrekturenAn", () => {
  it("blendet aus und setzt Themen mit voller Sicherheit", () => {
    const liste = [angebot({ id: "aim:1" }), angebot({ id: "aim:2", themen: [], sicherheit: 0 })];
    const ergebnis = wendeKorrekturenAn(liste, [
      { angebotId: "aim:1", aktion: "ausblenden", wert: "" },
      { angebotId: "aim:2", aktion: "thema", wert: "gaming|coding" },
    ]);
    expect(ergebnis).toHaveLength(1);
    expect(ergebnis[0]).toMatchObject({ id: "aim:2", themen: ["gaming", "coding"], sicherheit: 1 });
  });

  it("setzt Alter und passt Zielgruppen an", () => {
    const [a] = wendeKorrekturenAn([angebot({ id: "aim:1" })], [{ angebotId: "aim:1", aktion: "alter", wert: "13-17" }]);
    expect(a).toMatchObject({ alterMin: 13, alterMax: 17, zielgruppen: ["teens"] });
  });
});

describe("fuehreZusammen", () => {
  it("übernimmt erstmalsGesehen aus dem Vorlauf und markiert Neues", () => {
    const alt = [angebot({ id: "aim:1", erstmalsGesehen: "2026-11-01" })];
    const { angebote, neu } = fuehreZusammen(
      [{ quelle: "aim", angebote: [angebot({ id: "aim:1" }), angebot({ id: "aim:2" })] }],
      alt,
      "2026-11-13",
      JETZT,
    );
    expect(angebote.find((a) => a.id === "aim:1")?.erstmalsGesehen).toBe("2026-11-01");
    expect(angebote.find((a) => a.id === "aim:2")?.erstmalsGesehen).toBe("2026-11-13");
    expect(neu.get("aim")).toEqual(["aim:2"]);
  });

  it("behält bei einem Fehler die letzten guten Daten der Quelle", () => {
    const alt = [angebot({ id: "aim:1" }), angebot({ id: "hdf:9", quelle: "hdf" })];
    const { angebote } = fuehreZusammen([{ quelle: "aim", angebote: null }, { quelle: "hdf", angebote: [] }], alt, "2026-11-13", JETZT);
    expect(angebote.map((a) => a.id)).toEqual(["aim:1"]);
  });
});
