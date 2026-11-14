import { existsSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { CheckpointSeite } from "@/components/kinder/checkpoint-seite";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { kartenOrte } from "@/lib/kinderkarte";
import { kartenFuerOrt, kinderKarten } from "@/lib/kinderkarten";
import kategorien from "@/data/categories.json";
import liveEvents from "@/data/events.json";
import type { Category, LiveEvent } from "@/types";

/** Eine Seite pro Ort auf der Karte – erzeugt aus der Ortsliste, nie von Hand */
export function generateStaticParams() {
  return kartenOrte(META.quellen).map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ort = kartenOrte(META.quellen).find((o) => o.id === id);
  return { title: ort ? `${ort.name} – Heilbronn Island` : "Ort nicht gefunden" };
}

export default async function Checkpoint({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ort = kartenOrte(META.quellen).find((o) => o.id === id);
  if (!ort) notFound();
  const karten = kartenFuerOrt(kinderKarten(oeffentlicheAngebote(), liveEvents as LiveEvent[], new Date(META.aktualisiert)), id);
  // Eigenes Hintergrundbild der Themenwelt, falls vorhanden (public/welten/<id>.jpg) – sonst Leuchtgitter
  const bild = existsSync(path.join(process.cwd(), "public", "welten", `${id}.jpg`)) ? `/welten/${id}.jpg` : null;
  return <CheckpointSeite ort={ort} karten={karten} kategorien={kategorien as Category[]} bild={bild} />;
}
