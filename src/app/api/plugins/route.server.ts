import { MAX_PLUGIN_BYTES, PluginSchema } from "@/lib/plugins";
import { entfernePlugin, istAdmin, ladePlugins, speicherePlugin } from "@/lib/plugin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() { return reply(await ladePlugins()); }

export async function POST(request: Request) {
  if (!istAdmin(request)) return reply({ error: "Admin-Passwort fehlt oder ist falsch. Server: COSMOS_ADMIN_PASSWORD konfigurieren." }, 401);
  // Bound the actual streamed body, not just the untrusted Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "Datei fehlt." }, 400);
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_PLUGIN_BYTES) { await reader.cancel(); return reply({ error: "Plugin ist größer als 1 MB." }, 413); }
    chunks.push(value);
  }
  let raw: unknown;
  try { raw = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return reply({ error: "Ungültiges JSON." }, 400); }
  const parsed = PluginSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") }, 400);
  try { await speicherePlugin(parsed.data); return reply({ ok: true }); }
  catch { return reply({ error: "Plugin konnte nicht gespeichert werden." }, 500); }
}

export async function DELETE(request: Request) {
  if (!istAdmin(request)) return reply({ error: "Admin-Passwort fehlt oder ist falsch." }, 401);
  const id = new URL(request.url).searchParams.get("institution");
  if (!id) return reply({ error: "Einrichtung fehlt." }, 400);
  if (!(await ladePlugins()).some(p => p.institution === id)) return reply({ error: "Unbekannte Einrichtung." }, 400);
  try { await entfernePlugin(id); return reply({ ok: true }); }
  catch { return reply({ error: "Zurücksetzen fehlgeschlagen." }, 500); }
}
