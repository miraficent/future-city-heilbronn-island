import { codeMission,kiMission,materialMission,energieMission,brueckenMission,type Stufe } from "./abenteuer";
import type { Aktivitaet, MissionArt } from "./spiel";
/** Welche Bildanleitung zu einem Lernmodul gehört. Lektionen und Plugins bringen ihre eigene Anleitung mit (`null`). */
export function einstiegFuer(a:Aktivitaet):{art:MissionArt;phase:number}|null{
 const v="variante" in a?a.variante??0:0;
 switch(a.modul){
  case "roboter-code":return {art:"code",phase:v};
  case "muster-wahl":return {art:"muster",phase:v};
  case "level-bau":return {art:"level",phase:v};
  case "material-wahl":return {art:"strom",phase:0};
  case "stromkreis":return {art:"strom",phase:1};
  case "energie-wahl":return {art:"strom",phase:2};
  default:return null;
 }
}
export const LERNORTE=[
 {id:"aim",name:"aim",kurz:"Code entdecken",adresse:"Bildungscampus 7",farbe:"#cf7457",x:12855,y:7336,beschreibung:"Hier auf dem Bildungscampus entstehen neue Ideen fürs Lernen.",quelle:"https://www.heilbronn.de/kultur-freizeit/kultur-fuer-kinder-und-jugendliche/aim-akademie-fuer-innovative-bildung-und-management.html"},
 {id:"experimenta",name:"experimenta",kurz:"Forschen & staunen",adresse:"Experimenta-Platz",farbe:"#4f9290",x:12849,y:7727,beschreibung:"Glas, Dreiecke und Wasser: In der experimenta kannst du Wissenschaft entdecken.",quelle:"https://www.experimenta.science/experimenta/architektur/"},
 {id:"hdf",name:"Haus der Familie",kurz:"Zusammen gestalten",adresse:"Erich-Mendelsohn-Straße 1C",farbe:"#b28a3b",x:12415,y:7628,beschreibung:"Das Haus der Familie ist in der Josef-Schwarz-Schule. Hier wird gemeinsam gelernt und gestaltet.",quelle:"https://hdf-hn.de/ueber-uns/standorte/"},
 {id:"ipai",name:"IPAI SPACES",kurz:"KI begreifen",adresse:"Im Zukunftspark 11/13",farbe:"#82719f",x:12323,y:6493,beschreibung:"Eine grüne Fassade und viele Ideen: Die IPAI Foundation macht KI im Besucherzentrum erlebbar.",quelle:"https://ipai-foundation.ai/besucherzentrum/"},
] as const;
export type Lernort=(typeof LERNORTE)[number];
export type AufgabenEinfuehrung={titel:string;text:string;schritte:[string,string,string];beispiel:"code"|"wahl"|"schalter"|"bauen";audioId:string};
export function einfuehrung(art:MissionArt,stufe:Stufe,phase:number):AufgabenEinfuehrung{
 const audioId=`${art}-${stufe}-${phase}`;
 if(art==="code"){const n=codeMission(stufe,phase).stopps.length;return {titel:n===0?"Ein Weg für den Roboter":n===1?"Ein Paket abholen":`${n} Pakete abholen`,text:n===0?"Bring den Roboter zur Fahne. Jeder Pfeil ist ein Schritt.":n===1?"Fahr erst zum gelben Paket. Dann weiter zur Fahne.":`Hol alle ${n} gelben Pakete ab. Fahre dann zur Fahne.`,schritte:["Pfeile wählen","Start drücken","Weg anschauen"],beispiel:"code",audioId};}
 if(art==="muster"){const m=kiMission(stufe,phase);return {titel:"Schau genau hin",text:m.frage,schritte:["Bilder anschauen","Passendes wählen","Ausprobieren"],beispiel:"wahl",audioId};}
 if(art==="strom"&&phase===1)return {titel:"Licht für unsere Ideen",text:stufe==="profi"?"Schalte Lampe eins und drei an. Lampe zwei bleibt aus.":"Schließe die Schalter. Dann kann die Lampe leuchten.",schritte:["Schalter antippen","Licht beobachten","Licht prüfen"],beispiel:"schalter",audioId};
 if(art==="strom"){const m=phase===0?materialMission(stufe):energieMission(stufe);return {titel:phase===0?"Die Materialprobe":"Energie entdecken",text:m.frage,schritte:["Bilder anschauen","Eine Idee wählen","Ausprobieren"],beispiel:"wahl",audioId};}
 const m=brueckenMission(stufe,phase);return {titel:"Dein Weg zum Ziel",text:phase===0?"Setze die Sprunghilfe vor die Lücke.":phase===1?(m.luecken.length===1?"Tippe auf die Lücke. Baue eine Brücke.":`Tippe auf die Lücken. Baue ${m.luecken.length} Brücken.`):"Baue die Brücken. Setze die Sprunghilfe vor die letzte Hürde.",schritte:[phase===0?"Sprungort wählen":"Lücken schließen","Weg testen","Figur beobachten"],beispiel:"bauen",audioId};
}
export const AUDIO_TEXTE=Object.fromEntries((["start","weiter","profi"] as Stufe[]).flatMap(s=>(["code","strom","level","muster"] as MissionArt[]).flatMap(a=>[0,1,2].map(p=>{const m=einfuehrung(a,s,p);return [m.audioId,`${m.titel}. ${m.text} ${m.schritte.join(". ")}.`];}))));
