"use client";
import { useState } from "react";

export function SpeicherVerwalten() {
  const [meldung, setMeldung] = useState("");
  function loeschen() {
    try {
      for (const speicher of [window.localStorage, window.sessionStorage]) {
        const keys = Array.from({ length: speicher.length }, (_, i) => speicher.key(i));
        for (const key of keys) if (key?.startsWith("cosmos.")) speicher.removeItem(key);
      }
      setMeldung("Alle COSMOS-Sammlungen und Speichereinstellungen in diesem Browser wurden gelöscht. Bereits geöffnete Ansichten bitte neu laden.");
    } catch { setMeldung("Der Browser erlaubt keinen Speicherzugriff. Du kannst die Website-Daten in seinen Einstellungen löschen."); }
  }
  return <div className="mt-6 rounded-2xl border-2 border-tinte p-5"><button className="knopf" onClick={loeschen}>Alle COSMOS-Daten in diesem Browser löschen</button><p role="status" className="mt-3 text-sm">{meldung}</p></div>;
}
