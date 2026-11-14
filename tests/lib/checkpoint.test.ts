import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CheckpointSchema } from "@/lib/checkpoint";
import { META } from "@/lib/daten";
import { STATIONEN } from "@/lib/spiel";

const ORDNER = "konfiguration/checkpoints";
const dateien = readdirSync(ORDNER).filter((d) => d.endsWith(".json"));

describe("Checkpoint-Konfiguration der Lernhäuser", () => {
  it.each(dateien)("%s ist gültig und heißt wie ihre id", (datei) => {
    const ergebnis = CheckpointSchema.safeParse(JSON.parse(readFileSync(path.join(ORDNER, datei), "utf8")));
    expect(ergebnis.error?.issues ?? []).toEqual([]);
    expect(`${ergebnis.data!.id}.json`).toBe(datei);
  });

  it("lädt jede Datei genau einmal in die Spielwelt", () => {
    expect(STATIONEN.map((s) => `${s.id}.json`).sort()).toEqual([...dateien].sort());
  });

  it("filtert Kurse nur nach Themen aus themen.csv", () => {
    const themen = META.themen.map((t) => t.id);
    for (const s of STATIONEN) expect(themen).toContain(s.thema);
  });

  it("lehnt unbekannte Module und fehlende Varianten mit verständlicher Meldung ab", () => {
    const basis = STATIONEN[0]!;
    expect(CheckpointSchema.safeParse({ ...basis, aktivitaeten: [{ titel: "X", modul: "gibt-es-nicht" }] }).success).toBe(false);
    const zuGross = CheckpointSchema.safeParse({ ...basis, aktivitaeten: [{ titel: "X", modul: "stromkreis", variante: 1 }] });
    expect(zuGross.error?.issues[0]?.message).toMatch(/Varianten 0–0/);
  });

  describe("Demo-Lektionen", () => {
    const basis = STATIONEN[0]!;
    const folie = { titel: "T", text: "Text" };
    const pruefe = (lektion: object) => CheckpointSchema.safeParse({ ...basis, aktivitaeten: [{ titel: "L", modul: "lektion", ...lektion }] });

    it("braucht mindestens eine Folie", () => {
      expect(pruefe({ folien: [folie] }).success).toBe(true);
      expect(pruefe({ folien: [] }).success).toBe(false);
    });

    it("erlaubt nur lokale Bilder mit Bildbeschreibung", () => {
      expect(pruefe({ folien: [{ ...folie, bild: "/medien/experimenta/kreis.png", alt: "Ein Stromkreis" }] }).success).toBe(true);
      expect(pruefe({ folien: [{ ...folie, bild: "/medien/experimenta/kreis.png" }] }).success).toBe(false);
      expect(pruefe({ folien: [{ ...folie, bild: "https://example.org/kreis.png", alt: "x" }] }).success).toBe(false);
    });

    it("prüft, dass die richtige Antwort der Abschlussfrage auch angeboten wird", () => {
      const frage = { frage: "?", tipp: "t", wissen: "w", optionen: [{ id: "a", titel: "A", motiv: "ball" }, { id: "b", titel: "B", motiv: "rad" }] };
      expect(pruefe({ folien: [folie], abschlussfrage: { ...frage, antworten: ["a"] } }).success).toBe(true);
      expect(pruefe({ folien: [folie], abschlussfrage: { ...frage, antworten: ["c"] } }).success).toBe(false);
    });

    it("lehnt Varianten bei Lektionen und Folien bei Code-Modulen ab", () => {
      expect(pruefe({ folien: [folie], variante: 0 }).success).toBe(false);
      expect(CheckpointSchema.safeParse({ ...basis, aktivitaeten: [{ titel: "X", modul: "stromkreis", folien: [folie] }] }).success).toBe(false);
    });

    it("findet jedes eigene Folienbild in public/", () => {
      for (const s of STATIONEN)
        for (const a of s.aktivitaeten)
          if (a.modul === "lektion") for (const f of a.folien) if (f.bild) expect(existsSync(path.join("public", f.bild)), f.bild).toBe(true);
    });
  });
});
