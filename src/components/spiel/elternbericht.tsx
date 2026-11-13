"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { empfehlungen, MISSIONEN, neuerSpielstand, pruefeSpielstand, STUFEN, stufeFuerAlter, WUENSCHE, type Spielstand } from "@/lib/abenteuer";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import { lies, schreibe } from "@/lib/speicher";
import { STATIONEN } from "@/lib/spiel";
import { Angebotskarte } from "../angebotskarte";
import { useSammlung } from "../sammlung";
import { Symbol } from "../symbol";
import { PixelBild } from "./pixel-grafik";
export function Elternbericht({angebote,meta,jetzt}:{angebote:Angebot[];meta:Meta;jetzt:string}){
  const [stand,setStand]=useState<Spielstand>(neuerSpielstand),[geladen,setGeladen]=useState(false),[uhr,setUhr]=useState(jetzt);
  const merk=useSammlung("eltern"),stufe=stufeFuerAlter(stand.alter),ids=stand.fortschritt[stufe],vorschlaege=empfehlungen(angebote,stand,new Date(uhr));
  useEffect(()=>{setStand(pruefeSpielstand(lies("sitzung","abenteuer.v2",null)));setGeladen(true);setUhr(new Date().toISOString());},[]);
  function wunsch(id:string){const neu={...stand,wuensche:stand.wuensche.includes(id)?stand.wuensche.filter(x=>x!==id):[...stand.wuensche,id]};setStand(neu);schreibe("sitzung","abenteuer.v2",neu);}
  function exportieren(){const bericht={projekt:"COSMOS-Entdecker",altersstufe:STUFEN.find(s=>s.id===stufe)?.alter,erkundet:MISSIONEN.filter(m=>ids.includes(m.id)).map(m=>m.titel),wuensche:WUENSCHE.filter(w=>stand.wuensche.includes(w.id)).map(w=>w.titel),vorschlaege:vorschlaege.map(v=>({thema:v.titel,grund:v.grund,angebote:v.angebote.map(a=>({titel:a.titel,originalseite:a.url}))})),hinweis:"Interessenorientierung aus freiwilligem Spielen; keine Leistungs- oder Eignungsbeurteilung. Nichts wurde an Einrichtungen gesendet."};const url=URL.createObjectURL(new Blob([JSON.stringify(bericht,null,2)],{type:"application/json;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download="COSMOS-Entdeckungen.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <section id="spielbericht" className="familienbericht" aria-labelledby="bericht-titel"><div className="bericht-kopf"><PixelBild motiv="roboter"/><div><p className="spiel-kennung">GEMEINSAM WEITERENTDECKEN</p><h1 id="bericht-titel">Von der Spielidee zum echten Kurs.</h1><p>Besprecht, was Spaß gemacht hat. Dann sucht ihr zusammen weiter.</p></div></div>
    {!geladen?<p>Entdeckungen werden auf diesem Gerät geöffnet.</p>:<><div className="bericht-kapitel">{STATIONEN.map(s=><div key={s.id}><PixelBild motiv={s.grafik}/><strong>{s.kurz}</strong><span>{ids.filter(id=>id.startsWith(s.id+"-")).length} / 3 Aufgaben erkundet</span></div>)}</div>
    <p className="bericht-einordnung">{STUFEN.find(s=>s.id===stufe)?.name} · {stand.alter} Jahre · {ids.length} / 12 Aufgaben. Die drei Aufgabenstufen werden getrennt gespeichert. Es gibt keine Auswertung von Fehlern, Tempo oder vermeintlicher Begabung.</p>
    <h2>Das möchte ich ausprobieren</h2><div className="bot-fragen">{WUENSCHE.map(w=><button className="spiel-knopf" key={w.id} aria-pressed={stand.wuensche.includes(w.id)} onClick={()=>wunsch(w.id)}><Symbol name={w.id==="ki"?"robot":w.id==="gaming"?"controller":"code"}/>{w.titel}</button>)}</div><p className="text-sm mt-3">Eine Auswahl ist ein lokaler Wunschzettel. Sie wird keinem Veranstalter übermittelt.</p>
    {vorschlaege.length?<div className="bericht-vorschlaege">{vorschlaege.map(v=><section key={v.thema}><h2>{v.titel}</h2><p className="bericht-grund">Warum hier? {v.grund}. {v.wunsch?"Euer selbst gewähltes Interesse zählt besonders.":"Ausprobieren bedeutet noch nicht, dass es ein Lieblingsthema ist."}</p>{v.angebote.length?<div className="spiel-kurskarten">{v.angebote.slice(0,3).map(a=><Angebotskarte key={a.id} angebot={a} meta={meta} modus="eltern" gemerkt={merk.ids.includes(a.id)} merken={merk.merken} jetzt={uhr}/>)}</div>:<p>Für {stand.alter} Jahre ist dazu aktuell kein passender Kurs im gespeicherten Bestand. <Link className="underline" href="/einrichtungen">Originalangebote der Lernorte ansehen</Link>.</p>}</section>)}</div>:<div className="bericht-leer"><p>Noch keine Interessen ausgewählt. Ihr könnt oben einen Wunsch wählen oder zuerst in der Spielwelt entdecken.</p><Link className="spiel-knopf" href="/kind">Zur Spielwelt<Symbol name="arrow"/></Link></div>}
    <details className="spiel-wissen"><summary>Wie entstehen diese Vorschläge?</summary><p>Abgeschlossene Spielaufgaben zählen als ausprobierte Themen. Eure ausdrücklich gewählten Interessen zählen besonders. Anschließend filtern wir nach gewähltem Alter, Zielgruppe, Thema und künftigen bzw. laufenden Terminen. Experimente mit Strom werden nicht als Coding-Fähigkeit gewertet. Verfügbarkeit, Kosten und Voraussetzungen müssen auf der Originalseite geprüft werden. Diese Orientierung ist keine Eignungsdiagnose und keine automatische Entscheidung über die Teilnahme.</p></details>
    <div className="bericht-aktionen"><button className="spiel-knopf" onClick={exportieren}>Entdeckungen herunterladen</button><Link className="spiel-knopf" href="/kind">Weiter zur Spielwelt</Link><Link className="underline" href="/einrichtungen">Lernorte & offizielle Socials</Link></div></>}
  </section>;
}
