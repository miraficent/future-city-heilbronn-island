import { notFound } from "next/navigation";
import { AngebotDetails } from "@/components/angebot-details";
import { angebotNachSlug, META, oeffentlicheAngebote, slugAusId } from "@/lib/daten";

export function generateStaticParams() {
  return oeffentlicheAngebote().map((a) => ({ id: slugAusId(a.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const a = angebotNachSlug((await params).id);
  return { title: a?.titel ?? "Angebot nicht gefunden", description: a?.teaser, openGraph: { title: a?.titel, description: a?.teaser } };
}

export default async function AngebotSeite({ params }: { params: Promise<{ id: string }> }) {
  const a = angebotNachSlug((await params).id);
  if (!a) notFound();
  return <AngebotDetails angebot={a} meta={META} jetzt={new Date().toISOString()} />;
}
