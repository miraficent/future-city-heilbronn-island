/** Nach: npx tsc src/lib/lernwelt.ts --module commonjs --target es2022 --outDir .cache/sprechtexte --esModuleInterop --skipLibCheck */
import fs from "node:fs";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url),{AUDIO_TEXTE,LERNORTE}=require("../.cache/sprechtexte/lernwelt.js");
const texte={willkommen:"Willkommen in Heilbronn! Wähle einen Lernort. Schau dir die Erklärung an und probiere eine Aufgabe. Drei Ideen ergeben ein Raketenteil. Alle vier Teile machen unsere Rakete bereit.",...Object.fromEntries(LERNORTE.map(o=>["ort-"+o.id,o.beschreibung])),...AUDIO_TEXTE,erfolg:"Du hast eine neue Idee entdeckt. Gut ausprobiert! Möchtest du noch eine Aufgabe lösen?",finale:"Unsere Rakete ist bereit! Du hast programmiert, geforscht, gebaut und genau hingeschaut. Welche Idee möchtest du in Heilbronn weiterverfolgen?"};
fs.writeFileSync("docs/heilbronn-sprechtexte.json",JSON.stringify({sprache:"de-DE",stimme:"Freundliche erwachsene Stimme, ruhig, natürlich, klar; keine geklonte reale Person.",status:"Aufnahmen noch nicht produziert oder abgenommen",auslieferung:"Lokale Audiodateien, keine Sprachdienstanfragen beim Spielen",texte},null,2));
console.log(Object.keys(texte).length+" Sprechertexte vorbereitet.");
