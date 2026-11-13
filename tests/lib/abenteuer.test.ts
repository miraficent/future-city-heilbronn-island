import { describe,expect,it } from "vitest";
import { brueckenMission, codeMission, energieMission, empfehlungen, fuehreCodeAus, kiMission, materialMission, MISSIONEN, neuerSpielstand, pruefeBauPlan, pruefeSpielstand, pruefeWahl, STUFEN, stufeFuerAlter } from "@/lib/abenteuer";
import { abstand, bewege, inRechteck, istBegehbar, planeWeg, REQUISITEN, START, STATIONEN, STRASSEN, UEBERGAENGE, WELT, type Punkt, type Richtung } from "@/lib/spiel";
import { oeffentlicheAngebote } from "@/lib/daten";
describe("große Spielwelt",()=>{
 it("bietet mehr als fünfmal die frühere begehbare Kartenfläche",()=>expect(WELT.breite*WELT.hoehe).toBeGreaterThan(1100*700*5));
 it("führt zwischen allen vier Eingängen durch begehbare Übergänge",()=>{
  for(const start of [START,...STATIONEN.map(s=>s.eingang)])for(const s of STATIONEN){
   const weg=planeWeg(start,s.eingang);expect(weg.length).toBeGreaterThan(0);expect(abstand(weg.at(-1)!,s.eingang)).toBeLessThan(25);
   for(let i=1;i<weg.length;i++){const a=weg[i-1]!,b=weg[i]!;for(let n=0;n<=10;n++)expect(istBegehbar({x:a.x+(b.x-a.x)*n/10,y:a.y+(b.y-a.y)*n/10})).toBe(true);}
  }
 });
 it("verhindert Abkürzungen über Straßen und lässt Zebrastreifen frei",()=>{
  expect(istBegehbar({x:650,y:950})).toBe(false);expect(istBegehbar({x:400,y:950})).toBe(true);
  expect(istBegehbar({x:1190,y:650})).toBe(true);expect(istBegehbar({x:1190,y:1100})).toBe(false);
  expect(bewege({x:650,y:879},{x:0,y:1},.05)).toEqual({x:650,y:879});
 });
 it("stellt keine Bank auf eine Straße, in ein Haus oder auf ein Auto",()=>{
  for(const bank of REQUISITEN.filter(r=>r.art==="bank")){
   expect(STRASSEN.some(r=>inRechteck(bank,r))).toBe(false);
   expect(REQUISITEN.filter(r=>r.art==="auto").some(r=>inRechteck(bank,r.flaeche))).toBe(false);
   expect(STATIONEN.some(s=>Math.abs(bank.x-(s.ort.x+100))<170&&Math.abs(bank.y-(s.ort.y+50))<150)).toBe(false);
   expect(istBegehbar(bank)).toBe(false);
  }
 });
 it("blockiert Baumstämme und Bänke auch bei Tastaturbewegung",()=>{
  for(const r of REQUISITEN.filter(r=>r.art!=="auto")){
   expect(istBegehbar(r)).toBe(false);
   const pos={x:r.flaeche.x-17,y:r.flaeche.y+10};expect(bewege(pos,{x:1,y:0},.05)).toEqual(pos);
  }
 });
 it("kann eine berechnete lange Route tatsächlich vollständig ablaufen",()=>{
  let pos:Punkt={...START};const weg=planeWeg(pos,STATIONEN[3]!.eingang);
  for(const ziel of weg){let schritte=0;while(abstand(pos,ziel)>1&&schritte++<500){pos=bewege(pos,{x:ziel.x-pos.x,y:ziel.y-pos.y},Math.min(.04,abstand(pos,ziel)/205));}expect(schritte).toBeLessThan(500);}
  expect(abstand(pos,STATIONEN[3]!.eingang)).toBeLessThan(25);
 });
});
describe("altersabhängige Geschichte",()=>{
 it("wechselt an den richtigen Altersgrenzen",()=>expect([6,8,9,11,12,17].map(stufeFuerAlter)).toEqual(["start","start","weiter","weiter","profi","profi"]));
 it("hat zwölf erreichbare Kapitelaufgaben pro Stufe",()=>{
  expect(MISSIONEN).toHaveLength(12);
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
