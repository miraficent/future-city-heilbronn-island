import { describe, expect, it } from "vitest";
import kategorien from "@/data/categories.json";
import { isForKids } from "@/lib/events";
import { standEvents } from "@/lib/mobilizon-stand";
import type { Category } from "@/types";

describe("standEvents – gespeicherter Mobilizon-Stand", () => {
  const jetzt = new Date("2026-11-15T00:00:00+01:00");
  const events = standEvents(kategorien as Category[], jetzt, "http://localhost:4000");

  it("liest die echten Veranstaltungen und ordnet sie den Einrichtungen zu", () => {
    expect(events.length).toBeGreaterThan(40);
    for (const ort of ["experimenta", "hdf", "aim", "ipai"]) expect(events.some((e) => e.institutionId === ort)).toBe(true);
  });

  it("erkennt Kinder-Angebote und hält Erwachsenen-Kurse heraus", () => {
    const kinder = events.filter(isForKids);
    expect(kinder.length).toBeGreaterThan(10);
    expect(kinder.some((e) => e.title.startsWith("KI-Recht in der Schule"))).toBe(false);
    expect(kinder.some((e) => e.title.startsWith("Meine Freundin Roxy"))).toBe(true);
  });

  it("zeigt lokale Bilder (auch ohne Mobilizon-Server)", () => {
    const roxy = events.find((e) => e.title.startsWith("Meine Freundin Roxy"))!;
    expect(roxy.image).toMatch(/^\/events\/[0-9a-f]+\.jpg$/);
  });

  it("zeigt nichts, was schon vorbei ist", () => {
    const spaeter = standEvents(kategorien as Category[], new Date("2026-12-01T00:00:00+01:00"), "http://localhost:4000");
    expect(spaeter.length).toBeLessThan(events.length);
  });
});
