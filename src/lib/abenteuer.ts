import type { Angebot } from "./angebot";
import type { Motiv } from "./checkpoint";
import { passendeSpielAngebote, STATIONEN, type Punkt, type Richtung } from "./spiel";

export type Stufe = "start" | "weiter" | "profi";
export const STUFEN = [
  {id:"start" as const,name:"Entdecken",alter:"6–8 Jahre",min:6,max:8},
  {id:"weiter" as const,name:"Tüfteln",alter:"9–11 Jahre",min:9,max:11},
  {id:"profi" as const,name:"Weiterdenken",alter:"12–17 Jahre",min:12,max:17},
];
export const stufeFuerAlter=(alter:number):Stufe=>alter>=12?"profi":alter>=9?"weiter":"start";
/** Alle Aufgaben aller Häuser; Reihenfolge und Titel kommen aus der Checkpoint-Konfiguration. */
export const MISSIONEN=STATIONEN.flatMap(s=>s.aktivitaeten.map((a,phase)=>({id:`${s.id}-${phase}`,station:s.id,phase,titel:a.titel,thema:s.interesse})));
export type Spielstand={alter:number;fortschritt:Record<Stufe,string[]>;wuensche:string[]};
export const neuerSpielstand=():Spielstand=>({alter:8,fortschritt:{start:[],weiter:[],profi:[]},wuensche:[]});
export const WUENSCHE=[{id:"coding",titel:"Roboter & Code",text:"Ich möchte etwas programmieren."},{id:"gaming",titel:"Eigene Spiele",text:"Ich möchte ein Spiel gestalten."},{id:"ki",titel:"KI entdecken",text:"Ich möchte mehr über KI erfahren."}];
export function pruefeSpielstand(roh:unknown):Spielstand {
  const neu=neuerSpielstand();if(!roh||typeof roh!=="object")return neu;
  const r=roh as Partial<Spielstand>;
  if(Number.isInteger(r.alter)&&r.alter!>=6&&r.alter!<=17)neu.alter=r.alter!;
  for(const s of STUFEN){const liste=r.fortschritt?.[s.id];if(Array.isArray(liste))neu.fortschritt[s.id]=[...new Set(liste.filter(id=>typeof id==="string"&&MISSIONEN.some(m=>m.id===id)))];}
  if(Array.isArray(r.wuensche))neu.wuensche=[...new Set(r.wuensche.filter(id=>WUENSCHE.some(w=>w.id===id)))];
  return neu;
}
export function empfehlungen(angebote:Angebot[],stand:Spielstand,jetzt:Date){
  const ids=stand.fortschritt[stufeFuerAlter(stand.alter)];
  return WUENSCHE.map(w=>{
    const probiert=MISSIONEN.filter(m=>m.thema===w.id&&ids.includes(m.id)).length;
    const wunsch=stand.wuensche.includes(w.id);
    return {thema:w.id,titel:w.titel,probiert,wunsch,gewicht:probiert+(wunsch?4:0),grund:[probiert?`${probiert} Spielaufgabe${probiert===1?"":"n"} zu diesem Thema erkundet`:"",wunsch?"selbst als Interesse gewählt":""].filter(Boolean).join("; "),angebote:passendeSpielAngebote(angebote,w.id,stand.alter,jetzt)};
  }).filter(e=>e.gewicht>0).sort((a,b)=>b.gewicht-a.gewicht||a.titel.localeCompare(b.titel,"de"));
}

export type CodeMission={breite:number;hoehe:number;start:Punkt;ziel:Punkt;mauern:Punkt[];stopps:Punkt[]};
export function codeMission(stufe:Stufe,phase:number):CodeMission{
  const n=STUFEN.findIndex(s=>s.id===stufe),breite=4+n,hoehe=3+n;
  return {breite,hoehe,start:{x:0,y:hoehe-1},ziel:{x:breite-1,y:0},mauern:Array.from({length:breite-2},(_,i)=>({x:i+1,y:1})),stopps:phase===0?[]:phase===1?[{x:0,y:0}]:[{x:0,y:0},{x:breite-1,y:hoehe-1}]};
}
const VEKTOR:Record<Richtung,Punkt>={hoch:{x:0,y:-1},rechts:{x:1,y:0},runter:{x:0,y:1},links:{x:-1,y:0}};
export function fuehreCodeAus(befehle:Richtung[],mission:CodeMission){
  let pos=mission.start;const weg=[pos],besucht=new Set<string>();
  const merken=()=>mission.stopps.forEach((p,i)=>{if(p.x===pos.x&&p.y===pos.y)besucht.add(String(i));});merken();
  for(const befehl of befehle){const d=VEKTOR[befehl];if(!d)return {ok:false,weg,grund:"Dieser Befehl ist unbekannt."};const p={x:pos.x+d.x,y:pos.y+d.y};
    if(p.x<0||p.y<0||p.x>=mission.breite||p.y>=mission.hoehe||mission.mauern.some(m=>m.x===p.x&&m.y===p.y))return {ok:false,weg,grund:"Hier ist eine Mauer. Ändere deinen Weg."};
    pos=p;weg.push(p);merken();
  }
  const amZiel=pos.x===mission.ziel.x&&pos.y===mission.ziel.y,alle=besucht.size===mission.stopps.length;
  return {ok:amZiel&&alle,weg,grund:!alle?"Besuche auch alle gelben Pakete.":"Ergänze den Weg bis zur Fahne."};
}

export type BildOption={id:string;titel:string;motiv:Motiv;farbe?:string};
export type WahlMission={frage:string;tipp:string;antworten:string[];optionen:BildOption[];wissen:string};
const bild=(id:string,titel:string,motiv:BildOption["motiv"],farbe?:string):BildOption=>({id,titel,motiv,farbe});
export function kiMission(stufe:Stufe,phase:number):WahlMission {
  if(stufe==="start"&&phase===0)return {frage:"Finde die zwei runden Dinge.",tipp:"Ball und Rad haben keine Ecken.",antworten:["ball","rad"],optionen:[bild("ball","Ball","ball"),bild("fenster","Fenster","fenster"),bild("rad","Rad","rad"),bild("block","Baustein","block")],wissen:"Ein Merkmal hilft beim Sortieren. KI kann aus vielen Beispielen Muster lernen. Das ist hier ein vereinfachtes Lernspiel."};
  if(stufe==="start"&&phase===1)return {frage:"Finde die zwei roten Dinge.",tipp:"Diesmal zählt die Farbe, nicht die Form.",antworten:["ball","block"],optionen:[bild("ball","Roter Ball","ball","#ed805c"),bild("fenster","Blaues Fenster","fenster","#7bbfc4"),bild("block","Roter Stein","block","#ed805c"),bild("rad","Blaues Rad","rad","#7bbfc4")],wissen:"Die gleiche Sache lässt sich nach Form oder Farbe ordnen. Es kommt auf die Frage an."};
  if(stufe==="weiter"&&phase===0)return {frage:"Unsere Beispiele sollen „rund“ zeigen. Welches passt nicht?",tipp:"Achte auf die Form. Das Fenster hat Ecken.",antworten:["fenster"],optionen:[bild("ball","Ball: rund","ball"),bild("rad","Rad: rund","rad"),bild("fenster","Fenster: rund?","fenster")],wissen:"Falsch beschriftete Beispiele können zu falschen Mustern führen. Gute Trainingsdaten müssen geprüft werden."};
  if((stufe==="weiter"&&phase===1)||(stufe==="profi"&&phase===0))return {frage:"Ein System soll Bälle jeder Farbe erkennen. Welche Beispiele helfen besser?",tipp:"Viele verschiedene Beispiele helfen, einseitige Muster zu vermeiden.",antworten:["vielfalt"],optionen:[bild("einseitig","Nur rote Bälle","ball","#ed805c"),bild("vielfalt","Verschiedene Farben & Größen","gruppe")],wissen:"Vielfältige Beispiele können helfen, einseitige Ergebnisse zu verringern. Sie garantieren allein noch keine faire oder richtige KI."};
  if(stufe==="profi"&&phase===1)return {frage:"Was kannst du für ein öffentliches Lernbeispiel teilen?",tipp:"Ein selbst gezeichnetes Muster braucht keine Namen, Fotos oder Adressen.",antworten:["muster"],optionen:[bild("foto","Klassenfoto mit Namen","gruppe"),bild("adresse","Name und Wohnadresse","fenster"),bild("muster","Eigenes Muster ohne Personendaten","block")],wissen:"Verwende möglichst wenige Daten. Für Fotos und Daten anderer Menschen brauchst du eine passende Erlaubnis und einen klaren Zweck."};
  return {frage:stufe==="profi"?"Eine KI behauptet: „Alle Kurse sind kostenlos.“ Wie prüfst du das?":"Das Bild ist verdeckt. Was soll der Roboter tun?",tipp:stufe==="profi"?"Prüfe Preis und Bedingungen auf der Originalseite.":"Wenn etwas unklar ist, darf der Roboter nachfragen.",antworten:["pruefen"],optionen:[bild("raten",stufe==="profi"?"Sofort glauben":"Einfach raten","ball"),bild("pruefen",stufe==="profi"?"Originalquelle prüfen":"Nachfragen","frage")],wissen:"KI kann sich irren. Unsicherheit zu erkennen und Informationen zu prüfen ist sinnvoll. Hier läuft kein echtes KI-Modell."};
}
export function materialMission(stufe:Stufe):WahlMission{
  const isolator=stufe!=="start";
  return {frage:isolator?"Welches Material isoliert die Leitung?":"Was schließt die Lücke im Stromkreis?",tipp:isolator?"Gummi leitet elektrischen Strom normalerweise sehr schlecht.":"Metall leitet Strom. Holz und Gummi hier nicht.",antworten:[isolator?"gummi":"metall"],optionen:[bild("holz","Trockenes Holz","holz"),bild("metall",isolator?"Kupfer":"Metall","metall"),bild("gummi","Gummi","gummi")],wissen:"Das ist eine vereinfachte Darstellung mit einer Batterie. Experimentiere niemals mit Steckdosen oder Netzstrom. Echte Versuche nur mit geeigneten Materialien und Begleitung."};
}
export function energieMission(stufe:Stufe):WahlMission{
  return stufe==="start"?{frage:"Wann kann die Solarzelle Licht in Strom umwandeln?",tipp:"Die Solarzelle braucht Licht.",antworten:["sonne"],optionen:[bild("sonne","Im Sonnenlicht","sonne"),bild("nacht","In völliger Dunkelheit","mond")],wissen:"Solarzellen wandeln Lichtenergie in elektrische Energie um. Im Dunkeln liefern sie keinen Strom."}
  :{frage:stufe==="profi"?"Die Solarlampe soll nachts leuchten. Was speichert tagsüber Energie?":"Was hilft einer Solarzelle, mehr Licht einzufangen?",tipp:stufe==="profi"?"Ein Akku speichert elektrische Energie für später.":"Im Schatten kommt weniger Licht an.",antworten:["gut"],optionen:[bild("falsch",stufe==="profi"?"Nur ein Schalter":"Unter einer Decke","mond"),bild("gut",stufe==="profi"?"Ein geeigneter Akku":"Ein heller Platz","sonne")],wissen:stufe==="profi"?"Ein Akku kann Energie speichern. Er erzeugt sie nicht selbst. Für eine reale Anlage müssen Bauteile und Laderegelung zusammenpassen.":"Ausrichtung und Schatten beeinflussen, wie viel Licht die Solarzelle erreicht."};
}
export function pruefeWahl(wahl:string[],mission:WahlMission){return wahl.length===mission.antworten.length&&mission.antworten.every(id=>wahl.includes(id));}
export function brueckenMission(stufe:Stufe,phase:number){
  const breite=stufe==="start"?7:stufe==="weiter"?9:11;
  const luecken=phase===1?[2,...(stufe==="start"?[]:[5])]:[2,4,...(stufe==="profi"?[7]:[])];
  return {breite,luecken,sprung:phase===2?breite-2:undefined};
}
export function pruefeBauPlan(stufe:Stufe,phase:number,bruecken:number[],sprung:number|undefined){
  const m=brueckenMission(stufe,phase);
  for(let i=1;i<m.breite;i++){
    if(phase===0&&i===3&&sprung!==1)return {ok:false,stopp:i-1};
    if(phase>0&&m.luecken.includes(i)&&!bruecken.includes(i))return {ok:false,stopp:i-1};
    if(phase===2&&i===m.sprung&&sprung!==1)return {ok:false,stopp:i-1};
  }
  return {ok:true,stopp:m.breite-1};
}
