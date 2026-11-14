import Link from "next/link";
import { Seitenrahmen } from "@/components/seitenrahmen";
import { Symbol } from "@/components/symbol";
export default function NichtGefunden() {
  return <Seitenrahmen><main id="inhalt" className="mx-auto max-w-3xl px-5 py-20"><Symbol name="search" className="!size-14"/><h1 className="mt-6 font-display text-3xl font-bold">Diesen Stern finden wir gerade nicht.</h1><p className="mt-5">Das Angebot ist nicht vorhanden oder noch nicht für die Übersicht freigegeben.</p><Link className="knopf knopf-primaer mt-6" href="/">Zur Startseite</Link></main></Seitenrahmen>;
}
