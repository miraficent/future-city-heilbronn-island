import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { eingebautePlugins, MAX_PLUGIN_BYTES, PluginSchema } from "@/lib/plugins";
import { DELETE, GET, POST } from "@/app/api/plugins/route.server";

const directories: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(directories.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});
const request = (body: unknown, password = "test-secret") => new Request("http://localhost/api/plugins/", {
  method: "POST", headers: { Authorization: `Bearer ${password}` }, body: JSON.stringify(body),
});
async function setup() {
  const dir = await mkdtemp(path.join(tmpdir(), "cosmos-plugins-")); directories.push(dir);
  vi.stubEnv("COSMOS_PLUGIN_DIR", dir); vi.stubEnv("COSMOS_ADMIN_PASSWORD", "test-secret");
}

describe("Spielplugins", () => {
  it("liefert alle bisherigen Spiele als gültige Plugins", () => {
    for (const plugin of eingebautePlugins()) expect(PluginSchema.safeParse(plugin).success).toBe(true);
  });
  it("prüft Einrichtung, Version, Anzahl und Varianten", () => {
    const p = eingebautePlugins()[0]!;
    expect(PluginSchema.safeParse({ ...p, institution: "../aim" }).success).toBe(false);
    expect(PluginSchema.safeParse({ ...p, schemaVersion: 2 }).success).toBe(false);
    expect(PluginSchema.safeParse({ ...p, version: "latest" }).success).toBe(false);
    expect(PluginSchema.safeParse({ ...p, aktivitaeten: [] }).success).toBe(false);
    expect(PluginSchema.safeParse({ ...p, aktivitaeten: p.aktivitaeten.map(a => ({ ...a, variante: 999 })) }).success).toBe(false);
    expect(PluginSchema.safeParse({ ...p, aktivitaeten: p.aktivitaeten.map(() => ({ titel: "Spiel", modul: "plugin", html: "<button>Hallo</button>" })) }).success).toBe(true);
  });
  it("sperrt Schreiben ohne Konfiguration und mit falschem Passwort", async () => {
    await setup();
    expect((await POST(request(eingebautePlugins()[0], "falsch"))).status).toBe(401);
    vi.stubEnv("COSMOS_ADMIN_PASSWORD", "");
    expect((await POST(request(eingebautePlugins()[0]))).status).toBe(401);
    expect((await DELETE(new Request("http://localhost/api/plugins/?institution=aim", { method: "DELETE" }))).status).toBe(401);
  });
  it("veröffentlicht dauerhaft, liefert öffentlich und setzt zurück", async () => {
    await setup();
    const plugin = { ...eingebautePlugins()[0]!, name: "Neues Spiel", version: "2.0.0" };
    expect((await POST(request(plugin))).status).toBe(200);
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json())[0].name).toBe("Neues Spiel");
    const reset = await DELETE(new Request(`http://localhost/api/plugins/?institution=${plugin.institution}`, { method: "DELETE", headers: { Authorization: "Bearer test-secret" } }));
    expect(reset.status).toBe(200);
    expect((await (await GET()).json())[0]).toEqual(eingebautePlugins()[0]);
  });
  it("lehnt fehlerhafte und zu große Uploads ab und behält aktive Spiele", async () => {
    await setup();
    expect((await POST(request({ institution: "aim" }))).status).toBe(400);
    expect((await POST(request("x".repeat(MAX_PLUGIN_BYTES)))).status).toBe(413);
    const malformed = new Request("http://localhost/api/plugins/", { method: "POST", headers: { Authorization: "Bearer test-secret" }, body: "{" });
    expect((await POST(malformed)).status).toBe(400);
    expect(await (await GET()).json()).toEqual(eingebautePlugins());
  });
});
