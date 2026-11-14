"use client";
import { useEffect, useState } from "react";
import { eingebautePlugins, MAX_PLUGIN_BYTES, PluginSchema, type SpielPlugin } from "@/lib/plugins";
import { Lernaufgabe } from "./spiel/lernaufgabe";
import { STUFEN, type Stufe } from "@/lib/abenteuer";

export function PluginAdmin() {
  const [plugins, setPlugins] = useState(eingebautePlugins);
  const [id, setId] = useState(plugins[0]!.institution);
  const [passwort, setPasswort] = useState("");
  const [kandidat, setKandidat] = useState<SpielPlugin>();
  const [meldung, setMeldung] = useState("");
  const [busy, setBusy] = useState(false);
  const [stufe, setStufe] = useState<Stufe>("start");
  const [phase, setPhase] = useState(0);
  const [fertig, setFertig] = useState(false);
  const aktuell = plugins.find(p => p.institution === id)!;
  const vorschau = kandidat ?? aktuell;
  const aufgabe = vorschau.aktivitaeten[phase]!;
  async function aktualisieren() {
    const response = await fetch("/api/plugins/", { cache: "no-store" });
    if (!response.ok) throw new Error("Plugin-Server nicht erreichbar.");
    setPlugins(PluginSchema.array().parse(await response.json()));
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/plugins/", { cache: "no-store", signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("Plugin-Server nicht erreichbar."); return r.json(); })
      .then(data => setPlugins(PluginSchema.array().parse(data)))
      .catch(e => { if (!controller.signal.aborted) setMeldung(e.message); });
    return () => controller.abort();
  }, []);
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(vorschau, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `${vorschau.institution}-plugin.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function hochladen(file?: File) {
    setKandidat(undefined); setPhase(0); setFertig(false); setMeldung("");
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > MAX_PLUGIN_BYTES) throw new Error("Maximale Dateigröße: 1 MB.");
      const parsed = PluginSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) throw new Error(parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; "));
      if (parsed.data.institution !== id) throw new Error("Die Plugin-Einrichtung stimmt nicht mit der Auswahl überein.");
      setKandidat(parsed.data); setMeldung("Datei geprüft. Erst Vorschau testen, dann veröffentlichen.");
    } catch (e) { setMeldung(e instanceof Error ? e.message : "Datei konnte nicht gelesen werden."); }
    finally { setBusy(false); }
  }
  async function speichern(reset = false) {
    setBusy(true); setMeldung("");
    try {
      const response = await fetch(`/api/plugins/${reset ? `?institution=${encodeURIComponent(id)}` : ""}`, {
        method: reset ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${passwort}`, "Content-Type": "application/json" },
        body: reset ? undefined : JSON.stringify(kandidat),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Speichern fehlgeschlagen.");
      await aktualisieren(); setKandidat(undefined); setFertig(false);
      setMeldung(reset ? "Eingebautes Spiel wiederhergestellt." : "Veröffentlicht. Alle Besucher laden das Plugin beim nächsten Öffnen der Spielwelt.");
    } catch (e) { setMeldung(e instanceof Error ? e.message : "Server nicht erreichbar."); }
    finally { setBusy(false); }
  }
  return <div className="mt-8 grid gap-6">
    <label>Einrichtung <select className="werkstatt-feld" disabled={busy} value={id} onChange={e => { setId(e.target.value); setKandidat(undefined); setPhase(0); setFertig(false); setMeldung(""); }}>
      {plugins.map(p => <option key={p.institution} value={p.institution}>{p.institution} · {p.name} ({p.version})</option>)}
    </select></label>
    <p>Aktives Plugin: {aktuell.name} · Version {aktuell.version}. Ein Upload ersetzt die Aktivitäten dieser Einrichtung für alle Besucher.</p>
    <div className="flex flex-wrap gap-3">
      <button className="spiel-knopf" disabled={busy} onClick={download}>Plugin herunterladen</button>
      <label className="spiel-knopf">Plugin-Datei auswählen <input type="file" accept=".json,application/json" disabled={busy} onChange={e => { void hochladen(e.target.files?.[0]); e.target.value = ""; }}/></label>
    </div>
    <label>Admin-Passwort <input className="werkstatt-feld" type="password" autoComplete="current-password" value={passwort} onChange={e => setPasswort(e.target.value)} /></label>
    <p className="text-sm">Das Passwort bleibt nur in diesem Fenster. Der Server prüft es bei jeder Veröffentlichung.</p>
    <div className="flex flex-wrap gap-3">
      <button className="spiel-knopf spiel-knopf-dunkel" disabled={busy || !kandidat || !passwort} onClick={() => speichern()}>Für alle veröffentlichen</button>
      <button className="spiel-knopf" disabled={busy || !passwort} onClick={() => speichern(true)}>Eingebautes Spiel wiederherstellen</button>
    </div>
    <p role="status">{busy ? "Wird gespeichert …" : meldung}</p>
    <section aria-label="Plugin-Vorschau" className="werkstatt-vorschau">
      <h2 className="font-display text-xl font-bold">Vorschau: {vorschau.name} ({vorschau.version})</h2>
      <div className="flex flex-wrap gap-3 my-4">
        {STUFEN.map(s => <button className="spiel-knopf" key={s.id} aria-pressed={s.id === stufe} onClick={() => { setStufe(s.id); setFertig(false); }}>{s.name}</button>)}
        {vorschau.aktivitaeten.map((a, n) => <button className="spiel-knopf" key={n} aria-pressed={phase === n} onClick={() => { setPhase(n); setFertig(false); }}>{a.titel}</button>)}
      </div>
      <Lernaufgabe key={`${JSON.stringify(vorschau)}-${phase}-${stufe}`} aktivitaet={aufgabe} stufe={stufe} geschafft={() => setFertig(true)} />
      {fertig && <p role="status">Abschluss erkannt – das Spiel würde jetzt den Fortschritt speichern.</p>}
    </section>
  </div>;
}
