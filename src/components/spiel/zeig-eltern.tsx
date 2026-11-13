"use client";

import { useEffect, useState } from "react";
import { Symbol } from "../symbol";

/**
 * Kinder melden sich nicht selbst an. Stattdessen zeigen sie ihre Auswahl einem Erwachsenen:
 * per QR-Code (lokal erzeugt), Teilen-Menü des Geräts oder kopiertem Link.
 * Der Link enthält nur Angebots-Kennungen – keinen Namen, kein Alter.
 */
export function ZeigEltern({ ids, titel = "Zeig's Mama oder Papa!" }: { ids: string[]; titel?: string }) {
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [meldung, setMeldung] = useState("");

  useEffect(() => {
    const link = `${window.location.origin}/sammlung/?ids=${ids.map(encodeURIComponent).join(",")}`;
    setUrl(link);
    let aktiv = true;
    import("qrcode")
      .then((QR) => QR.toDataURL(link, { width: 260, margin: 2, color: { dark: "#1c1934", light: "#ffffff" } }))
      .then((bild) => {
        if (aktiv) setQr(bild);
      })
      .catch(() => setQr(""));
    return () => {
      aktiv = false;
    };
  }, [ids]);

  async function teilen() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Meine Kurs-Ideen", text: "Schau mal, das möchte ich in Heilbronn ausprobieren:", url });
        return;
      } catch {
        // abgebrochen – dann eben kopieren
      }
    }
    await kopieren();
  }

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(url);
      setMeldung("Link kopiert!");
    } catch {
      setMeldung(url);
    }
  }

  if (!ids.length) return null;
  return (
    <div className="zeig-eltern">
      <div className="zeig-eltern-kopf">
        <Symbol name="user" />
        <strong>{titel}</strong>
      </div>
      <div className="zeig-eltern-inhalt">
        {qr ? <img src={qr} alt="QR-Code: Erwachsene scannen ihn mit dem Handy und sehen deine Auswahl." width={150} height={150} /> : <div className="qr-platzhalter" />}
        <div className="zeig-eltern-knoepfe">
          <button className="spiel-knopf spiel-knopf-dunkel" onClick={teilen}>
            <Symbol name="share" />
            Teilen
          </button>
          <button className="spiel-knopf" onClick={kopieren}>
            Link kopieren
          </button>
          <p role="status" className="text-sm">{meldung}</p>
        </div>
      </div>
      <p className="zeig-eltern-hinweis">Anmelden kann nur ein Erwachsener – direkt beim Veranstalter.</p>
    </div>
  );
}
