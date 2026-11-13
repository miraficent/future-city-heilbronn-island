import { describe, expect, it } from "vitest";
import { berlinZuIso, parseDeutschesDatum } from "../../pipeline/verarbeitung/zeit";

describe("berlinZuIso", () => {
  it("setzt Winterzeit-Offset", () => {
    expect(berlinZuIso("2027-02-23", "16:30")).toBe("2027-02-23T16:30:00+01:00");
  });
  it("setzt Sommerzeit-Offset und akzeptiert Sekunden", () => {
    expect(berlinZuIso("2027-07-06", "16:30:00")).toBe("2027-07-06T16:30:00+02:00");
  });
});

describe("parseDeutschesDatum", () => {
  it.each([
    ["23.02.2027", "2027-02-23"],
    ["3.2.2027", "2027-02-03"],
    ["23. November 2026", "2026-11-23"],
    ["1. Dez. 2026", "2026-12-01"],
    ["08 Dez. 2026", "2026-12-08"],
    ["5. März 2027", "2027-03-05"],
  ])("%s", (text, iso) => {
    expect(parseDeutschesDatum(text)).toBe(iso);
  });

  it("gibt null bei Unsinn zurück", () => {
    expect(parseDeutschesDatum("bald")).toBeNull();
  });
});
