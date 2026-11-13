import type { ReactNode } from "react";
import { HAUS_FLAECHE, REQUISITEN, STATIONEN, STRASSEN, TEICH, UEBERGAENGE, WELT, type Punkt } from "@/lib/spiel";
import { PixelGrafik } from "./pixel-grafik";
export function Spielfigur({bewegt=false,motiv="kind"}:{bewegt?:boolean;motiv?:"kind"|"roboter"}){
  return <g className={bewegt?"spielfigur figur-laeuft":"spielfigur"}><ellipse cy="4" rx="17" ry="5" fill="#254950" opacity=".18"/><g className="figur-koerper"><PixelGrafik motiv={motiv} x={-23} y={-84} breite={46} hoehe={88}/></g></g>;
}
export function Weltgrafik({position,bewegt,erledigt,ziel,onZiel,onStation,gesamt=false,zoom=1,verhaeltnis=1.7}:{position:Punkt;bewegt:boolean;erledigt:string[];ziel?:Punkt;onZiel:(p:Punkt)=>void;onStation:(id:string)=>void;gesamt?:boolean;zoom?:number;verhaeltnis?:number}){
  const breite=(verhaeltnis<1.2?660:1060)/zoom,hoehe=breite/verhaeltnis;
  const kamera={x:Math.max(0,Math.min(WELT.breite-breite,position.x-breite/2)),y:Math.max(0,Math.min(WELT.hoehe-hoehe,position.y-hoehe*.65))};
  const schichten:{id:string;y:number;node:ReactNode}[]=REQUISITEN.map(r=>({id:r.id,y:r.y,node:r.art==="auto"?<g transform={`translate(${r.x-45} ${r.y-40})`}><rect x="3" y="8" width="84" height="33" rx="7" fill="#e18b60" stroke="#345457" strokeWidth="3"/><path d="M24 8 34 0h30l12 8" fill="#bad9d3" stroke="#345457" strokeWidth="3"/><rect x="13" y="34" width="15" height="10" fill="#345457"/><rect x="63" y="34" width="15" height="10" fill="#345457"/></g>:<PixelGrafik motiv={r.art} x={r.x-r.breite/2} y={r.y-r.hoehe} breite={r.breite} hoehe={r.hoehe}/>})); 
  schichten.push({id:"ideenbaum",y:1225,node:<g data-ideenbaum><PixelGrafik motiv="baum" x={695} y={965} breite={210} hoehe={260}/>{STATIONEN.map((s,i)=><g key={s.id} transform={`translate(${747+(i%2)*100} ${1040+Math.floor(i/2)*80})`}><rect x="-15" y="-15" width="30" height="30" fill={erledigt.includes(s.id)?s.farbe:"#8aab80"} stroke={erledigt.includes(s.id)?"#fff2c7":"#65835d"} strokeWidth="4"/></g>)}<rect x="698" y="1235" width="204" height="36" fill="#fff2c7" stroke="#345457" strokeWidth="2"/><text x="800" y="1259" textAnchor="middle" fontSize="20" fill="#345457">Der Ideenbaum</text></g>});
  for(const s of STATIONEN)schichten.push({id:s.id,y:s.ort.y+145,node:<g data-station={s.id} className="welt-gebaeude" transform={`translate(${s.ort.x} ${s.ort.y})`} onPointerDown={e=>{e.stopPropagation();onStation(s.id);}}>
    <PixelGrafik motiv={s.grafik} {...HAUS_FLAECHE}/>
    <g data-gebaeude-label><rect x="-20" y="-108" width="240" height="50" fill="#fff7df" stroke="#35574c" strokeWidth="2"/><text x="100" y="-85" textAnchor="middle" fill="#254950" fontSize="20" fontWeight="800">{s.kurz}</text><text x="100" y="-67" textAnchor="middle" fill="#526b5f" fontSize="13">{s.name}</text></g>
    <path d="M100 155v20m-8-8 8 8 8-8" fill="none" stroke={s.farbe} strokeWidth="5"/>
    {erledigt.includes(s.id)&&<g transform="translate(206 -103)"><rect x="-13" y="-13" width="26" height="26" fill="#477c66" stroke="#fff4d9" strokeWidth="2"/><path d="m-7 0 5 5 9-10" fill="none" stroke="#fff4d9" strokeWidth="3"/></g>}
  </g>});
  schichten.push({id:"spieler",y:position.y,node:<g data-spielfigur transform={`translate(${position.x.toFixed(1)} ${position.y.toFixed(1)})`}><Spielfigur bewegt={bewegt}/></g>});
  return <svg className="spielwelt-svg pixel-welt" viewBox={gesamt?`0 0 ${WELT.breite} ${WELT.hoehe}`:`${kamera.x} ${kamera.y} ${breite} ${hoehe}`} aria-label="Begehbare Stadt mit vier Lernhäusern, Park und Ideenbaum. Überquere Straßen an den Zebrastreifen." role="img" onPointerDown={e=>{if((e.target as Element).closest("[data-station]"))return;const matrix=e.currentTarget.getScreenCTM()?.inverse();if(matrix){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix);onZiel(p);}}}>
    <defs><pattern id="pixel-rasen" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#d6e5bf"/><path d="M8 13h3v3h-3zm23 20h3v3h-3zM18 40h5v2h-5z" fill="#b7d09e"/></pattern><pattern id="pixel-wasser" width="32" height="24" patternUnits="userSpaceOnUse"><rect width="32" height="24" fill="#7eb9c2"/><path d="M3 8h12v3H3zm15 12h10v2H18z" fill="#afd6d5"/></pattern><pattern id="pixel-weg" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#f1dfb5"/><path d="M5 7h3v2H5zm16 15h4v2h-4z" fill="#ddc99b"/></pattern></defs>
    <rect width={WELT.breite} height={WELT.hoehe} fill="url(#pixel-rasen)"/>
    <path d="M400 650H1800V1370H400V650M800 650V805M800 1070V1370" fill="none" stroke="#c7b88d" strokeWidth="78"/><path d="M400 650H1800V1370H400V650M800 650V805M800 1070V1370" fill="none" stroke="url(#pixel-weg)" strokeWidth="66"/>
    {STRASSEN.map((r,i)=><rect key={i} x={r.x} y={r.y} width={r.breite} height={r.hoehe} fill="#66807c" stroke="#b3b7a3" strokeWidth="12"/>)}
    <path d="M0 950H2400M1190 0V1700" stroke="#e1e1c5" strokeWidth="4" strokeDasharray="30 26"/>
    {UEBERGAENGE.map((r,i)=><g key={i} data-uebergang={i}>{Array.from({length:7},(_,n)=><rect key={n} x={r.x+(i<2?8:n*20)} y={r.y+(i<2?n*20:8)} width={i<2?r.breite-16:10} height={i<2?10:r.hoehe-16} fill="#fff4d9"/>)}</g>)}
    <rect x={TEICH.x-8} y={TEICH.y-8} width={TEICH.breite+16} height={TEICH.hoehe+16} rx="35" fill="#a5bd8b"/><rect x={TEICH.x} y={TEICH.y} width={TEICH.breite} height={TEICH.hoehe} rx="28" fill="url(#pixel-wasser)"/>
    {[[530,330],[1530,300],[960,1260],[2000,1160],[2120,620],[570,1410]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><path d="M-8-3h5v-5h5v5h5v5H2v5h-5V2h-5Z" fill={i%2?"#c596c0":"#e6b65e"}/><rect x="-2" y="-2" width="4" height="4" fill="#fff4d9"/></g>)}
    <g transform="translate(720 805)"><rect width="160" height="38" fill="#fff2c7" stroke="#345457" strokeWidth="2"/><text x="80" y="25" textAnchor="middle" fontSize="18" fill="#345457">Zum Ideenbaum</text></g>
    {ziel&&<g transform={`translate(${ziel.x} ${ziel.y})`}><path d="M-13 0h7m12 0h7M0-8v4m0 8v4" stroke="#b95e3d" strokeWidth="3"/></g>}
    {schichten.sort((a,b)=>a.y-b.y).map(s=><g key={s.id} data-weltobjekt={s.id}>{s.node}</g>)}
  </svg>;
}
