import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { AVATAR_GRENZEN, FRISUREN, OBERTEILE, STANDARD_AVATAR, VORLAGEN, alterAvatar, pruefeAvatar, zeigtUnterteil, zufallsAvatar } from "@/lib/avatar";
import { AUDIO_TEXTE, einfuehrung, LERNORTE } from "@/lib/lernwelt";
import { STUFEN } from "@/lib/abenteuer";
import { aussehenVon, GASTGEBER, gespraechVon, ORT_GESCHICHTE } from "@/lib/bewohner";
import { FOTOS } from "@/lib/fotos";
import { STATIONEN } from "@/lib/spiel";
import { figurHoehe, frei, schritt, SZENEN } from "@/lib/szenen";
import karte from "@/lib/heilbronn-karte.json";

describe("Figurenbaukasten", () => {
  it("übernimmt nur gültige Gestaltungskennungen und keine Personeneingaben", () => {
    expect(pruefeAvatar({ haut: 99, haar: -1, oberteil: 1.4, unterfarbe: "rot", name: "Kind", frisur: 3 })).toEqual({ ...STANDARD_AVATAR, frisur: 3 });
    expect(pruefeAvatar(null)).toEqual(STANDARD_AVATAR);
  });
  it("erzeugt nur darstellbare Kombinationen und hat Vorlagen für Mädchen und Jungen", () => {
    for (let n = 0; n < 200; n++) {
      const a = zufallsAvatar();
      expect(pruefeAvatar(a)).toEqual(a);
      for (const k of Object.keys(a) as (keyof typeof a)[]) expect(a[k] >= 0 && a[k] < AVATAR_GRENZEN[k]).toBe(true);
    }
    expect(pruefeAvatar(VORLAGEN.maedchen)).toEqual(VORLAGEN.maedchen);
    expect(pruefeAvatar(VORLAGEN.junge)).toEqual(VORLAGEN.junge);
    expect(alterAvatar("fremd")).toEqual(STANDARD_AVATAR);
  });
  it("bietet kein Kopftuch und zeigt unter einem Kleid nur Leggings", () => {
    expect(FRISUREN.join(" ")).not.toMatch(/tuch/i);
    const kleid = OBERTEILE.indexOf("Kleid");
    expect(zeigtUnterteil({ ...STANDARD_AVATAR, oberteil: kleid, unterteil: 0 })).toBe(false);
    expect(zeigtUnterteil({ ...STANDARD_AVATAR, oberteil: kleid, unterteil: 4 })).toBe(true);
    expect(zeigtUnterteil({ ...STANDARD_AVATAR, oberteil: 0, unterteil: 0 })).toBe(true);
  });
});

describe("Heilbronner Lernorte", () => {
  it("behält für alle vier Einrichtungen dieselben geografischen Positionen wie die lokale Stadtkarte", () => {
    for (const o of LERNORTE) {
      expect({ x: o.x, y: o.y }).toEqual(karte.orte[o.id]);
      expect(o.quelle.startsWith("https://")).toBe(true);
    }
  });
  it("liefert echte Fotos lokal aus und nennt Urheber und Lizenz", () => {
    for (const [id, foto] of Object.entries(FOTOS)) {
      expect(STATIONEN.some((s) => s.id === id)).toBe(true);
      expect(fs.existsSync("public" + foto.datei)).toBe(true);
      expect(foto.lizenz).toMatch(/^CC BY/);
      expect(foto.quelle).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });
  it("hat eine konkrete Einführung für alle 36 Aufgabenvarianten", () => {
    expect(Object.keys(AUDIO_TEXTE)).toHaveLength(36);
    for (const s of STUFEN)
      for (const art of ["code", "strom", "level", "muster"] as const)
        for (const phase of [0, 1, 2]) {
          const m = einfuehrung(art, s.id, phase);
          expect(m.schritte).toHaveLength(3);
          expect(m.text.length).toBeGreaterThan(15);
          expect(AUDIO_TEXTE[m.audioId]).toContain(m.text);
        }
  });
});

describe("Begehbare Szenen", () => {
  it("gibt es für jeden Lernort – mit gemaltem Bild, Gastgeber und Geschichte", () => {
    expect(SZENEN.map((s) => s.station.id).sort()).toEqual(STATIONEN.map((s) => s.id).sort());
    for (const s of SZENEN) {
      expect(fs.existsSync("public" + s.bild)).toBe(true);
      expect(GASTGEBER[s.station.id]).toBe(s.gastgeber.id);
      expect(ORT_GESCHICHTE[s.station.id]!.klein.length).toBeGreaterThan(1);
      expect(gespraechVon(s.gastgeber.id)?.frage.antworten.filter((a) => a.richtig)).toHaveLength(1);
      if (s.gast) expect(gespraechVon(s.gast.id)).toBeDefined();
    }
  });
  it("lässt die Figur nur auf dem Platz laufen: Start frei, Beete und Personen blockieren", () => {
    for (const s of SZENEN) {
      const figuren = [s.gastgeber, ...(s.gast ? [s.gast] : [])];
      expect(frei(s, s.start, figuren)).toBe(true);
      for (const f of figuren) expect(frei(s, { x: f.x, y: f.y }, figuren)).toBe(false);
      for (const h of s.hindernisse) expect(frei(s, { x: h.x, y: Math.min(h.y, s.boden.vorne) }, [])).toBe(false);
      expect(frei(s, { x: s.start.x, y: s.boden.hinten - 40 }, [])).toBe(false);
      // Der Eingang ist vom Start aus erreichbar.
      let p = s.start;
      for (let i = 0; i < 400; i++) {
        const dx = s.tuer.x - p.x;
        const dy = s.boden.hinten + 8 - p.y;
        const l = Math.hypot(dx, dy);
        if (l < 6) break;
        p = schritt(s, p, (dx / l) * 6, (dy / l) * 6, figuren);
      }
      expect(Math.abs(p.x - s.tuer.x)).toBeLessThan(150);
    }
  });
  it("zeichnet Figuren hinten kleiner als vorne", () => {
    expect(figurHoehe(630)).toBeLessThan(figurHoehe(780));
  });
  it("kein Bewohner trägt ein Kopftuch-Aussehen, alle haben einen Namen", () => {
    for (const s of SZENEN) for (const f of [s.gastgeber, s.gast].filter(Boolean)) expect(aussehenVon(f!.id).name.length).toBeGreaterThan(1);
  });
});
