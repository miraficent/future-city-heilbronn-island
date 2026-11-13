import { describe, expect, it } from "vitest";
import { abstand, bewege, CODE_ZIEL, gueltigeErfolge, HAUS_FLAECHE, HINDERNISSE, naheStation, passendeSpielAngebote, planeWeg, pruefeProgramm, START, STATIONEN } from "@/lib/spiel";
import { oeffentlicheAngebote } from "@/lib/daten";

describe("2D-Bewegung",()=>{
  it("hält Gebäude, Eingänge und die beiden Hausreihen auf gemeinsamen Linien",()=>{
    const [code,forschen,familie,ki]=STATIONEN;
    expect(code!.ort.y).toBe(forschen!.ort.y);
    expect(familie!.ort.y).toBe(ki!.ort.y);
    expect(code!.ort.x).toBe(familie!.ort.x);
    expect(forschen!.ort.x).toBe(ki!.ort.x);
    expect(code!.eingang.y).toBe(forschen!.eingang.y);
    expect(familie!.eingang.y).toBe(ki!.eingang.y);
  });
  it("verhindert einen Geschwindigkeitsvorteil durch diagonales Laufen",()=>{
    expect(abstand(START,bewege(START,{x:1,y:1},.04))).toBeCloseTo(abstand(START,bewege(START,{x:1,y:0},.04)));
  });
  it("hält die Figur auch auf der Dachseite außerhalb der sichtbaren Häuser",()=>{
    for(const station of STATIONEN){
      const vorDach={x:station.ort.x+100,y:station.ort.y+HAUS_FLAECHE.y-12};
      expect(bewege(vorDach,{x:0,y:1},.05)).toEqual(vorDach);
    }
  });
  it("begrenzt Zeitsprünge nach einer Pause und hält die Figur aus Gebäuden heraus",()=>{
    expect(abstand(START,bewege(START,{x:1,y:0},60))).toBeLessThanOrEqual(10.26);
    const wand={x:100,y:100,breite:100,hoehe:100};
    expect(bewege({x:82,y:150},{x:1,y:0},.05,[wand])).toEqual({x:82,y:150});
    expect(bewege({x:32,y:100},{x:-1,y:0},.05)).toEqual({x:32,y:100});
  });
  it("führt Touch-Wege auch von der anderen Gebäudeseite zum Eingang",()=>{
    for(const station of STATIONEN){
      const weg=planeWeg({x:80,y:520},station.eingang);
      expect(weg.length).toBeGreaterThan(0);
      expect(abstand(weg.at(-1)!,station.eingang)).toBeLessThan(25);
      for(const p of weg)expect(HINDERNISSE.some(h=>p.x>h.x-16&&p.x<h.x+h.breite+16&&p.y>h.y-10&&p.y<h.y+h.hoehe+10)).toBe(false);
    }
  });
  it("öffnet eine nahe Station unabhängig von bereits erledigten Aufgaben",()=>{
    expect(naheStation(STATIONEN[0]!.eingang)?.id).toBe("aim");
    expect(naheStation(START)).toBeUndefined();
  });
});

describe("Lernaufgaben und Speicherung",()=>{
  it("führt ein gültiges Roboterprogramm bis zur Fahne aus",()=>{
    const ergebnis=pruefeProgramm(["rechts","rechts","rechts","rechts","hoch","hoch","hoch"]);
    expect(ergebnis.ok).toBe(true);
    expect(ergebnis.weg.at(-1)).toEqual(CODE_ZIEL);
  });
  it("meldet Mauern und unfertige Programme ohne falschen Erfolg",()=>{
    expect(pruefeProgramm(["rechts","hoch"]).ok).toBe(false);
    expect(pruefeProgramm(["rechts","hoch"]).weg).toHaveLength(2);
    expect(pruefeProgramm([]).ok).toBe(false);
    expect(pruefeProgramm(["links"]).ok).toBe(false);
  });
  it("übernimmt nur bekannte Aufgaben aus einem gespeicherten Spielstand",()=>{
    expect(gueltigeErfolge(["aim","aim",null,"fremd",7,"ipai"])).toEqual(["aim","ipai"]);
    expect(gueltigeErfolge({aim:true})).toEqual([]);
  });
  it("verknüpft Aufgaben mit echten, altersgerechten Kursen",()=>{
    const angebote=passendeSpielAngebote(oeffentlicheAngebote(),"coding",8,new Date("2026-11-13T10:00:00+01:00"));
    expect(angebote.length).toBeGreaterThan(0);
    expect(angebote.every(a=>a.themen.includes("coding")&&(a.alterMin??0)<=8&&(a.alterMax??99)>=8)).toBe(true);
    expect(angebote.some(a=>a.id==="aim:262420PAI")).toBe(false);
  });
});
