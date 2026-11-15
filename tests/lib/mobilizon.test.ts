import { describe, expect, it } from "vitest";
import kategorien from "@/data/categories.json";
import { bildSchluessel, eigenesBild, erkenneAlter, erkenneStandardbilder, erkenneKategorien, htmlZuText, zuLiveEvent, type MobilizonEvent } from "@/lib/mobilizon";
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

  it("Standardbild der Gruppe (Avatar/Banner) wird zur Farbkachel – erkannt am Datei-Hash", () => {
    const standard = new Set([bildSchluessel(`${BASIS}/media/28e8f7343589c050fcc9732bb2cee6c7.png?name=logo.png`)]);
    const mitStandard = mz({ picture: { url: `${BASIS}/media/28e8f7343589c050fcc9732bb2cee6c7.png?name=anderer-name.png` } });
    expect(zuLiveEvent(mitStandard, KAT, BASIS, standard).image).toBeNull();
    expect(zuLiveEvent(mz({}), KAT, BASIS, standard).image).toBe(`${BASIS}/media/abc.jpg?name=bild.jpg`);
  });
});

describe("Standardbilder der Gruppen", () => {
  const STANDARD = `${BASIS}/media/28e8f7343589c050fcc9732bb2cee6c7.png`;
  const FOTO = `${BASIS}/media/67068633c36383feca777a2a45085000.jpg`;
  const ev = (uuid: string, title: string, url: string, width = 1920, height = 1005, gruppe = "aim") =>
    mz({ uuid, title, attributedTo: { preferredUsername: gruppe }, picture: { url, metadata: { width, height } } });
  // Banner ist dasselbe Motiv, von Mobilizon verkleinert neu gespeichert (1600×838, anderer Hash)
  const gruppen = new Map([["aim", [{ schluessel: "7176fc21da3699fdebd472b66a05fbcd", verhaeltnis: 1600 / 838 }]]]);

  it("gleiches Format wie das Gruppenbild und bei mehreren Veranstaltungen → Standardbild", () => {
    const s = erkenneStandardbilder([ev("1", "Kurs A", STANDARD), ev("2", "Kurs B", STANDARD)], gruppen);
    expect(s.has(bildSchluessel(STANDARD))).toBe(true);
  });

  it("eigenes Foto einer Veranstaltung mit mehreren Terminen bleibt ein Foto, auch im gleichen Format", () => {
    expect(erkenneStandardbilder([ev("1", "Show", FOTO), ev("2", "Show", FOTO)], gruppen).size).toBe(0);
  });

  it("anderes Format, andere Gruppe oder ohne Gruppenbild → kein Standardbild", () => {
    expect(erkenneStandardbilder([ev("1", "A", STANDARD, 1080, 1080), ev("2", "B", STANDARD, 1080, 1080)], gruppen).size).toBe(0);
    expect(erkenneStandardbilder([ev("1", "A", STANDARD, 1920, 1005, "hdf"), ev("2", "B", STANDARD, 1920, 1005, "hdf")], gruppen).size).toBe(0);
    expect(erkenneStandardbilder([ev("1", "A", STANDARD), ev("2", "B", STANDARD)], new Map()).size).toBe(0);
  });

  it("dieselbe Datei wie Avatar oder Banner → immer Standardbild", () => {
    const gleich = new Map([["aim", [{ schluessel: bildSchluessel(STANDARD), verhaeltnis: null }]]]);
    expect(erkenneStandardbilder([ev("1", "A", STANDARD)], gleich).has(bildSchluessel(STANDARD))).toBe(true);
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

  it("Stichwörter zählen nur am Wortanfang („stern“ steckt nicht in „meistern“)", () => {
    expect(erkenneKategorien("Die Teams müssen Missionen meistern", KAT)).not.toContain("astronomy");
    expect(erkenneKategorien("Dort präsentieren die Teams", KAT)).not.toContain("biology");
    expect(erkenneKategorien("Er trifft auf Freunde", KAT)).not.toContain("biology");
    // Wortanfang mit Endung bleibt erkannt
    expect(erkenneKategorien("Unter dem Sternenhimmel", KAT)).toContain("astronomy");
    expect(erkenneKategorien("Wir programmieren einen Roboter", KAT)).toContain("coding");
  });

  it("Ort, Einrichtungsname, Links und Hinweise bestimmen kein Thema (sonst ist jede experimenta-Show „Physik“ und „Sterne“)", () => {
    const tiershow = zuLiveEvent(mz({
      title: "Auge in Auge mit Afrikas Tieren",
      description:
        "<p>Die Kuppel des Science Dome lässt dich die Tiere der Savanne erleben. Eine experimenta-Produktion.</p>" +
        "<p>Hinweis: Bei den Angeboten im Science Dome können laute Geräusche, Lichteffekte und helles Licht auftreten.</p>" +
        "<ul><li>Alter: Ab 8 Jahren</li><li>Ort: Science Dome (e1)</li></ul>" +
        "<p>Infos: https://www.experimenta.science/termin/</p>",
      tags: [],
    }), KAT, BASIS);
    expect(tiershow.categories).toEqual(["biology"]);
    // Hinweis ohne eigenen Absatz und ohne das Wort „Hinweis“
    const roboter = zuLiveEvent(mz({
      title: "Meine Freundin Roxy",
      description: "<p>Lizzi repariert einen Roboter. Bei den Angeboten im Science Dome können laute Geräusche, Lichteffekte und helles Licht auftreten.</p>",
      tags: [],
    }), KAT, BASIS);
    expect(roboter.categories).not.toContain("physics");
    // echte Themen im Text zählen weiter
    expect(zuLiveEvent(mz({}), KAT, BASIS).categories).toContain("astronomy");
    expect(erkenneKategorien("Spannende Experimente mit Strom", KAT)).toContain("physics");
  });

  it("HTML wird zu Text, Bilder fallen weg, Zeichen werden entschlüsselt", () => {
    expect(htmlZuText('<p><img src="x"/>A &amp; B</p><p>C&nbsp;D &#8211; E</p>')).toBe("A & B C D – E");
  });
});
