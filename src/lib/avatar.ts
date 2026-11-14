import type { Figur } from "./figuren";
export const HAUT=["#f5d2b3","#e4b38c","#c68c65","#a66b49","#7c4b35","#503528"];
export const HAAR=["#29252a","#68432e","#a66c3b","#e1bd68","#a34e39","#696c83"];
export const FARBEN=["#dc7659","#e6b94b","#77a87c","#4c9695","#557eb2","#8c76ac","#d28aa3","#ece4d3"];
export const FRISUREN=["kurz","scheitel","locken","zopf","puffs","tuch"] as const;
export const OBERTEILE=["shirt","pullover","jacke","hoodie"] as const;
export const UNTERTEILE=["hose","shorts","rock","jeans","jogger"] as const;
export type AvatarKonfiguration={gesicht:number;augen:number;haut:number;haar:number;frisur:number;oberteil:number;oberfarbe:number;unterteil:number;unterfarbe:number;schuhe:number;schuhfarbe:number;zubehoer:number};
export const STANDARD_AVATAR:AvatarKonfiguration={gesicht:0,augen:0,haut:2,haar:0,frisur:2,oberteil:2,oberfarbe:3,unterteil:0,unterfarbe:4,schuhe:0,schuhfarbe:1,zubehoer:0};
export const AVATAR_GRENZEN:Record<keyof AvatarKonfiguration,number>={gesicht:3,augen:3,haut:6,haar:6,frisur:6,oberteil:4,oberfarbe:8,unterteil:5,unterfarbe:8,schuhe:3,schuhfarbe:6,zubehoer:3};
export function pruefeAvatar(roh:unknown):AvatarKonfiguration{
 const neu={...STANDARD_AVATAR};if(!roh||typeof roh!=="object")return neu;
 for(const key of Object.keys(neu) as (keyof AvatarKonfiguration)[]){const v=(roh as Record<string,unknown>)[key];if(typeof v==="number"&&Number.isInteger(v)&&v>=0&&v<AVATAR_GRENZEN[key])neu[key]=v;}return neu;
}
export function zufallsAvatar():AvatarKonfiguration{const a={...STANDARD_AVATAR};for(const k of Object.keys(a) as (keyof AvatarKonfiguration)[])a[k]=Math.floor(Math.random()*AVATAR_GRENZEN[k]);return a;}
/** Alte Figuren werden nur als Gestaltungsvorlage gelesen, nie als Personendaten. */
export function alterAvatar(id:unknown):AvatarKonfiguration{
 const a={...STANDARD_AVATAR};
 if(id==="mia")return {...a,haut:0,frisur:3,haar:4,oberfarbe:6,unterteil:2};
 if(id==="leo")return {...a,haut:0,frisur:1,haar:3,zubehoer:1};
 if(id==="amara")return {...a,haut:4,frisur:4,oberfarbe:1,unterfarbe:5};
 if(id==="lina")return {...a,haut:2,frisur:5,oberfarbe:2};
 return a;
}

const PIXEL_FRISUR=["kurz","seitenscheitel","locken","pferdeschwanz","puffs","kopftuch"] as const;
const SCHUHE=["sneaker","stiefel","sandalen"] as const;
/** Das Tuch hat eine eigene Farbe aus der Kleiderpalette; eine Kappe passt nicht darüber und wird dann weggelassen. */
export const tuchFarbe=(a:AvatarKonfiguration)=>FARBEN[a.haar%FARBEN.length]!;
export const hatKappe=(a:AvatarKonfiguration)=>a.zubehoer===2&&a.frisur!==5;
/** Dieselbe selbst gestaltete Figur als Pixel-Spielfigur für die Laufwelt. */
export function figurAusAvatar(a:AvatarKonfiguration):Figur{
 const tuch=a.frisur===5,unterteil=a.unterteil===1?"shorts":a.unterteil===2?"rock":"hose",oberteil=(["shirt","pullover","jacke","pullover"] as const)[a.oberteil]??"shirt";
 return {id:"eigene",name:"Du",haut:HAUT[a.haut]!,haar:tuch?tuchFarbe(a):HAAR[a.haar]!,frisur:PIXEL_FRISUR[a.frisur]??"kurz",kleidung:unterteil==="rock"?"rock":"hose",oberteil:FARBEN[a.oberfarbe]!,unten:FARBEN[a.unterfarbe]!,akzent:"#fbf7ee",schuhe:FARBEN[a.schuhfarbe]!,maedchen:false,brille:a.zubehoer===1,oberteilArt:oberteil,unterteilArt:unterteil,schuhArt:SCHUHE[a.schuhe]??"sneaker",kappe:hatKappe(a)?FARBEN[a.unterfarbe]:undefined};
}
