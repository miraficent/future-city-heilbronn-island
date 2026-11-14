import Link from "next/link";
import { Entdecker } from "@/components/entdecker";
import { HeilbronnKarte } from "@/components/heilbronn-karte";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { META, oeffentlicheAngebote } from "@/lib/daten";
import { lernorte } from "@/lib/lernorte";

export const metadata = { title: "Teens – dein nächster Skill" };

export default function Teen() {
  const orte = lernorte();
  const orteTeil = (
    <section aria-labelledby="teen-orte" className="teen-orte mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest">Heilbronn · {orte.length} Orte · echte Adressen</p>
          <h2 id="teen-orte" className="mt-2 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-extrabold leading-tight">Hier passiert&apos;s. In echt.</h2>
          <p className="mt-2 max-w-2xl text-tinte-2">Tippe auf einen Ort: Was dort läuft, für welches Alter, wann der nächste Termin ist – und wie du hinkommst.</p>
        </div>
        <Link className="knopf" href="/einrichtungen/">Ganze Karte öffnen →</Link>
      </div>
      <div className="mt-6">
        <HeilbronnKarte orte={orte} />
      </div>
    </section>
  );
  return (
    <Seitenrahmen modus="teen">
      <Entdecker modus="teen" angebote={oeffentlicheAngebote()} meta={META} jetzt={META.aktualisiert} zusatz={orteTeil} />
    </Seitenrahmen>
  );
}
