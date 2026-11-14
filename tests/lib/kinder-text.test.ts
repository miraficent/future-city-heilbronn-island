import { describe, expect, it } from "vitest";
import { euleSagt, kinderGeschichte, kinderTageszeit, kinderTitel, kinderWann } from "@/lib/kinder-text";

describe("kinderTitel", () => {
  it("nimmt bei Titel: Untertitel nur den Titel", () => {
    expect(kinderTitel("Data Literacy for Kids: Von Bausteinen zum Datenmodell")).toBe("Data Literacy");
    expect(kinderTitel("Märchenhaft mit ScratchJunior – eine Geschichte programmieren")).toBe("Märchenhaft mit ScratchJunior");
    // Einwortiger Teil vor dem Strich wäre zu knapp – dann bleibt der Titel (gekürzt) stehen
    expect(kinderTitel("Queen – Heaven – Das Original!")).toBe("Queen – Heaven – Das …");
  });
  it("entfernt Klammern und kürzt auf fünf Wörter", () => {
    expect(kinderTitel("Robotik zum Anfassen (8–10 Jahre)")).toBe("Robotik zum Anfassen");
    expect(kinderTitel("Visuelle Programmierung mit Scratch für Einsteiger und Neugierige")).toBe("Visuelle Programmierung mit Scratch für …");
  });
  it("lässt kurze Titel unverändert", () => {
    expect(kinderTitel("Blitze im Labor")).toBe("Blitze im Labor");
  });
});

describe("kinderWann", () => {
  const jetzt = new Date("2026-11-15T10:00:00+01:00"); // Sonntag
  it("sagt Heute, Morgen und den Wochentag", () => {
    expect(kinderWann("2026-11-15T18:00:00+01:00", jetzt)).toBe("Heute");
    expect(kinderWann("2026-11-16T09:00:00+01:00", jetzt)).toBe("Morgen");
    expect(kinderWann("2026-11-21T15:00:00+01:00", jetzt)).toBe("Am Samstag");
  });
  it("rechnet weiter weg in Wochen", () => {
    expect(kinderWann("2026-11-25T15:00:00+01:00", jetzt)).toBe("Nächste Woche");
    expect(kinderWann("2026-12-06T15:00:00+01:00", jetzt)).toBe("In 3 Wochen");
  });
  it("nennt die Tageszeit", () => {
    expect(kinderTageszeit("2026-11-21T09:30:00+01:00")).toBe("morgens");
    expect(kinderTageszeit("2026-11-21T15:00:00+01:00")).toBe("nachmittags");
    expect(kinderTageszeit("2026-11-21T19:00:00+01:00")).toBe("abends");
  });
});

describe("kinderGeschichte – die Eule wiederholt nie nur den Titel", () => {
  it("bildet ohne Kindertext einen Satz aus Thema, Art und Kosten", () => {
    const g = kinderGeschichte({ titel: "Capcom Go!", geschichte: "Capcom Go!", art: "show", themen: ["Spiele"], gratis: true });
    expect(g).toBe("Hier geht es um Spiele. Du schaust zu und staunst. Es kostet nichts.");
    expect(euleSagt("Capcom Go!", g)).toBe("Capcom Go! Hier geht es um Spiele. Du schaust zu und staunst. Es kostet nichts.");
  });
  it("nimmt einen echten Kindertext und setzt keinen doppelten Punkt", () => {
    expect(kinderGeschichte({ titel: "Blitze", geschichte: "Es knistert und blitzt", art: "workshop", themen: [], gratis: false })).toBe("Es knistert und blitzt.");
    expect(euleSagt("Blitze im Labor", "x")).toBe("Blitze im Labor. x");
  });
});
