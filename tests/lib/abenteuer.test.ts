import { describe,expect,it } from "vitest";
import { brueckenMission, codeMission, energieMission, empfehlungen, fuehreCodeAus, kiMission, materialMission, MISSIONEN, neuerSpielstand, pruefeBauPlan, pruefeSpielstand, pruefeWahl, STUFEN, stufeFuerAlter } from "@/lib/abenteuer";
import { STATIONEN, type Richtung } from "@/lib/spiel";
import { oeffentlicheAngebote } from "@/lib/daten";
describe("altersabhängige Geschichte",()=>{
 it("wechselt an den richtigen Altersgrenzen",()=>expect([6,8,9,11,12,17].map(stufeFuerAlter)).toEqual(["start","start","weiter","weiter","profi","profi"]));
 it("hat für jede konfigurierte Aktivität eine erreichbare Aufgabe pro Stufe",()=>{
  expect(MISSIONEN).toHaveLength(STATIONEN.reduce((n,s)=>n+s.aktivitaeten.length,0));
  for(const stufe of STUFEN)for(let phase=0;phase<3;phase++){
   const m=codeMission(stufe.id,phase),befehle:Richtung[]=[];
   // Freie Randroute besucht alle Pakete, ohne die Wand zu durchqueren.
   if(phase>0)befehle.push(...Array<Richtung>(m.hoehe-1).fill("hoch"));
   if(phase===1)befehle.push(...Array<Richtung>(m.breite-1).fill("rechts"));
   else {if(phase===2)befehle.push(...Array<Richtung>(m.hoehe-1).fill("runter"));befehle.push(...Array<Richtung>(m.breite-1).fill("rechts"),...Array<Richtung>(m.hoehe-1).fill("hoch"));}
   expect(befehle.length).toBeLessThanOrEqual(40);expect(fuehreCodeAus(befehle,m).ok).toBe(true);
   expect(fuehreCodeAus(["links"],m).ok).toBe(false);expect(fuehreCodeAus([],m).ok).toBe(false);
   for(const frage of [kiMission(stufe.id,phase),materialMission(stufe.id),energieMission(stufe.id)]){expect(pruefeWahl(frage.antworten,frage)).toBe(true);expect(pruefeWahl([],frage)).toBe(false);expect(frage.antworten.every(id=>frage.optionen.some(o=>o.id===id))).toBe(true);}
  }
 });
 it("braucht Zwischenstopps und bietet unterschiedliche KI-Inhalte",()=>{
  const m=codeMission("profi",2);expect(fuehreCodeAus([...Array<Richtung>(5).fill("rechts"),...Array<Richtung>(4).fill("hoch")],m).ok).toBe(false);
  expect(kiMission("start",0).frage).not.toBe(kiMission("weiter",0).frage);expect(kiMission("weiter",1).frage).not.toBe(kiMission("profi",1).frage);
 });
 it("hält die Testfigur vor einer offenen Lücke oder unüberwindbaren Hürde an",()=>{
  for(const stufe of STUFEN)for(let phase=0;phase<3;phase++){
   const m=brueckenMission(stufe.id,phase);
   expect(pruefeBauPlan(stufe.id,phase,[],undefined).ok).toBe(false);
   expect(pruefeBauPlan(stufe.id,phase,m.luecken,1)).toEqual({ok:true,stopp:m.breite-1});
   if(phase===2)expect(pruefeBauPlan(stufe.id,phase,m.luecken,0)).toEqual({ok:false,stopp:m.sprung!-1});
   if(phase>0)expect(pruefeBauPlan(stufe.id,phase,m.luecken.slice(1),1).stopp).toBe(m.luecken[0]!-1);
  }
 });
});
describe("datensparsame Elternorientierung",()=>{
 it("verwirft unbekannte oder manipulierte Zustände und trennt Altersstufen",()=>{
  const s=pruefeSpielstand({alter:99,fortschritt:{start:["aim-0","aim-0","fremd",null],profi:["ipai-2"]},wuensche:["ki","ki","adresse"]});
  expect(s.alter).toBe(8);expect(s.fortschritt.start).toEqual(["aim-0"]);expect(s.fortschritt.weiter).toEqual([]);expect(s.fortschritt.profi).toEqual(["ipai-2"]);expect(s.wuensche).toEqual(["ki"]);
 });
 it("stellt ausdrückliche Wünsche vor Themen, die nur ausprobiert wurden",()=>{
  const s=neuerSpielstand();s.fortschritt.start=["aim-0","aim-1","aim-2"];s.wuensche=["gaming"];
  const e=empfehlungen(oeffentlicheAngebote(),s,new Date("2026-11-13T10:00:00+01:00"));
  expect(e[0]!.thema).toBe("gaming");expect(e[0]!.wunsch).toBe(true);expect(e[1]!.grund).toContain("3 Spielaufgaben");
  expect(e.flatMap(x=>x.angebote).every(a=>(a.alterMin??0)<=8&&(a.alterMax??99)>=8&&!a.zielgruppen.every(g=>g==="fachkraefte"||g==="erwachsene"))).toBe(true);
 });
 it("leitet aus einer Stromaufgabe keine Coding-Eignung ab",()=>{
  const s=neuerSpielstand();s.fortschritt.start=["experimenta-0"];
  expect(empfehlungen(oeffentlicheAngebote(),s,new Date())).toEqual([]);
 });
});
