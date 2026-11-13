import { describe, expect, it } from "vitest";
import { gueltigeErfolge, passendeSpielAngebote, STATIONEN } from "@/lib/spiel";
import { oeffentlicheAngebote } from "@/lib/daten";

describe("Lernhäuser und Spielstand", () => {
  it("hat für jedes Lernhaus ein eigenes Raketenteil", () => {
    expect(new Set(STATIONEN.map((s) => s.teil)).size).toBe(STATIONEN.length);
  });

  it("übernimmt nur Aufgaben bekannter Häuser aus einem gespeicherten Spielstand", () => {
    expect(gueltigeErfolge(["aim-0", "aim-0", null, "fremd-1", 7, "ipai-2"])).toEqual(["aim-0", "ipai-2"]);
    expect(gueltigeErfolge({ aim: true })).toEqual([]);
  });

  it("verknüpft Aufgaben mit echten, altersgerechten Kursen", () => {
    const angebote = passendeSpielAngebote(oeffentlicheAngebote(), "coding", 8, new Date("2026-11-13T10:00:00+01:00"));
    expect(angebote.length).toBeGreaterThan(0);
    expect(angebote.every((a) => a.themen.includes("coding") && (a.alterMin ?? 0) <= 8 && (a.alterMax ?? 99) >= 8)).toBe(true);
    expect(angebote.some((a) => a.id === "aim:262420PAI")).toBe(false);
  });
});
