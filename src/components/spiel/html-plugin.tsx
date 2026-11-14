"use client";
import { useEffect, useRef, useState } from "react";
import type { Stufe } from "@/lib/abenteuer";

const POLICY = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'";
// Läuft vor dem Plugin-Code: Links öffnen nichts. Gegen `location = …` im Plugin-Code
// hilft das nicht; das fängt die Ladeprüfung in `HtmlPlugin` ab.
const LINKSPERRE = "addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a)e.preventDefault();},true);";

export function HtmlPlugin({ html, titel, stufe, geschafft }: { html: string; titel: string; stufe: Stufe; geschafft: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const callback = useRef(geschafft);
  const ladungen = useRef(0);
  const [verlassen, setVerlassen] = useState(false);
  const [durchlauf, setDurchlauf] = useState(0);
  useEffect(() => { callback.current = geschafft; }, [geschafft]);
  useEffect(() => {
    ladungen.current = 0; // neuer Inhalt: die nächste Ladung ist wieder das srcdoc
    let fertig = false;
    const message = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== "cosmos:complete" || fertig) return;
      fertig = true;
      callback.current();
    };
    window.addEventListener("message", message);
    return () => window.removeEventListener("message", message);
  }, [html, stufe, durchlauf]);
  // Die CSP sperrt Ressourcen, aber nicht, dass das Frame selbst eine andere Seite lädt.
  // Jede Ladung nach dem ersten srcdoc ist so eine Navigation: Frame sofort entfernen.
  function geladen() {
    ladungen.current += 1;
    if (ladungen.current > 1) setVerlassen(true);
  }
  if (verlassen) return <div role="alert" style={{ padding: 24, background: "#fffbee" }}>
    <p>Dieses Spiel wollte eine andere Seite öffnen und wurde deshalb angehalten.</p>
    <button className="spiel-knopf" onClick={() => { ladungen.current = 0; setVerlassen(false); setDurchlauf(d => d + 1); }}>Spiel neu starten</button>
  </div>;
  return <iframe key={durchlauf} ref={frame} title={titel} sandbox="allow-scripts" referrerPolicy="no-referrer" onLoad={geladen}
    style={{ width: "100%", height: 480, border: 0, background: "#fffbee" }}
    srcDoc={`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${POLICY}"><meta name="viewport" content="width=device-width,initial-scale=1"><script>window.COSMOS_STUFE=${JSON.stringify(stufe)};${LINKSPERRE}</script></head><body>${html}</body></html>`} />;
}
