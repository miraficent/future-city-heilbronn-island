"use client";

import Link from "next/link";
import type { Angebot } from "@/lib/angebot";
import type { Meta } from "@/lib/daten";
import type { Modus } from "@/lib/entdecken";
import { slugAusId } from "@/lib/routen";
import { alterText, formatTermin, naechsterTermin, statusText } from "@/lib/format";
import { themenStile } from "@/lib/themen-stil";
import { EinrichtungBadge } from "./einrichtung-badge";
import { Planet } from "./planet";
import { Symbol } from "./symbol";
import { PixelBild } from "./spiel/pixel-grafik";

export function Angebotskarte({ angebot: a, meta, modus, gemerkt, merken, jetzt }: {
  angebot: Angebot; meta: Meta; modus: Modus; gemerkt: boolean; merken: (id: string) => void; jetzt: string;
}) {
  const stile = themenStile(meta.themen);
  const stil = stile[a.themen[0] ?? ""];
  const termin = naechsterTermin(a, new Date(jetzt));
  const quelle = meta.quellen.find((q) => q.id === a.quelle);
  return (
    <article className={`angebot-karte ${modus === "kind" ? "angebot-kind" : ""} group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-tinte bg-flaeche`}>
      <div className="kartenbild relative flex h-36 items-end overflow-hidden border-b-2 border-tinte px-5 pb-4" style={{ background: modus === "kind" ? "#e4edce" : stil?.farbe ?? "#00a3a3", color: "#1c1934" }}>
        <div aria-hidden className="raster absolute inset-0 opacity-15" />
        {modus === "kind" ? <PixelBild motiv={a.themen.includes("gaming")?"spielewerkstatt":a.themen.includes("ki")?"ki-atelier":"code-labor"} className="kurs-pixelbild"/> : stil && <Planet kennung={`karte-${a.id.replace(/[^\w-]/g, "-")}`} farbe={stil.farbe} art={stil.planet} className="absolute -right-4 -top-9 w-56 transition-transform duration-500 group-hover:rotate-12" />}
        <span className="relative rounded-full border border-[#1c1934] bg-[#fbf7ee] px-3 py-1 text-xs font-bold">{a.kosten.euro === 0 ? "Kostenlos" : a.kosten.text === "siehe Anbieter" ? "Preis beim Anbieter" : a.kosten.text}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <EinrichtungBadge quelle={quelle} id={a.quelle} klein />
        <h3 className="mt-3 text-xl font-bold leading-snug"><Link className="hover:underline" href={`/angebot/${slugAusId(a.id)}?modus=${modus}`}>{a.titel}</Link></h3>
        <p className="mt-3 text-sm text-tinte-2">{alterText(a)}<br />{termin ? formatTermin(termin) : "Termin beim Veranstalter"}<br />{a.ort.online ? "Online" : a.ort.name}</p>
        {modus === "kind" && <p className="kurs-kurztext">{a.teaser.length > 130 ? `${a.teaser.slice(0,130).replace(/\s+\S*$/,"")}…` : a.teaser}</p>}
        {modus !== "kind" && <p className="mt-3 line-clamp-2 text-sm text-tinte-2">{a.teaser}</p>}
        <p className={`mt-4 text-xs font-bold ${a.status === "ausgebucht" ? "text-tinte-2" : ""}`}>{statusText(a.status)}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
          <Link className="inline-flex min-h-12 items-center font-bold underline underline-offset-4" href={`/angebot/${slugAusId(a.id)}?modus=${modus}`}>{modus === "kind" ? "Das will ich sehen →" : "Angebot ansehen →"}</Link>
          <button className="merk-knopf gap-2" aria-pressed={gemerkt} aria-label={`${a.titel} ${gemerkt ? "aus der Sammlung nehmen" : "sammeln"}`} onClick={() => merken(a.id)}><Symbol name={gemerkt?"check":"star"} className="!size-4"/>{gemerkt ? "Gesammelt" : "Sammeln"}</button>
        </div>
      </div>
    </article>
  );
}
