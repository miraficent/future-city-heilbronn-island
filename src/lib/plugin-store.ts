import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash, timingSafeEqual } from "node:crypto";
import { eingebautePlugins, PluginSchema, type SpielPlugin } from "./plugins";

// Runtime uploads live on a writable volume; never bundle its contents with the server.
const directory = () => path.resolve(/* turbopackIgnore: true */ process.env.COSMOS_PLUGIN_DIR || "daten/plugins");
const filename = (id: string) => {
  if (!eingebautePlugins().some(p => p.institution === id)) throw new Error("Unbekannte Einrichtung");
  return path.join(directory(), `${id}.json`);
};
export function istAdmin(request: Request): boolean {
  const secret = process.env.COSMOS_ADMIN_PASSWORD;
  if (!secret) return false;
  const actual = request.headers.get("authorization") || "";
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(actual), hash(`Bearer ${secret}`));
}
export async function ladePlugins(): Promise<SpielPlugin[]> {
  return Promise.all(eingebautePlugins().map(async fallback => {
    try {
      const plugin = PluginSchema.parse(JSON.parse(await readFile(filename(fallback.institution), "utf8")));
      if (plugin.institution !== fallback.institution) throw new Error("Falsche Einrichtung");
      return plugin;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error("Spielplugin konnte nicht geladen werden", fallback.institution);
      return fallback;
    }
  }));
}
export async function speicherePlugin(plugin: SpielPlugin) {
  const target = filename(plugin.institution);
  await mkdir(directory(), { recursive: true });
  const temp = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(plugin, null, 2), { flag: "wx" });
    await rename(temp, target);
  } finally { await unlink(temp).catch(() => {}); }
}
export async function entfernePlugin(id: string) {
  try { await unlink(filename(id)); }
  catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
}
