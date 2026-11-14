import { notFound } from "next/navigation";
import { CheckpointSeiteLive } from "@/components/kinder/live-karten";
import { META } from "@/lib/daten";
import { kartenOrte } from "@/lib/kinderkarte";
import kategorien from "@/data/categories.json";
import type { Category } from "@/types";

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
  // Nur Live-Events – der Browser lädt sie aus Mobilizon, solange läuft das Kind in den Raum
  return <CheckpointSeiteLive ort={ort} kategorien={kategorien as Category[]} />;
}
