import { describe, expect, it } from "vitest";
import type { Angebot } from "@/lib/angebot";
import {
  aktiveFilter,
  alterHinweis,
  angebotAusEvent,
  elternSuche,
  kindWuensche,
  kurzTitel,
  LEERER_ELTERN_FILTER,
  nachZeitGruppieren,
  ortText,
  preisText,
  tageszeitVon,
  terminband,
  themaName,
  themenFuer,
  type ElternFilter,
} from "@/lib/eltern-suche";
import type { LiveEvent } from "@/types";

// Freitag, 13. November 2026, 12 Uhr in Heilbronn
const JETZT = new Date("2026-11-13T12:00:00+01:00");

function a(id: string, teil: Partial<Angebot> = {}): Angebot {
  return {
    id,
    quelle: "aim",
    titel: `Kurs ${id}`,
    teaser: "",
    url: "https://example.org/",
    themen: ["coding"],
    art: "kurs",
    zielgruppen: ["kinder"],
    alterMin: 8,
    alterMax: 11,
    termine: [{ start: "2026-12-01T10:00:00+01:00" }],
    ort: { name: "Bildungscampus", online: false },
    kosten: { euro: 0, text: "kostenlos" },
    status: "frei",
    sicherheit: 0.9,
    ausloeser: [],
    erstmalsGesehen: "2026-11-13",
    ...teil,
  };
}

function ev(id: string, teil: Partial<LiveEvent> = {}): LiveEvent {
  return {
    id,
    institutionId: "experimenta",
    title: `Event ${id}`,
    title_kids: `Event ${id}`,
    categories: ["coding"],
    ageMin: 8,
    ageMax: null,
    type: "workshop",
    start: "2026-11-20T15:00:00+01:00",
    end: null,
    location: "experimenta",
    cost: "kostenlos",
    image: null,
    story_kids: "", kinder: {},
    description_parents: "",
    registrationUrl: "https://example.org/anmelden",
    sourceUrl: "https://example.org/",
    lastUpdated: "2026-11-13",
    needsReview: false,
    isDummy: false,
    ...teil,
  };
}

const filter = (teil: Partial<ElternFilter>): ElternFilter => ({ ...LEERER_ELTERN_FILTER, ...teil });

describe("tageszeitVon", () => {
  it("ordnet nach Berliner Uhrzeit", () => {
    expect(tageszeitVon("2026-11-14T09:30:00+01:00")).toBe("vormittags");
    expect(tageszeitVon("2026-11-14T15:00:00+01:00")).toBe("nachmittags");
    expect(tageszeitVon("2026-11-14T17:00:00+01:00")).toBe("abends");
    // 23 Uhr UTC ist in Berlin schon 0 Uhr – also vormittags
    expect(tageszeitVon("2026-11-14T23:30:00Z")).toBe("vormittags");
  });
});

describe("elternSuche", () => {
  const samstag = a("sa", { termine: [{ start: "2026-11-14T10:00:00+01:00" }] });
  const dienstag = a("di", { termine: [{ start: "2026-11-17T16:30:00+01:00" }] });
  const mehrere = a("mehr", {
    termine: [
      { start: "2026-11-10T10:00:00+01:00" },
      { start: "2026-11-18T18:00:00+01:00" },
      { start: "2026-11-21T10:00:00+01:00" },
    ],
  });

  it("liefert ohne Filter alle kommenden Angebote, nach erstem Termin sortiert", () => {
    const treffer = elternSuche([dienstag, mehrere, samstag], LEERER_ELTERN_FILTER, JETZT);
    expect(treffer.map((t) => t.angebot.id)).toEqual(["sa", "di", "mehr"]);
    expect(treffer[2]?.termin.start).toBe("2026-11-18T18:00:00+01:00");
    expect(treffer[2]?.weitere).toBe(1);
  });

  it("filtert nach Wochenende und zeigt den passenden Termin", () => {
    const treffer = elternSuche([dienstag, mehrere, samstag], filter({ wochentage: "wochenende" }), JETZT);
    expect(treffer.map((t) => t.angebot.id)).toEqual(["sa", "mehr"]);
    expect(treffer[1]?.termin.start).toBe("2026-11-21T10:00:00+01:00");
  });

  it("filtert nach Tageszeit und nach einem bestimmten Tag", () => {
    expect(elternSuche([dienstag, mehrere, samstag], filter({ tageszeiten: ["abends"] }), JETZT).map((t) => t.angebot.id)).toEqual(["mehr"]);
    expect(elternSuche([dienstag, mehrere, samstag], filter({ tag: "2026-11-17" }), JETZT).map((t) => t.angebot.id)).toEqual(["di"]);
  });

  it("beachtet den Zeitraum für jeden Termin", () => {
    const spaet = a("spaet", { termine: [{ start: "2026-11-15T10:00:00+01:00" }, { start: "2026-12-12T10:00:00+01:00" }] });
    const treffer = elternSuche([spaet], filter({ zeitraum: "woche", wochentage: "wochenende" }), JETZT);
    expect(treffer).toHaveLength(1);
    expect(treffer[0]?.termin.start).toBe("2026-11-15T10:00:00+01:00");
  });

  it("nutzt die bestehenden Filter (Thema, Alter, kostenlos)", () => {
    const ki = a("ki", { themen: ["ki"], kosten: { euro: 30, text: "30 €" }, alterMin: 14, alterMax: 17 });
    expect(elternSuche([ki, dienstag], filter({ themen: ["ki"] }), JETZT).map((t) => t.angebot.id)).toEqual(["ki"]);
    expect(elternSuche([ki, dienstag], filter({ nurKostenlos: true }), JETZT).map((t) => t.angebot.id)).toEqual(["di"]);
    expect(elternSuche([ki, dienstag], filter({ alter: 9 }), JETZT).map((t) => t.angebot.id)).toEqual(["di"]);
  });
});

describe("terminband", () => {
  it("zählt Angebote je Tag und ignoriert dabei den gewählten Tag", () => {
    const angebote = [
      a("1", { termine: [{ start: "2026-11-14T10:00:00+01:00" }] }),
      a("2", { termine: [{ start: "2026-11-14T15:00:00+01:00" }, { start: "2026-11-16T15:00:00+01:00" }] }),
    ];
    const band = terminband(angebote, filter({ tag: "2026-11-16" }), JETZT, 7);
    expect(band).toHaveLength(7);
    expect(band[0]).toMatchObject({ tag: "2026-11-13", anzahl: 0, heute: true, wochenende: false });
    expect(band[1]).toMatchObject({ tag: "2026-11-14", anzahl: 2, wochenende: true });
    expect(band[3]).toMatchObject({ tag: "2026-11-16", anzahl: 1 });
  });
});

describe("nachZeitGruppieren", () => {
  it("bildet Diese Woche, Nächste Woche und danach Monate", () => {
    const treffer = elternSuche(
      [
        a("1", { termine: [{ start: "2026-11-15T10:00:00+01:00" }] }),
        a("2", { termine: [{ start: "2026-11-16T10:00:00+01:00" }] }),
        a("3", { termine: [{ start: "2026-11-30T10:00:00+01:00" }] }),
        a("4", { termine: [{ start: "2026-12-03T10:00:00+01:00" }] }),
      ],
      LEERER_ELTERN_FILTER,
      JETZT,
    );
    const gruppen = nachZeitGruppieren(treffer, JETZT);
    expect(gruppen.map((g) => [g.titel, g.treffer.length])).toEqual([
      ["Diese Woche", 1],
      ["Nächste Woche", 1],
      ["November 2026", 1],
      ["Dezember 2026", 1],
    ]);
  });
});

describe("aktiveFilter", () => {
  it("beschreibt jeden Filter und kann ihn einzeln entfernen", () => {
    const f = filter({ suche: "Scratch", themen: ["coding"], alter: 9, nurKostenlos: true, tageszeiten: ["abends"] });
    const liste = aktiveFilter(f, { themen: { coding: "Coding & Robotik" }, quellen: {} });
    expect(liste.map((x) => x.text)).toEqual(["„Scratch“", "Coding & Robotik", "9 Jahre", "Abends", "Kostenlos"]);
    const ohneAlter = liste.find((x) => x.text === "9 Jahre")?.ohne;
    expect(ohneAlter?.alter).toBeUndefined();
    expect(ohneAlter?.themen).toEqual(["coding"]);
  });

  it("ist leer, wenn nichts gewählt ist", () => {
    expect(aktiveFilter(LEERER_ELTERN_FILTER, { themen: {}, quellen: {} })).toEqual([]);
  });
});

describe("Texte für Karten", () => {
  it("kürzt Altersangaben am Ende des Titels", () => {
    expect(kurzTitel("Visuelle Programmierung mit Scratch (8–11 Jahre)")).toBe("Visuelle Programmierung mit Scratch");
    expect(kurzTitel("Python lernen mit KI (ab 16 Jahren)")).toBe("Python lernen mit KI");
    expect(kurzTitel("Roboter (Teil 2) bauen")).toBe("Roboter (Teil 2) bauen");
  });

  it("zeigt einen hilfreichen Ort statt nur der Stadt", () => {
    expect(ortText(a("1"))).toBe("Bildungscampus");
    expect(ortText(a("1", { ort: { name: "Heilbronn", adresse: "Heilbronn, Haus der Familie, Erich-Mendelsohn-Str. 1C, Raum 8", online: false } }))).toBe("Haus der Familie");
    expect(ortText(a("1", { ort: { name: "Heilbronn", online: false } }))).toBe("Heilbronn");
    expect(ortText(a("1", { ort: { name: "Zoom", online: true } }))).toBe("Online");
  });

  it("zeigt Preise verständlich", () => {
    expect(preisText(a("1"))).toBe("Kostenlos");
    expect(preisText(a("1", { kosten: { euro: null, text: "siehe Anbieter" } }))).toBe("Preis beim Anbieter");
    expect(preisText(a("1", { kosten: { euro: 30, text: "30 €" } }))).toBe("30 €");
  });

  it("markiert ein unbekanntes Alter bei Kinderangeboten, erfindet aber keins", () => {
    expect(alterHinweis(a("1"))).toEqual({ text: "8–11 Jahre", unklar: false });
    expect(alterHinweis(a("1", { alterMin: undefined, alterMax: undefined }))).toEqual({ text: "Alter unklar", unklar: true });
    expect(alterHinweis(a("1", { alterMin: undefined, alterMax: undefined, zielgruppen: ["fachkraefte"] }))).toEqual({ text: "für Fachkräfte", unklar: false });
    expect(alterHinweis(a("1", { alterMin: undefined, alterMax: undefined, zielgruppen: [] }))).toEqual({ text: "Alter unklar", unklar: true });
  });
});

describe("kindWuensche", () => {
  const namen = { aim: "aim", experimenta: "experimenta" };

  it("führt Kurse und Live-Events in einem Format zusammen, kommende zuerst", () => {
    const kurs = a("aim:1", { titel: "Scratch (8–11 Jahre)", termine: [{ start: "2026-11-10T10:00:00+01:00" }, { start: "2026-11-24T16:30:00+01:00" }] });
    const vorbei = a("aim:2", { termine: [{ start: "2026-11-01T10:00:00+01:00" }] });
    const liste = kindWuensche(["aim:2", "ev:x", "aim:1", "unbekannt"], [kurs, vorbei], [ev("x")], namen, JETZT);
    expect(liste.map((w) => w.id)).toEqual(["ev:x", "aim:1", "aim:2"]);
    expect(liste[0]).toMatchObject({ einrichtung: "experimenta", alter: "ab 8 Jahren", preis: "Kostenlos", anmeldeUrl: "https://example.org/anmelden", vorbei: false });
    expect(liste[1]).toMatchObject({ titel: "Scratch", start: "2026-11-24T16:30:00+01:00", detailPfad: "/angebot/aim~1/", vorbei: false });
    expect(liste[2]?.vorbei).toBe(true);
  });

  it("kennzeichnet Beispiel-Events und unbekannte Preise", () => {
    const [w] = kindWuensche(["ev:y"], [], [ev("y", { isDummy: true, cost: null, ageMin: null })], namen, JETZT);
    expect(w).toMatchObject({ beispiel: true, preis: "Preis beim Anbieter", alter: "Alter unklar" });
  });
});

describe("angebotAusEvent", () => {
  it("formt ein Live-Event in das Angebotsformat um, ohne etwas zu erfinden", () => {
    const x = angebotAusEvent(ev("m1", { categories: ["it", "astronomy"], ageMin: 8, ageMax: 12, end: "2026-11-20T17:00:00+01:00", type: "course" }));
    expect(x).toMatchObject({
      id: "ev:m1",
      quelle: "experimenta",
      themen: ["ki", "astronomy"],
      art: "kurs",
      zielgruppen: ["kinder", "teens"],
      alterMin: 8,
      alterMax: 12,
      termine: [{ start: "2026-11-20T15:00:00+01:00", ende: "2026-11-20T17:00:00+01:00" }],
      kosten: { euro: 0, text: "kostenlos" },
      status: "unbekannt",
      url: "https://example.org/anmelden",
    });
  });

  it("lässt ein unbekanntes Alter und einen unbekannten Preis offen", () => {
    const x = angebotAusEvent(ev("m2", { ageMin: null, cost: null }));
    expect(x.alterMin).toBeUndefined();
    expect(alterHinweis(x)).toEqual({ text: "Alter unklar", unklar: true });
    expect(preisText(x)).toBe("Preis beim Anbieter");
  });

  it("ist mit der Suche nutzbar", () => {
    const treffer = elternSuche([angebotAusEvent(ev("m3"))], filter({ themen: ["coding"], alter: 9 }), JETZT);
    expect(treffer.map((t) => t.angebot.id)).toEqual(["ev:m3"]);
  });
});

describe("themenFuer", () => {
  it("zeigt nur Themen, die vorkommen – Kurs-Themen zuerst", () => {
    const basis = [{ id: "ki", name: "Künstliche Intelligenz", symbol: "robot", schlagwoerter: [] }, { id: "gaming", name: "Gaming", symbol: "controller", schlagwoerter: [] }];
    const kategorien = [{ id: "astronomy" as const, label_kids: "Sterne & Weltall", icon: "planet", color: "#3B4CCA", keywords: [] }];
    const liste = themenFuer(basis, kategorien, [a("1", { themen: ["astronomy", "ki"] })]);
    expect(liste.map((t) => [t.id, t.name])).toEqual([["ki", "Künstliche Intelligenz"], ["astronomy", "Sterne & Weltall"]]);
  });
});

describe("Englisch", () => {
  it("übersetzt Gruppen, Filter, Alter und Preis", () => {
    const treffer = elternSuche([a("1", { termine: [{ start: "2026-11-15T10:00:00+01:00" }] }), a("2", { termine: [{ start: "2026-12-03T10:00:00+01:00" }] })], LEERER_ELTERN_FILTER, JETZT);
    expect(nachZeitGruppieren(treffer, JETZT, "en").map((g) => g.titel)).toEqual(["This week", "December 2026"]);
    const liste = aktiveFilter(filter({ alter: 9, wochentage: "wochenende", nurKostenlos: true, tag: "2026-11-21" }), { themen: {}, quellen: {} }, "en");
    expect(liste.map((x) => x.text)).toEqual(["9 years", "Sat 21 Nov", "Weekends", "Free"]);
    expect(alterHinweis(a("1"), "en")).toEqual({ text: "8–11 years", unklar: false });
    expect(alterHinweis(a("1", { alterMin: undefined, alterMax: undefined, zielgruppen: ["eltern"] }), "en").text).toBe("for parents");
    expect(preisText(a("1", { kosten: { euro: null, text: "siehe Anbieter" } }), "en")).toBe("Price: see provider");
    expect(themaName({ id: "ki", name: "Künstliche Intelligenz" }, "en")).toBe("Artificial intelligence");
    expect(themaName({ id: "neu", name: "Neues Thema" }, "en")).toBe("Neues Thema");
  });
});
