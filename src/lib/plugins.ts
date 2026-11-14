import { z } from "zod";
import { AktivitaetSchema, CheckpointSchema } from "./checkpoint";
import { STATIONEN } from "./spiel";

export const MAX_PLUGIN_BYTES = 1_000_000;
export const PluginSchema = z.strictObject({
  schemaVersion: z.literal(1),
  institution: z.string(),
  name: z.string().min(1).max(120),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  aktivitaeten: z.array(AktivitaetSchema).min(1).max(20),
}).superRefine((plugin, ctx) => {
  const haus = STATIONEN.find(s => s.id === plugin.institution);
  if (!haus) ctx.addIssue({ code: "custom", path: ["institution"], message: "Unbekannte Einrichtung." });
  // Keep mission IDs and the existing progress/recommendation system compatible.
  if (haus && plugin.aktivitaeten.length !== haus.aktivitaeten.length)
    ctx.addIssue({ code: "custom", path: ["aktivitaeten"], message: `Diese Einrichtung braucht ${haus.aktivitaeten.length} Aktivitäten.` });
  plugin.aktivitaeten.forEach((a, i) => {
    if (a.modul === "plugin" || a.modul === "lektion") return;
    const original = { ...haus, aktivitaeten: [a] };
    const result = CheckpointSchema.safeParse(original);
    if (!result.success) ctx.addIssue({ code: "custom", path: ["aktivitaeten", i], message: "Ungültiges Modul oder ungültige Variante." });
  });
});
export type SpielPlugin = z.infer<typeof PluginSchema>;
export const eingebautePlugins = (): SpielPlugin[] => STATIONEN.map(s => ({
  schemaVersion: 1, institution: s.id, name: s.titel, version: "1.0.0", aktivitaeten: s.aktivitaeten,
}));
