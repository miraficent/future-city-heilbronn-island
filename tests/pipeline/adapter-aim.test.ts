import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseKuferDetail, parseKuferListe } from "../../pipeline/adapters/kufer-html";
import { leseIcs } from "../../pipeline/verarbeitung/ics-lesen";

const BASIS = "https://www.aim-akademie.org/";

describe("aim-Liste (kufer-html)", () => {
  const { kurse, naechsteSeite } = parseKuferListe(readFileSync("tests/fixtures/aim-liste.html", "utf8"), BASIS);

  it("liest alle Kurse mit Kursnummer, Titel und Detail-URL", () => {
    expect(kurse).toHaveLength(12);
    const plants = kurse.find((k) => k.knr === "271420SG");
    expect(plants?.titel).toBe("Talking Plants – Programmiere deine Pflanze, bis sie spricht (12–16 Jahre)");
    expect(plants?.detailUrl).toBe(
      "https://www.aim-akademie.org/kurse/kurs/Talking-Plants-Programmiere-deine-Pflanze-bis-sie-spricht-1216-Jahre/271420SG",
    );
    expect(plants?.status).toBe("frei");
    expect(plants?.ort).toBe("Bildungscampus");
    expect(plants?.tags).toContain("Schüler/in");
  });

  it("hat ohne Blätter-Link keine nächste Seite", () => {
    expect(naechsteSeite).toBeUndefined();
  });

  it("findet den Blätter-Link auf langen Listen", () => {
    const seite1 = parseKuferListe(readFileSync("tests/fixtures/aim-liste-seite1.html", "utf8"), BASIS);
    expect(seite1.naechsteSeite).toMatch(/^https:\/\/www\.aim-akademie\.org\/kurse\/suche\?knr=\w+&browse=forward$/);
  });
});

describe("aim-Detailseite", () => {
  const detail = parseKuferDetail(readFileSync("tests/fixtures/aim-detail.html", "utf8"));

  it("liest die Beschreibung ohne Datenschutz-Hinweis", () => {
    expect(detail.beschreibung).toMatch(/^Starte deine eigene Weltraummission/);
    expect(detail.beschreibung).toContain("Scratch");
    expect(detail.beschreibung).not.toContain("Hinweis zur Datenverarbeitung");
  });

  it("liest Kosten „keine“ als 0 €", () => {
    expect(detail.kostenEuro).toBe(0);
  });
});

describe("leseIcs", () => {
  const { termine, ort } = leseIcs(readFileSync("tests/fixtures/aim-kurs.ics", "utf8"));

  it("liest alle Termine mit Berliner Zeit", () => {
    expect(termine).toHaveLength(16);
    expect(termine[0]).toEqual({ start: "2027-02-23T16:30:00+01:00", ende: "2027-02-23T18:10:00+01:00" });
  });

  it("zieht eine Postadresse aus LOCATION", () => {
    expect(ort).toBe("Bildungscampus 7, 74076 Heilbronn");
  });
});
