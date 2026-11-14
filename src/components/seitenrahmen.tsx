import Link from "next/link";
import type { ReactNode } from "react";
import type { Modus } from "@/lib/entdecken";
import { KopfNavigation } from "./kopf-navigation";
import { Symbol } from "./symbol";

type Bereich = Modus | "karte" | "einblicke";

const NAVIGATION: Array<{ id: Bereich; href: string; text: string; symbol: string }> = [
  { id: "kind", href: "/kinder/", text: "Mini-Heilbronn", symbol: "rocket" },
  { id: "teen", href: "/teen/", text: "Teens", symbol: "star" },
  { id: "eltern", href: "/eltern/", text: "Eltern & Fachkräfte", symbol: "search" },
  { id: "karte", href: "/einrichtungen/", text: "Karte", symbol: "map" },
  { id: "einblicke", href: "/einblicke/", text: "Einblicke", symbol: "bulb" },
];

export function Seitenrahmen({ children, modus = "eltern", aktiv }: { children: ReactNode; modus?: Modus; aktiv?: Bereich }) {
  const markiert = aktiv ?? modus;
  // Kinderbereich wie bei Kinder-Apps üblich: keine Navigation nach draußen. Erwachsene kommen über den Halte-Knopf weiter.
  if (modus === "kind")
    return (
      <div data-modus={modus} className="min-h-dvh bg-papier text-tinte">
        <header className="mx-auto flex max-w-7xl items-center gap-2 border-b-2 border-tinte px-5 py-3 font-display text-sm font-extrabold tracking-tight sm:px-8">
          <Symbol name="compass" className="logo-kompass" />COSMOS<span className="font-sans text-xs font-normal">SPIELWELT</span>
        </header>
        {children}
        <footer className="mx-auto mt-10 max-w-7xl border-t-2 border-tinte px-5 py-6 text-sm sm:px-8">
          <p>Ohne Konto. Ohne Namen. Für Eltern: Knopf „Für Erwachsene“ oben – dort gibt es Kurse, Datenschutz und Impressum.</p>
        </footer>
      </div>
    );
  return (
    <div data-modus={modus} className="min-h-dvh bg-papier text-tinte">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b-2 border-tinte px-5 py-4 sm:px-8">
        <Link href="/" className="logo-link inline-flex items-center gap-2 font-display text-sm font-extrabold tracking-tight" aria-label="COSMOS-Entdecker Startseite"><Symbol name="compass" className="logo-kompass"/>COSMOS<span className="font-sans text-xs font-normal">ENTDECKER</span></Link>
        <KopfNavigation eintraege={NAVIGATION} aktiv={markiert} />
      </header>
      {children}
      <footer className="mx-auto mt-16 flex max-w-7xl flex-wrap justify-between gap-5 border-t-2 border-tinte px-5 py-7 text-sm sm:px-8">
        <p>Heilbronn entdecken. Gemeinsam etwas Neues lernen.<br /><span className="text-tinte-2">Hackathon-Prototyp · Anmeldung immer beim Veranstalter.</span></p>
        <nav aria-label="Weitere Informationen" className="flex flex-wrap items-start gap-5">
          <Link className="underline underline-offset-4" href="/datenschutz/">Datenschutz & Speicher</Link>
          <Link className="underline underline-offset-4" href="/impressum/">Impressum</Link>
          <Link className="underline underline-offset-4" href="/projekt/">Über das Projekt</Link>
        </nav>
      </footer>
    </div>
  );
}
