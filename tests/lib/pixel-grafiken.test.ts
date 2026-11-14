import{readFileSync,existsSync}from"node:fs";
import{expect,it}from"vitest";
import grafiken from"@/lib/pixel-grafiken.json";
import{STATIONEN}from"@/lib/spiel";

it("liefert alle acht Spielgrafiken lokal mit gültigem Bildausschnitt aus",()=>{
  expect(Object.keys(grafiken)).toHaveLength(8);
  for(const g of Object.values(grafiken)){
    expect(g.datei.startsWith("/medien/pixel/")).toBe(true);
    const datei=`public${g.datei}`;
    expect(existsSync(datei)).toBe(true);
    expect(readFileSync(datei).subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a");
    const[x,y,rechts,unten]=g.ausschnitt;
    expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);
    expect(rechts).toBeLessThanOrEqual(g.breite);expect(unten).toBeLessThanOrEqual(g.hoehe);
    expect(rechts!).toBeGreaterThan(x!);expect(unten!).toBeGreaterThan(y!);
  }
  for(const station of STATIONEN)expect(station.grafik in grafiken).toBe(true);
});
