import { describe, expect, it } from "vitest";
import { erzeugeIcs, icsEscape, falte } from "@/lib/ics";
import type { Angebot } from "@/lib/angebot";

const ANGEBOT: Angebot = {
  id: "aim:271420SC",
  quelle: "aim",
  titel: "Scratch; Reise, zum Mars",
  teaser: "Zeile 1\nZeile 2",
  url: "https://www.aim-akademie.org/kurse/kurs/x/271420SC",
  themen: ["coding"],
  art: "kurs",
  zielgruppen: ["kinder"],
  alterMin: 8,
  alterMax: 11,
  termine: [
    { start: "2027-02-23T16:30:00+01:00", ende: "2027-02-23T18:10:00+01:00" },
    { start: "2027-03-02T16:30:00+01:00" },
  ],
  ort: { name: "Bildungscampus", adresse: "Bildungscampus 7, 74076 Heilbronn", online: false },
  kosten: { euro: 0, text: "kostenlos" },
  status: "frei",
  sicherheit: 0.9,
  ausloeser: ["Scratch"],
  erstmalsGesehen: "2026-11-13",
};

describe("icsEscape", () => {
  it("maskiert Sonderzeichen nach RFC 5545", () => {
    expect(icsEscape("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });
});

describe("falte", () => {
  it("faltet lange Zeilen auf höchstens 75 Oktette", () => {
    const zeile = `DESCRIPTION:${"ä".repeat(100)}`;
    const teile = falte(zeile).split("\r\n");
    expect(teile.length).toBeGreaterThan(1);
    for (const t of teile) expect(Buffer.byteLength(t, "utf8")).toBeLessThanOrEqual(75);
    expect(teile.slice(1).every((t) => t.startsWith(" "))).toBe(true);
  });
});

describe("erzeugeIcs", () => {
  const ics = erzeugeIcs([ANGEBOT], "Coding für Kinder");

  it("ist ein gültiger Kalender mit CRLF", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it("enthält einen VEVENT pro Termin mit UTC-Zeiten und stabiler UID", () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("DTSTART:20270223T153000Z");
    expect(ics).toContain("DTEND:20270223T171000Z");
    expect(ics).toContain("UID:aim-271420SC-20270223T153000Z@cosmos-entdecker");
    expect(ics).toContain("SUMMARY:Scratch\\; Reise\\, zum Mars");
  });

  it("setzt ein Ende eine Stunde nach Start, wenn keins bekannt ist", () => {
    expect(ics).toContain("DTEND:20270302T163000Z");
  });
});
