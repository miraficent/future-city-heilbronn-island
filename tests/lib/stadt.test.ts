import { describe, expect, it } from "vitest";
import { STATIONEN, abstand, type Punkt } from "@/lib/spiel";
import { aufBahn, aufsWegenetz, INSEL_RADIUS, bewege, bewegeAutos, erzeugeStadt, hausAn, istBegehbar, nahesHaus, neueAutos, planeRoute, zebraBei } from "@/lib/stadt";

const stadt = erzeugeStadt(STATIONEN);

/** Läuft eine Route Stück für Stück ab und prüft jeden Zwischenschritt. */
function laufe(start: Punkt, route: Punkt[]) {
  let pos = start;
  const besucht: Punkt[] = [pos];
  for (const ziel of route) {
    const schritte = Math.ceil(abstand(pos, ziel) / 5);
    for (let i = 1; i <= schritte; i++) {
      const p = { x: pos.x + ((ziel.x - pos.x) * i) / schritte, y: pos.y + ((ziel.y - pos.y) * i) / schritte };
      besucht.push(p);
    }
    pos = ziel;
  }
  return besucht;
}

describe("Stadt-Aufbau", () => {
  it("setzt vier Häuser in zwei Reihen und lässt die Mitte für Platz und Teich frei", () => {
    expect(stadt.haeuser).toHaveLength(4);
    const oben = stadt.haeuser.filter((h) => h.reihe === "oben");
    expect(oben.map((h) => h.station.id)).toEqual(["aim", "experimenta"]);
    expect(stadt.haeuser.every((h) => Math.abs(h.mitteX - stadt.platz.x) > 300)).toBe(true);
  });

  it("wird mit mehr Lernhäusern automatisch länger", () => {
    const mehr = erzeugeStadt([...STATIONEN, { ...STATIONEN[0]!, id: "neu1" }, { ...STATIONEN[1]!, id: "neu2" }]);
    expect(mehr.breite).toBeGreaterThan(stadt.breite);
    for (const h of mehr.haeuser) expect(planeRoute(mehr, mehr.start, h.tuer).length).toBeGreaterThan(0);
  });

  it("lässt die Straße am Tunnel beginnen und im Wendehammer enden", () => {
    expect(stadt.strasse.wende.x + stadt.strasse.wende.r).toBeLessThan(stadt.breite);
    expect(stadt.strasse.tunnelBreite).toBeGreaterThan(0);
  });
});

describe("Begehbar ist nur der Weg", () => {
  it("erlaubt Gehweg, Platz und Zebrastreifen", () => {
    expect(istBegehbar(stadt, stadt.start)).toBe(true);
    expect(istBegehbar(stadt, stadt.platz)).toBe(true);
    const z = stadt.zebras[0]!;
    expect(istBegehbar(stadt, { x: z.x + z.breite / 2, y: z.y + z.hoehe / 2 })).toBe(true);
  });

  it("verbietet Fahrbahn, Wiese, Teich und Häuser", () => {
    const fahrbahn = { x: stadt.platz.x, y: (stadt.strasse.oben + stadt.strasse.unten) / 2 };
    expect(istBegehbar(stadt, fahrbahn)).toBe(false);
    expect(istBegehbar(stadt, { x: 40, y: 60 })).toBe(false);
    expect(istBegehbar(stadt, stadt.teich)).toBe(false);
    const haus = stadt.haeuser[0]!;
    expect(istBegehbar(stadt, { x: haus.mitteX, y: haus.dachY + 60 })).toBe(false);
  });

  it("stellt keine Bäume oder Büsche auf den Weg", () => {
    for (const d of stadt.deko.filter((d) => d.art === "baum" || d.art === "busch")) {
      expect(istBegehbar(stadt, d)).toBe(false);
    }
  });

  it("blockiert die Tastatur am Fahrbahnrand, aber nicht auf dem Zebrastreifen", () => {
    let pos = stadt.start;
    for (let i = 0; i < 60; i++) pos = bewege(stadt, pos, { x: 0, y: 1 }, 0.05);
    expect(pos.y).toBeLessThan(stadt.strasse.oben);

    const z = stadt.zebras[0]!;
    let quer = { x: z.x + z.breite / 2, y: stadt.gehwegNord };
    for (let i = 0; i < 80; i++) quer = bewege(stadt, quer, { x: 0, y: 1 }, 0.05);
    expect(quer.y).toBeGreaterThan(stadt.strasse.unten);
  });

  it("gleitet an Ecken in Abzweige hinein statt hängen zu bleiben", () => {
    const tuer = stadt.haeuser[0]!.tuer;
    let pos = { x: tuer.x + 20, y: stadt.gehwegNord };
    for (let i = 0; i < 40; i++) pos = bewege(stadt, pos, { x: 0, y: -1 }, 0.05);
    expect(abstand(pos, tuer)).toBeLessThan(40);
  });
});

describe("Antippen und Wegsuche", () => {
  it("findet von jedem Startpunkt jede Haustür, ohne den Weg zu verlassen", () => {
    for (const h of stadt.haeuser) {
      const route = planeRoute(stadt, stadt.start, h.tuer);
      expect(route.length).toBeGreaterThan(0);
      expect(abstand(route.at(-1)!, h.tuer)).toBeLessThan(2);
      for (const p of laufe(stadt.start, route)) expect(istBegehbar(stadt, p)).toBe(true);
    }
  });

  it("überquert die Straße nur am Zebrastreifen", () => {
    const unten = stadt.haeuser.find((h) => h.reihe === "unten")!;
    const route = planeRoute(stadt, stadt.start, unten.tuer);
    const aufDerStrasse = laufe(stadt.start, route).filter((p) => p.y > stadt.strasse.oben && p.y < stadt.strasse.unten);
    expect(aufDerStrasse.length).toBeGreaterThan(0);
    for (const p of aufDerStrasse) expect(zebraBei(stadt, p)).toBeGreaterThanOrEqual(0);
  });

  it("macht aus einem Tipp auf die Wiese ein Ziel am nächsten Wegrand", () => {
    const wiese = { x: 60, y: 300 };
    const route = planeRoute(stadt, stadt.start, wiese);
    expect(route.length).toBeGreaterThan(0);
    expect(istBegehbar(stadt, route.at(-1)!)).toBe(true);
    expect(aufsWegenetz(stadt, wiese).distanz).toBeGreaterThan(0);
  });

  it("erkennt ein angetipptes Haus und die nahe Tür", () => {
    const h = stadt.haeuser[1]!;
    expect(hausAn(stadt, { x: h.mitteX, y: h.dachY + 100 })?.station.id).toBe(h.station.id);
    expect(nahesHaus(stadt, h.tuer)?.station.id).toBe(h.station.id);
    expect(nahesHaus(stadt, stadt.start)).toBeUndefined();
  });
});

describe("Autos", () => {
  it("fahren nur auf der Fahrbahn oder im Wendehammer – nie auf den Gehweg", () => {
    for (let s = 0; s < 3200; s += 20) {
      const { punkt } = aufBahn(stadt.autoBahn, s);
      const aufStrasse = punkt.y > stadt.strasse.oben && punkt.y < stadt.strasse.unten;
      const imWendehammer = abstand(punkt, stadt.strasse.wende) <= stadt.strasse.wende.r - 20;
      expect(aufStrasse || imWendehammer).toBe(true);
    }
  });

  it("fahren im Wendehammer um die Mittelinsel herum statt hindurch", () => {
    const AUTO_HALBE_BREITE = 20;
    for (let s = 0; s < 3200; s += 10) {
      const { punkt } = aufBahn(stadt.autoBahn, s);
      expect(abstand(punkt, stadt.strasse.wende)).toBeGreaterThan(INSEL_RADIUS + AUTO_HALBE_BREITE);
    }
  });

  it("halten vor dem Zebrastreifen, solange die Figur darauf steht", () => {
    const z = stadt.zebras[0]!;
    const aufZebra = { x: z.x + z.breite / 2, y: (z.y + z.hoehe / 2) };
    let autos = [{ id: 0, s: Math.max(0, z.x - 150 + 120), farbe: "#f00", wartet: false }];
    for (let i = 0; i < 100; i++) autos = bewegeAutos(stadt, autos, 0.05, aufZebra);
    const vorne = aufBahn(stadt.autoBahn, autos[0]!.s).punkt;
    expect(autos[0]!.wartet).toBe(true);
    expect(vorne.x).toBeLessThan(z.x);

    for (let i = 0; i < 100; i++) autos = bewegeAutos(stadt, autos, 0.05, stadt.start);
    expect(aufBahn(stadt.autoBahn, autos[0]!.s).punkt.x).toBeGreaterThan(z.x + z.breite);
  });

  it("starten mit Abstand zueinander", () => {
    const autos = neueAutos(stadt);
    expect(new Set(autos.map((a) => Math.round(a.s))).size).toBe(autos.length);
  });
});

describe("Route mit echten Laufschritten", () => {
  it("lässt sich mit derselben Bewegungsfunktion wie im Spiel komplett ablaufen", () => {
    for (const h of stadt.haeuser) {
      let pos: Punkt = { ...stadt.start };
      for (const ziel of planeRoute(stadt, pos, h.tuer)) {
        let schritte = 0;
        while (abstand(pos, ziel) > 1 && schritte++ < 600) {
          pos = bewege(stadt, pos, { x: ziel.x - pos.x, y: ziel.y - pos.y }, Math.min(0.04, abstand(pos, ziel) / 230));
        }
        expect(schritte).toBeLessThan(600);
      }
      expect(abstand(pos, h.tuer)).toBeLessThan(3);
    }
  });
});
