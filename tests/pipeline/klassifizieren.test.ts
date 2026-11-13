import { describe, expect, it } from "vitest";
import { erkenneAlter } from "../../pipeline/verarbeitung/alter";
import { klassifiziereThemen } from "../../pipeline/verarbeitung/themen";
import type { Thema } from "../../src/lib/angebot";

describe("erkenneAlter", () => {
  it.each([
    ["Scratch – Reise zum Planeten Mars (8–11 Jahre)", { min: 8, max: 11 }],
    ["Talking Plants (12-16 Jahre)", { min: 12, max: 16 }],
    ["Python lernen mit KI ab 16 Jahren", { min: 16 }],
    ["IT erleben (ab 13 Jahre)", { min: 13 }],
    ["Future Skills – ab 14 J.", { min: 14 }],
    ["Für Klasse 5 - 10", { min: 10, max: 15 }],
    ["Schulkinder & Jugendliche (ab 6 Jahren)", { min: 6 }],
    ["Kindergartenkind (3-6 Jahre)", { min: 3, max: 6 }],
    ["ab-8-jahren", { min: 8 }],
    ["Für alle ab 10 Jahren.", { min: 10 }],
    ["Ein Workshop für Erwachsene", {}],
  ])("%s", (text, erwartet) => {
    expect(erkenneAlter([text])).toEqual(erwartet);
  });

  it("nimmt die engste Spanne aus mehreren Texten – Titel vor Tags", () => {
    expect(erkenneAlter(["Robotik (7–10 Jahre)", "Schulkinder & Jugendliche (ab 6 Jahren)"])).toEqual({ min: 7, max: 10 });
  });

  it("ignoriert unplausible Zahlen", () => {
    expect(erkenneAlter(["Jubiläum: 50 Jahre experimenta"])).toEqual({});
  });
});

const THEMEN: Thema[] = [
  { id: "ki", name: "KI", emoji: "🤖", schlagwoerter: ["KI", "AI", "künstliche Intelligenz"] },
  { id: "coding", name: "Coding", emoji: "💻", schlagwoerter: ["Programmier", "Scratch", "Roboter"] },
  { id: "gaming", name: "Gaming", emoji: "🎮", schlagwoerter: ["Game", "Minecraft"] },
];

describe("klassifiziereThemen", () => {
  it("findet KI als ganzes Wort, aber nicht in Kinder oder Skizze", () => {
    expect(klassifiziereThemen("Python lernen mit KI", "", THEMEN).themen).toEqual(["ki"]);
    expect(klassifiziereThemen("Kinder malen eine Skizze", "", THEMEN).themen).toEqual([]);
  });

  it("matcht am Wortanfang ohne Groß/klein", () => {
    expect(klassifiziereThemen("Programmieren lernen", "", THEMEN).themen).toEqual(["coding"]);
    expect(klassifiziereThemen("Prager-Eltern-Kind-Programm", "", THEMEN).themen).toEqual([]);
  });

  it("findet KI auch mit Bindestrich-Komposita", () => {
    expect(klassifiziereThemen("KI-Salon Workshop", "", THEMEN).themen).toEqual(["ki"]);
  });

  it("Titeltreffer ergibt hohe Sicherheit, nur Beschreibung niedrige", () => {
    expect(klassifiziereThemen("Scratch für Kids", "", THEMEN).sicherheit).toBeGreaterThanOrEqual(0.8);
    expect(klassifiziereThemen("Basteln", "Am Ende spielen wir Minecraft", THEMEN).sicherheit).toBeLessThan(0.6);
  });

  it("liefert die auslösenden Schlagwörter", () => {
    const r = klassifiziereThemen("Roboter und Games", "", THEMEN);
    expect(r.themen.sort()).toEqual(["coding", "gaming"]);
    expect(r.ausloeser.sort()).toEqual(["Game", "Roboter"]);
  });
});
