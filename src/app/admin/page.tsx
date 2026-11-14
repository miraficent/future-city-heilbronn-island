import Link from "next/link";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { PluginAdmin } from "@/components/plugin-admin";
export const metadata = { title: "Admin – Spielplugins" };
export default function Admin() {
  return <Seitenrahmen><main id="inhalt" className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8">
    <h1 className="font-display text-4xl font-extrabold">Admin · Spielplugins</h1>
    <p className="mt-5">Pro Einrichtung ein austauschbares Spielplugin. JSON-Datei auswählen, testen und für alle veröffentlichen.</p>
    <p className="mt-3">Eigene Spiele laufen als isoliertes HTML. Anleitung und Format: <code>docs/spielplugins.md</code>.</p>
    <PluginAdmin />
    <p className="mt-8"><Link className="underline" href="/werkstatt/">Lernhaus-Konfiguration bearbeiten</Link> · <Link className="underline" href="/kind/">Zur Spielwelt</Link></p>
  </main></Seitenrahmen>;
}
