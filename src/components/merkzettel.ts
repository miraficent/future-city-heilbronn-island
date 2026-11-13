"use client";

import { useEffect, useState } from "react";
import { lies, schreibe, loesche } from "@/lib/speicher";
import type { Modus } from "@/lib/entdecken";

export function useMerkzettel(modus: Modus) {
  const [ids, setIds] = useState<string[]>([]);
  const [dauerhaft, setDauerhaft] = useState(false);
  const schluessel = `merkliste.${modus}`;
  function verteile(neu:string[],speichern:boolean){window.dispatchEvent(new CustomEvent("cosmos:merkliste",{detail:{modus,ids:neu,dauerhaft:speichern}}));}
  useEffect(() => {
    const behalten = modus !== "kind" && lies<unknown>("geraet", `${schluessel}.erlaubt`, false) === true;
    const gespeichert = lies<unknown>(behalten ? "geraet" : "sitzung", schluessel, []);
    setDauerhaft(behalten);
    setIds(Array.isArray(gespeichert) ? gespeichert.filter((id): id is string => typeof id === "string") : []);
    const aktualisieren=(event:Event)=>{
      const detail=(event as CustomEvent<{modus:Modus;ids:string[];dauerhaft:boolean}>).detail;
      if(detail?.modus===modus&&Array.isArray(detail.ids)){setIds(detail.ids.filter(id=>typeof id==="string"));setDauerhaft(detail.dauerhaft===true);}
    };
    window.addEventListener("cosmos:merkliste",aktualisieren);
    return()=>window.removeEventListener("cosmos:merkliste",aktualisieren);
  }, [modus, schluessel]);

  function merken(id: string) {
    const neu = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
    setIds(neu);
    schreibe(dauerhaft ? "geraet" : "sitzung", schluessel, neu);
    verteile(neu,dauerhaft);
  }

  function behalten(wert: boolean) {
    if (modus === "kind") return;
    setDauerhaft(wert);
    if (wert) {
      schreibe("geraet", `${schluessel}.erlaubt`, true);
      schreibe("geraet", schluessel, ids);
      loesche("sitzung", schluessel);
    } else {
      loesche("geraet", `${schluessel}.erlaubt`);
      loesche("geraet", schluessel);
      schreibe("sitzung", schluessel, ids);
    }
    verteile(ids,wert);
  }

  function leeren() {
    setIds([]);
    loesche("geraet", schluessel);
    loesche("sitzung", schluessel);
    verteile([],dauerhaft);
  }
  return { ids, merken, dauerhaft, behalten, leeren };
}
