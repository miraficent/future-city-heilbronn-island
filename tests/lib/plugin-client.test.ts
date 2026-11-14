import { describe, expect, it } from "vitest";
import { aktivitaetenFuer, missionsTitel, passendePlugins } from "@/lib/plugin-client";
import { eingebautePlugins } from "@/lib/plugins";
import { STATIONEN } from "@/lib/spiel";

const haus = STATIONEN[0]!;
const plugin = {
  ...eingebautePlugins()[0]!,
  aktivitaeten: haus.aktivitaeten.map((_, n) => ({ titel: `Plugin-Spiel ${n}`, modul: "plugin" as const, html: "<p>Hallo</p>" })),
};

describe("Plugins im Browser", () => {
  it("übernimmt nur Plugins mit passender Form", () => {
    expect(passendePlugins([plugin])).toEqual([plugin]);
    expect(passendePlugins(null)).toEqual([]);
    expect(passendePlugins({ institution: haus.id })).toEqual([]);
    expect(passendePlugins([{ ...plugin, institution: "unbekannt" }])).toEqual([]);
    expect(passendePlugins([{ ...plugin, aktivitaeten: plugin.aktivitaeten.slice(1) }])).toEqual([]);
    expect(passendePlugins([{ ...plugin, aktivitaeten: plugin.aktivitaeten.map(() => ({ modul: "plugin" })) }])).toEqual([]);
  });
  it("liefert die Aktivitäten des Plugins, sonst die eingebauten", () => {
    expect(aktivitaetenFuer([plugin], haus)).toBe(plugin.aktivitaeten);
    expect(aktivitaetenFuer([], haus)).toBe(haus.aktivitaeten);
    expect(aktivitaetenFuer([plugin], STATIONEN[1]!)).toBe(STATIONEN[1]!.aktivitaeten);
  });
  it("benennt Fortschritts-IDs nach dem aktiven Plugin", () => {
    expect(missionsTitel([plugin], `${haus.id}-1`)).toBe("Plugin-Spiel 1");
    expect(missionsTitel([], `${haus.id}-1`)).toBe(haus.aktivitaeten[1]!.titel);
    expect(missionsTitel([plugin], `${haus.id}-99`)).toBeUndefined();
    expect(missionsTitel([plugin], "unbekannt-0")).toBeUndefined();
  });
});
