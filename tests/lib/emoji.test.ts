import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

it("liefert Oberfläche, Kursdaten und Themen ohne Emoji-Zeichen aus",()=>{
  const dateien:string[]=[];
  function sammeln(ordner:string){for(const eintrag of readdirSync(ordner,{withFileTypes:true})){const pfad=path.join(ordner,eintrag.name);if(eintrag.isDirectory())sammeln(pfad);else if(/\.(tsx?|json|csv)$/.test(pfad))dateien.push(pfad);}}
  sammeln("src");sammeln("daten");dateien.push("konfiguration/themen.csv");
  const treffer=dateien.filter((pfad)=>{
    // Copyright- und Markenkennzeichnungen sind normale Quellenangaben.
    const text=readFileSync(pfad,"utf8").replace(/[©®™]/g,"");
    return /\p{Extended_Pictographic}|[\uFE0F\u200D]/u.test(text);
  });
  expect(treffer).toEqual([]);
});
