import {describe,it,expect} from "vitest";
import fs from "node:fs";
import {AVATAR_GRENZEN,STANDARD_AVATAR,pruefeAvatar,alterAvatar,zufallsAvatar,figurAusAvatar,hatKappe,type AvatarKonfiguration} from "@/lib/avatar";
import {AUDIO_TEXTE,einfuehrung,LERNORTE} from "@/lib/lernwelt";
import {STUFEN} from "@/lib/abenteuer";
import {bewohnerFuer,SPRECH_RADIUS} from "@/lib/bewohner";
import {FOTOS} from "@/lib/fotos";
import {STATIONEN,abstand} from "@/lib/spiel";
import {aufsWegenetz,erzeugeStadt,istBegehbar,planeRoute} from "@/lib/stadt";
import karte from "@/lib/heilbronn-karte.json";
describe("Figurenbaukasten",()=>{
 it("übernimmt nur gültige Gestaltungskennungen und keine Personeneingaben",()=>{
  expect(pruefeAvatar({haut:99,haar:-1,oberteil:1.4,unterfarbe:"rot",name:"Kind",frisur:3})).toEqual({...STANDARD_AVATAR,frisur:3});
  expect(pruefeAvatar(null)).toEqual(STANDARD_AVATAR);
 });
 it("erzeugt ausschließlich darstellbare Kombinationen und migriert alte Vorlagen",()=>{
  for(let n=0;n<100;n++){const a=zufallsAvatar();expect(pruefeAvatar(a)).toEqual(a);for(const k of Object.keys(a) as (keyof typeof a)[])expect(a[k]>=0&&a[k]<AVATAR_GRENZEN[k]).toBe(true);}
  expect(alterAvatar("mia").frisur).toBe(3);expect(alterAvatar("fremd")).toEqual(STANDARD_AVATAR);
 });
 it("macht aus jeder Kombination eine vollständige Laufwelt-Figur – nie eine Kappe über dem Tuch",()=>{
  const alle:AvatarKonfiguration[]=[];
  for(let frisur=0;frisur<6;frisur++)for(let oberteil=0;oberteil<3;oberteil++)for(let unterteil=0;unterteil<3;unterteil++)for(let schuhe=0;schuhe<3;schuhe++)for(let zubehoer=0;zubehoer<3;zubehoer++)alle.push({...STANDARD_AVATAR,frisur,oberteil,unterteil,schuhe,zubehoer});
  expect(alle).toHaveLength(486);
  for(const a of alle){
   const f=figurAusAvatar(a);
   for(const farbe of [f.haut,f.haar,f.oberteil,f.unten,f.schuhe])expect(farbe).toMatch(/^#[0-9a-f]{6}$/);
   expect(f.oberteilArt).toBeDefined();expect(f.unterteilArt).toBeDefined();expect(f.schuhArt).toBeDefined();
   expect(f.kleidung).toBe(a.unterteil===2?"rock":"hose");
   if(a.frisur===5){expect(f.frisur).toBe("kopftuch");expect(f.kappe).toBeUndefined();expect(hatKappe(a)).toBe(false);}
   expect(f.brille).toBe(a.zubehoer===1);
  }
 });
});
describe("Heilbronner Lernorte",()=>{
 it("behält für alle vier Einrichtungen dieselben geografischen Positionen wie die lokale Stadtkarte",()=>{
  for(const o of LERNORTE){expect({x:o.x,y:o.y}).toEqual(karte.orte[o.id]);expect(o.quelle.startsWith("https://")).toBe(true);}
  expect(LERNORTE.find(o=>o.id==="ipai")!.y).toBeLessThan(LERNORTE.find(o=>o.id==="aim")!.y);
  expect(LERNORTE.find(o=>o.id==="hdf")!.x).toBeLessThan(LERNORTE.find(o=>o.id==="experimenta")!.x);
 });
 it("liefert echte Fotos lokal aus und nennt Urheber und Lizenz",()=>{
  for(const [id,foto] of Object.entries(FOTOS)){
   expect(STATIONEN.some(s=>s.id===id)).toBe(true);
   expect(fs.existsSync("public"+foto.datei)).toBe(true);
   expect(foto.autor.length).toBeGreaterThan(2);expect(foto.lizenz).toMatch(/^CC BY/);expect(foto.quelle).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
  }
 });
 it("hat eine konkrete Einführung für alle 36 Aufgabenvarianten",()=>{
  expect(Object.keys(AUDIO_TEXTE)).toHaveLength(36);
  for(const s of STUFEN)for(const art of ["code","strom","level","muster"] as const)for(const phase of [0,1,2]){
   const m=einfuehrung(art,s.id,phase);expect(m.schritte).toHaveLength(3);expect(m.text.length).toBeGreaterThan(15);expect(AUDIO_TEXTE[m.audioId]).toContain(m.text);
  }
  expect(einfuehrung("strom","profi",1).text).toContain("eins und drei");
 });
});
describe("Bewohner der Spielwelt",()=>{
 const stadt=erzeugeStadt(STATIONEN);
 const bewohner=bewohnerFuer(stadt);
 it("stehen neben dem Weg – erreichbar, aber nie im Weg oder auf der Straße",()=>{
  expect(bewohner.length).toBeGreaterThanOrEqual(5);
  for(const b of bewohner){
   expect(istBegehbar(stadt,b.ort)).toBe(false);
   expect(b.ort.y<stadt.strasse.oben||b.ort.y>stadt.strasse.unten).toBe(true);
   const amWeg=aufsWegenetz(stadt,b.ort);
   expect(amWeg.distanz).toBeLessThan(SPRECH_RADIUS);
   const route=planeRoute(stadt,stadt.start,b.ort);
   expect(route.length).toBeGreaterThan(0);
   expect(abstand(route.at(-1)!,b.ort)).toBeLessThan(SPRECH_RADIUS);
  }
 });
 it("führen ein vollständiges Gespräch mit genau einer richtigen Antwort",()=>{
  for(const b of bewohner){
   expect(b.gespraech.klein.length).toBeGreaterThan(1);expect(b.gespraech.gross.length).toBeGreaterThan(1);
   expect(b.gespraech.frage.antworten.filter(a=>a.richtig)).toHaveLength(1);
   for(const a of b.gespraech.frage.antworten)expect(a.rueckmeldung.length).toBeGreaterThan(5);
  }
 });
 it("verdeckt sich nicht gegenseitig und keine Deko steht auf ihnen",()=>{
  for(const a of bewohner)for(const b of bewohner)if(a!==b)expect(abstand(a.ort,b.ort)).toBeGreaterThan(80);
  for(const b of bewohner)for(const d of stadt.deko)expect(abstand(b.ort,d)).toBeGreaterThan(d.art==="baum"?100:40);
 });
});
