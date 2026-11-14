"use client";

/**
 * Einfaches Formular für neue Einrichtungen – ohne Server (Prototyp).
 * Es wird nichts gesendet oder gespeichert; nach dem Absenden erscheint nur ein Hinweis.
 */
import { useState, type FormEvent } from "react";
import { Badge, Button } from "./ui";

export function MitmachenFormular() {
  const [fertig, setFertig] = useState(false);

  function absenden(e: FormEvent) {
    e.preventDefault();
    setFertig(true);
  }

  if (fertig) {
    return (
      <div className="mt-4 grid gap-3">
        <Badge art="success" icon="check">Danke!</Badge>
        <p>
          Dies ist ein Prototyp – es wurde nichts gesendet oder gespeichert. Im echten Betrieb meldet sich das Team,
          und eure Quelle wird als eine Zeile in die Quellenliste eingetragen.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-4 grid gap-4" onSubmit={absenden}>
      <label className="ui-feld">Name der Einrichtung<input name="name" required /></label>
      <label className="ui-feld">Webseite mit euren Angeboten<input name="webseite" type="url" placeholder="https://" required /></label>
      <label className="ui-feld">Was bietet ihr an?<textarea name="angebote" rows={3} /></label>
      <p className="text-sm text-tinte-2">Prototyp: Das Formular sendet nichts.</p>
      <div><Button variante="primary" groesse="parents" icon="plus" typ="submit">Absenden</Button></div>
    </form>
  );
}
