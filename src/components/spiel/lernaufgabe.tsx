"use client";
import { useEffect, useRef, useState } from "react";
import { brueckenMission, codeMission, energieMission, fuehreCodeAus, kiMission, materialMission, pruefeBauPlan, pruefeWahl, type BildOption, type Stufe, type WahlMission } from "@/lib/abenteuer";
import type { MissionArt, Richtung } from "@/lib/spiel";
import { Symbol } from "../symbol";
import { PixelBild, PixelGrafik } from "./pixel-grafik";
const DREHUNG:Record<Richtung,number>={rechts:0,runter:90,links:180,hoch:270};
export function AufgabenBild({option}:{option:BildOption}){
  const farbe=option.farbe??"#ed805c";
  return <svg viewBox="0 0 100 85" aria-hidden="true" className="aufgaben-bild">
    {option.motiv==="ball"?<><circle cx="50" cy="43" r="30" fill={farbe}/><path d="M23 27q31 5 45 40M48 12q-13 27 6 61" stroke="#fff2c7" strokeWidth="5" fill="none"/></>
    :option.motiv==="rad"?<><circle cx="50" cy="43" r="29" fill={option.farbe??"#fffbee"} stroke="#345457" strokeWidth="5"/>{[0,60,120].map(r=><path key={r} d="M21 43h58" transform={`rotate(${r} 50 43)`} stroke="#345457" strokeWidth="2"/>)}</>
    :option.motiv==="frage"?<><rect x="20" y="12" width="60" height="57" rx="8" fill="#aaa0db"/><text x="50" y="57" textAnchor="middle" fontSize="44" fill="#254950">?</text></>
    :option.motiv==="gruppe"?<>{[[28,40,16,"#ed805c"],[62,26,12,"#7bbfc4"],[65,61,18,"#ecc06b"]].map(([x,y,r,c],i)=><circle key={i} cx={x} cy={y} r={r} fill={c as string}/>)}</>
    :option.motiv==="sonne"?<><path d="M50 3v12m0 56v11M10 43H0m88 0h12M15 8l10 12m50 48 10 10M14 76l12-12M76 20 86 8" stroke="#ddaa42" strokeWidth="5"/><circle cx="50" cy="43" r="24" fill="#f1ca65"/></>
    :option.motiv==="mond"?<><rect x="8" y="5" width="84" height="74" fill="#345457" rx="8"/><path d="M65 15a28 28 0 1 0 10 48A31 31 0 0 1 65 15" fill="#fff2c7"/></>
    :<><rect x="18" y="15" width="64" height="57" rx="3" fill={option.motiv==="metall"?"#9cafb4":option.motiv==="gummi"?"#40544c":option.motiv==="holz"?"#b88b64":option.motiv==="fenster"?(option.farbe??"#7bbfc4"):option.farbe??"#e9b45c"} stroke="#345457" strokeWidth="3"/>{option.motiv==="fenster"?<path d="M50 15v57M18 43h64" stroke="#345457" strokeWidth="3"/>:<path d="M30 30h40M30 45h40M30 60h40" stroke="#fff2c7" strokeWidth="3" opacity=".6"/>}</>}
  </svg>;
}
function WahlAufgabe({mission,geschafft}:{mission:WahlMission;geschafft:()=>void}){
  const [wahl,setWahl]=useState<string[]>([]),[meldung,setMeldung]=useState("");
  function pruefen(){const ok=pruefeWahl(wahl,mission);setMeldung(ok?"Das passt! Du hast die Idee entdeckt.":mission.tipp);if(ok)geschafft();}
  return <div className="lernaufgabe"><p>{mission.frage}</p><div className="muster-auswahl">{mission.optionen.map(o=><button key={o.id} className="muster-karte" aria-pressed={wahl.includes(o.id)} onClick={()=>{setWahl(wahl.includes(o.id)?wahl.filter(id=>id!==o.id):mission.antworten.length===1?[o.id]:[...wahl,o.id]);setMeldung("");}}><AufgabenBild option={o}/><span>{o.titel}</span></button>)}</div><button className="spiel-knopf spiel-knopf-dunkel" disabled={!wahl.length} onClick={pruefen}>Ausprobieren</button><p role="status" className="aufgaben-meldung">{meldung}</p><details className="spiel-wissen"><summary>Erklär mir die Idee</summary><p>{mission.wissen}</p></details></div>;
}
function CodeAufgabe({stufe,phase,geschafft}:{stufe:Stufe;phase:number;geschafft:()=>void}){
  const mission=codeMission(stufe,phase);
  const [befehle,setBefehle]=useState<Richtung[]>([]),[pos,setPos]=useState(mission.start),[laeuft,setLaeuft]=useState(false),[meldung,setMeldung]=useState("");
  const lauf=useRef(0);useEffect(()=>()=>{lauf.current++;},[]);
  async function spielen(){const kennung=++lauf.current,ergebnis=fuehreCodeAus(befehle,mission);setLaeuft(true);setMeldung("");setPos(mission.start);
    for(const p of ergebnis.weg){if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)await new Promise(r=>setTimeout(r,180));if(kennung!==lauf.current)return;setPos(p);}
    setLaeuft(false);setMeldung(ergebnis.ok?"Lieferung angekommen! Dein Programm funktioniert.":ergebnis.grund);if(ergebnis.ok)geschafft();
  }
  return <div className="lernaufgabe"><p>{phase===0?"Bring den Roboter zur Fahne.":"Sammle die gelben Pakete. Dann zur Fahne!"}</p><svg viewBox={`0 0 ${mission.breite*60+10} ${mission.hoehe*60+10}`} className="code-spielfeld" role="img" aria-label={`Roboter: Spalte ${pos.x+1}, Reihe ${pos.y+1}. Raster ${mission.breite} mal ${mission.hoehe}. Start unten links, Ziel oben rechts. Mauern in Reihe 2 außer am Rand. ${mission.stopps.length} Pakete.`}>
    {Array.from({length:mission.breite*mission.hoehe},(_,i)=>{const x=i%mission.breite,y=Math.floor(i/mission.breite),mauer=mission.mauern.some(p=>p.x===x&&p.y===y);return <g key={i} transform={`translate(${5+x*60} ${5+y*60})`}><rect width="54" height="54" fill={mauer?"#94aaa0":"#fffbee"} stroke="#bdd0b5" strokeWidth="2"/>{mauer&&<path d="M4 18h46M4 36h46M22 3v15m15 0v18M22 36v14" fill="none" stroke="#6d8780" strokeWidth="2"/>}</g>;})}
    {mission.stopps.map((p,i)=><g key={i} transform={`translate(${20+p.x*60} ${20+p.y*60})`}><rect width="26" height="26" fill="#edbf5c" stroke="#82582d" strokeWidth="2"/><path d="M13 0v26M0 9h26" stroke="#fff2c7" strokeWidth="3"/></g>)}
    <path d="M0 18v-36l26 7-26 10" transform={`translate(${30+mission.ziel.x*60} ${32+mission.ziel.y*60})`} fill="#ed805c" stroke="#345457" strokeWidth="2"/>
    <PixelGrafik motiv="roboter" x={17+pos.x*60} y={9+pos.y*60} breite={28} hoehe={46}/></svg>
    <div className="befehlsleiste" aria-label="Befehle hinzufügen">{(["hoch","rechts","runter","links"] as Richtung[]).map(r=><button key={r} className="spiel-knopf" disabled={laeuft||befehle.length>=40} onClick={()=>setBefehle([...befehle,r])}><Symbol name="arrow" style={{transform:`rotate(${DREHUNG[r]}deg)`}}/><span className="sr-only">{r}</span></button>)}</div>
    <div className="programm" aria-label="Dein Programm">{befehle.length?befehle.map((b,i)=><span key={i} title={`${i+1}. ${b}`}><Symbol name="arrow" style={{transform:`rotate(${DREHUNG[b]}deg)`}}/><span className="sr-only">{b}</span></span>):"Hier entsteht dein Weg."}</div>
    <div className="flex flex-wrap gap-3"><button className="spiel-knopf spiel-knopf-dunkel" disabled={laeuft||!befehle.length} onClick={spielen}><Symbol name="play"/>Start</button><button className="spiel-knopf" disabled={laeuft||!befehle.length} onClick={()=>setBefehle(befehle.slice(0,-1))}>Zurück</button><button className="spiel-knopf" disabled={laeuft} onClick={()=>{setBefehle([]);setPos(mission.start);setMeldung("");}}>Neu</button>{stufe==="profi"&&<button className="spiel-knopf" disabled={laeuft||!befehle.length||befehle.length>20} onClick={()=>setBefehle([...befehle,...befehle])}>Folge × 2</button>}</div>
    <p role="status" className="aufgaben-meldung">{meldung}</p><details className="spiel-wissen"><summary>Zeig mir einen Tipp</summary><p>Die Ränder sind frei. {phase>0?"Fahre zuerst links nach oben. Besuche dann alle Pakete, bevor du das Ziel ansteuerst.":"Fahre unten nach rechts und dann nach oben."} Jeder Pfeil ist genau ein Schritt.</p></details></div>;
}
function SchalterAufgabe({stufe,geschafft}:{stufe:Stufe;geschafft:()=>void}){
  const anzahl=stufe==="start"?1:stufe==="weiter"?2:3,profi=stufe==="profi";
  const [an,setAn]=useState<boolean[]>(Array(anzahl).fill(false)),[meldung,setMeldung]=useState("");
  const ziel=profi?[true,false,true]:Array(anzahl).fill(true),ok=an.every((a,i)=>a===ziel[i]);
  return <div className="lernaufgabe"><p>{profi?"Lampe 1 und 3 an. Lampe 2 bleibt aus.":"Schließe den Stromkreis. Lass die Lampe leuchten!"}</p><svg viewBox={`0 0 420 ${profi?270:110}`} className="strom-spielfeld" role="img" aria-label={profi?`Drei getrennte Stromkreise. Schalter: ${an.map((x,i)=>`${i+1} ${x?"zu":"offen"}`).join(", ")}`:`Ein Stromkreis mit ${anzahl} Schaltern in Reihe. Lampe ${an.every(Boolean)?"an":"aus"}.`}>
    {Array.from({length:profi?3:1},(_,reihe)=><g key={reihe} transform={`translate(0 ${reihe*85})`}><path d="M45 65V25h330v40H45" fill="none" stroke="#345457" strokeWidth="5"/><rect x="35" y="35" width="20" height="22" fill="#ed805c" stroke="#345457" strokeWidth="2"/><circle cx="340" cy="25" r="18" fill={(profi?an[reihe]:an.every(Boolean))?"#f1ca65":"#fffbee"} stroke="#345457" strokeWidth="3"/>{Array.from({length:profi?1:anzahl},(_,i)=>{const n=profi?reihe:i,x=110+i*100;return <g key={i}><path d={`M${x} 25h45`} stroke="#fff9e8" strokeWidth="9"/><path d={`M${x} 25l45 ${an[n]?0:-18}`} stroke="#ed805c" strokeWidth="5"/><text x={x+20} y="56" textAnchor="middle" fontSize="16">{n+1}</text></g>;})}</g>)}</svg>
    <div className="flex flex-wrap gap-3">{an.map((a,i)=><button className="spiel-knopf" key={i} aria-pressed={a} onClick={()=>{setAn(an.map((x,j)=>j===i?!x:x));setMeldung("");}}>Schalter {i+1}: {a?"zu":"offen"}</button>)}</div><button className="spiel-knopf spiel-knopf-dunkel mt-4" onClick={()=>{setMeldung(ok?"Das Licht stimmt. Gut getüftelt!":profi?"Prüfe jede Lampe einzeln.":"Ein offener Schalter unterbricht den ganzen Kreis.");if(ok)geschafft();}}>Licht prüfen</button><p role="status" className="aufgaben-meldung">{meldung}</p><details className="spiel-wissen"><summary>Erklär mir die Schaltung</summary><p>{profi?"Jede Lampe hat hier ihren eigenen Stromkreis und ihren eigenen Schalter.":"Bei einer Reihenschaltung müssen alle Schalter geschlossen sein, damit Strom fließen kann."} Das ist eine vereinfachte Batterie-Schaltung im Spiel.</p></details></div>;
}
function BauAufgabe({stufe,phase,geschafft}:{stufe:Stufe;phase:number;geschafft:()=>void}){
  const m=brueckenMission(stufe,phase),[bruecken,setBruecken]=useState<number[]>([]),[sprung,setSprung]=useState<number>(),[test,setTest]=useState("bereit"),[meldung,setMeldung]=useState("");
  const [schritt,setSchritt]=useState(0),[flug,setFlug]=useState(false),lauf=useRef(0);
  useEffect(()=>()=>{lauf.current++;},[]);
  async function testen(){
    const kennung=++lauf.current,ergebnis=pruefeBauPlan(stufe,phase,bruecken,sprung);
    setTest("laeuft");setMeldung("");setSchritt(0);
    for(let i=1;i<=ergebnis.stopp;i++){
      if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)await new Promise(r=>setTimeout(r,240));
      if(kennung!==lauf.current)return;
      setSchritt(i);setFlug((phase===0&&i===3)||(phase===2&&i===m.sprung));
    }
    setTest(ergebnis.ok?"gut":"nochmal");setFlug(false);
    setMeldung(ergebnis.ok?"Der Weg funktioniert. Du erreichst die Fahne!":phase===0?"Die Sprunghilfe gehört vor die Lücke.":"Schließe jede dunkle Lücke. Die Sprunghilfe gehört vor die letzte Hürde.");
    if(ergebnis.ok)geschafft();
  }
  return <div className="lernaufgabe"><p>{phase===0?"Setze die Sprunghilfe vor die Lücke.":phase===1?`Baue ${m.luecken.length} Brücke${m.luecken.length===1?"":"n"}. Tippe auf die Lücken.`:"Baue die Brücken und platziere die Sprunghilfe."}</p>
    <div className={`bau-welt bau-${test}`}><div className={`bau-himmel ${flug?"bau-flug":""}`} style={{"--figur-weg":`${2+schritt/(m.breite-1)*88}%`} as React.CSSProperties}><PixelBild motiv="kind"/><span>Start</span><span className="bau-fahne">Ziel</span></div><div className="bau-felder" style={{gridTemplateColumns:`repeat(${m.breite},1fr)`}}>{Array.from({length:m.breite},(_,i)=>{const luecke=phase===0?i===3:m.luecken.includes(i),gebaut=bruecken.includes(i);return <button key={i} disabled={phase===0||test==="laeuft"||i===0||i===m.breite-1} className={`${luecke?"bau-luecke":"bau-boden"} ${gebaut?"bau-bruecke":""} ${phase===2&&i===m.sprung?"bau-huerde":""}`} aria-label={`Feld ${i+1}: ${gebaut?"Brücke":luecke?"Lücke":"Boden"}`} aria-pressed={gebaut} onClick={()=>{setBruecken(gebaut?bruecken.filter(x=>x!==i):bruecken.length<m.luecken.length?[...bruecken,i]:bruecken);setTest("bereit");}}>{gebaut?"═":luecke?"?":""}</button>;})}</div></div>
    {phase!==1&&<div className="flex flex-wrap gap-3">{["Im Loch","Vor der Lücke","Hinter dem Ziel"].map((t,i)=><button key={t} className="spiel-knopf" aria-pressed={sprung===i} disabled={test==="laeuft"} onClick={()=>{setSprung(i);setTest("bereit");}}>{phase===2&&i===1?"Vor der letzten Hürde":t}</button>)}</div>}
    {phase>0&&<p className="bau-vorrat">Brücken: {bruecken.length} / {m.luecken.length}. Tippe eine Brücke zum Entfernen an.</p>}
    <div className="flex flex-wrap gap-3 mt-4"><button className="spiel-knopf spiel-knopf-dunkel" disabled={test==="laeuft"||(phase!==1&&sprung===undefined)} onClick={testen}>Weg testen</button><button className="spiel-knopf" disabled={test==="laeuft"} onClick={()=>{setBruecken([]);setSprung(undefined);setSchritt(0);setFlug(false);setTest("bereit");setMeldung("");}}>Neu bauen</button></div><p role="status" className="aufgaben-meldung">{meldung}</p><details className="spiel-wissen"><summary>Was steckt dahinter?</summary><p>Beim Gestalten eines Spiels baust du Wege und Regeln. Ausprobieren zeigt, ob dein Level funktioniert. Ein Fehler ist ein Hinweis zum Weiterbauen.</p></details></div>;
}
export function Lernaufgabe({art,stufe,phase,geschafft}:{art:MissionArt;stufe:Stufe;phase:number;geschafft:()=>void}){
  if(art==="code")return <CodeAufgabe stufe={stufe} phase={phase} geschafft={geschafft}/>;
  if(art==="muster")return <WahlAufgabe mission={kiMission(stufe,phase)} geschafft={geschafft}/>;
  if(art==="strom")return phase===1?<SchalterAufgabe stufe={stufe} geschafft={geschafft}/>:<WahlAufgabe mission={phase===0?materialMission(stufe):energieMission(stufe)} geschafft={geschafft}/>;
  return <BauAufgabe stufe={stufe} phase={phase} geschafft={geschafft}/>;
}
