import { readdirSync, readFileSync } from "node:fs";
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
});
