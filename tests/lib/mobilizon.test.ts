import { describe, expect, it } from "vitest";
import kategorien from "@/data/categories.json";
import { eigenesBild, erkenneAlter, erkenneKategorien, htmlZuText, zuLiveEvent, type MobilizonEvent } from "@/lib/mobilizon";
import { isForKids } from "@/lib/events";
import type { Category } from "@/types";

const KAT = kategorien as Category[];
const BASIS = "http://localhost:4000";

function mz(teil: Partial<MobilizonEvent>): MobilizonEvent {
  return {
    uuid: "abc-123",
    title: "Abenteuerreise durchs Sonnensystem – 3D",
    description:
      '<p><img src="https://example.org/bild.jpg" alt="x"/></p><p>Eine Reise vom Merkur bis zum Pluto.</p>' +
      "<ul><li>Alter: Ab 8 Jahren</li><li>Ort: Science Dome (e1)</li><li>Preis: 6,00 Euro Erwachsene / 4,00 Euro ermäßigt</li></ul>" +
      '<p>Tickets &amp; Infos: <a href="https://www.experimenta.science/termin/?a=1&amp;b=2">Link</a></p>',
    beginsOn: "2026-12-06T13:30:00Z",
    endsOn: "2026-12-06T13:56:00Z",
    status: "CONFIRMED",
    onlineAddress: null,
    externalParticipationUrl: null,
    physicalAddress: { description: "experimenta", locality: "Heilbronn" },
    attributedTo: { preferredUsername: "experimenta" },
    organizerActor: null,
    tags: [{ title: "science-dome-shows" }, { title: "6-10 Jahre" }, { title: "10-14 Jahre" }],
    picture: { url: `${BASIS}/media/abc.jpg?name=bild.jpg` },
    ...teil,
  };
}

describe("Mobilizon → LiveEvent", () => {
  it("übernimmt Einrichtung, Alter aus dem Text, Preis und Anmelde-Link", () => {
    const e = zuLiveEvent(mz({}), KAT, BASIS);
    expect(e.id).toBe("mz-abc-123");
    expect(e.institutionId).toBe("experimenta");
    expect([e.ageMin, e.ageMax]).toEqual([8, null]); // Text („Ab 8 Jahren“) vor den groben Tags
    expect(e.cost).toBe("6,00 Euro Erwachsene / 4,00 Euro ermäßigt");
    expect(e.registrationUrl).toBe("https://www.experimenta.science/termin/?a=1&b=2");
    expect(e.sourceUrl).toBe(`${BASIS}/events/abc-123`);
    expect(e.categories).toContain("astronomy");
    expect(e.type).toBe("show");
    expect(e.image).toBe(`${BASIS}/media/abc.jpg?name=bild.jpg`);
    expect(e.needsReview).toBe(false);
    expect(isForKids(e)).toBe(true);
  });

  it("ohne erkanntes Alter: zur Prüfung, Kinder sehen es nicht", () => {
    const e = zuLiveEvent(mz({ title: "KI Salon", description: "<p>Vortrag für Entscheider:innen.</p>", tags: [] }), KAT, BASIS);
    expect(e.ageMin).toBeNull();
    expect(e.needsReview).toBe(true);
    expect(isForKids(e)).toBe(false);
  });

  it("ohne externen Link: Mobilizon-Seite als Anmeldung; „kostenfrei“ wird „kostenlos“", () => {
    const e = zuLiveEvent(mz({ description: "<ul><li>Teilnahme: kostenfrei</li></ul>" }), KAT, BASIS);
    expect(e.registrationUrl).toBe(`${BASIS}/events/abc-123`);
    expect(e.cost).toBe("kostenlos");
  });

  it("unbekannte Gruppe: Einrichtung aus Ort/Titel", () => {
    const e = zuLiveEvent(mz({ attributedTo: null, physicalAddress: { description: "Haus der Familie", locality: "Heilbronn" } }), KAT, BASIS);
    expect(e.institutionId).toBe("hdf");
  });
});

describe("Titelbild", () => {
  it("nur von der eigenen Instanz, nie von fremden Servern", () => {
    expect(eigenesBild(`${BASIS}/media/x.jpg`, BASIS)).toBe(`${BASIS}/media/x.jpg`);
    expect(eigenesBild("https://www.experimenta.science/bild.jpg", BASIS)).toBeNull();
    expect(eigenesBild(null, BASIS)).toBeNull();
    expect(zuLiveEvent(mz({ picture: null }), KAT, BASIS).image).toBeNull();
  });
});

describe("Einordnung", () => {
  it("Alter aus Tags, wenn der Text nichts sagt", () => {
    expect(erkenneAlter("Ein Abend", ["6-10 Jahre", "10-14 Jahre"])).toEqual([6, 14]);
    expect(erkenneAlter("Ein Abend", ["6-10 Jahre", "Erwachsene"])).toEqual([6, null]);
    expect(erkenneAlter("Ein Abend", ["Erwachsene"])).toEqual([18, null]);
    expect(erkenneAlter("Ein Abend", [])).toEqual([null, null]);
  });

  it("kurze Stichwörter nur als ganzes Wort („ki“ steckt nicht in „Kinder“)", () => {
    expect(erkenneKategorien("Ein Nachmittag für Kinder", KAT)).not.toContain("it");
    expect(erkenneKategorien("Was kann KI?", KAT)).toContain("it");
  });

  it("HTML wird zu Text, Bilder fallen weg, Zeichen werden entschlüsselt", () => {
    expect(htmlZuText('<p><img src="x"/>A &amp; B</p><p>C&nbsp;D &#8211; E</p>')).toBe("A & B C D – E");
  });
});
