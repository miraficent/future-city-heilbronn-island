import { describe, expect, it } from "vitest";
import { besteStimme } from "@/lib/stimme";

const s = (name: string, lang = "de-DE", localService = true) => ({ name, lang, localService });

describe("besteStimme", () => {
  const windows = [s("Microsoft Stefan - German (Germany)"), s("Microsoft Katja - German (Germany)"), s("Microsoft Hedda - German (Germany)"), s("Google Deutsch", "de-DE", false)];

  it("nimmt für die Eule eine freundliche lokale Stimme", () => {
    expect(besteStimme(windows, "eule")?.name).toContain("Katja");
    expect(besteStimme([s("Microsoft Hedda - German (Germany)")], "eule")?.name).toContain("Hedda");
    expect(besteStimme(windows, "junge")?.name).toContain("Stefan");
    expect(besteStimme(windows, "maedchen")?.name).toContain("Katja");
  });

  it("nutzt nie eine Online-Stimme und keine fremde Sprache", () => {
    expect(besteStimme([s("Google Deutsch", "de-DE", false), s("Samantha", "en-US")])).toBeUndefined();
  });

  it("nimmt sonst irgendeine lokale deutsche Stimme", () => {
    expect(besteStimme([s("Unbekannt", "de-AT"), s("Andere", "de-DE")])?.name).toBe("Andere");
  });
});
