import Link from "next/link";
import type { ReactNode } from "react";
import type { Modus } from "@/lib/entdecken";
import { Symbol } from "./symbol";

type Bereich = Modus | "karte";

const NAVIGATION: Array<{ id: Bereich; href: string; text: string; symbol: string }> = [
  { id: "kind", href: "/kind/", text: "Spielwelt", symbol: "rocket" },
  { id: "teen", href: "/teen/", text: "Teens", symbol: "star" },
  { id: "eltern", href: "/eltern/", text: "Eltern & Fachkräfte", symbol: "search" },
  { id: "karte", href: "/einrichtungen/", text: "Karte", symbol: "map" },
];

export function Seitenrahmen({ children, modus = "eltern", aktiv }: { children: ReactNode; modus?: Modus; aktiv?: Bereich }) {
  const markiert = aktiv ?? modus;
  return (
    <div data-modus={modus} className="min-h-dvh bg-papier text-tinte">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b-2 border-tinte px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-sm font-extrabold tracking-tight" aria-label="COSMOS-Entdecker Startseite"><Symbol name="compass"/>COSMOS<span className="font-sans text-xs font-normal">ENTDECKER</span></Link>
        <nav aria-label="Hauptnavigation" className="haupt-nav flex flex-wrap gap-1 text-sm">
          {NAVIGATION.map((n) => (
            <Link key={n.id} className="nav-link" href={n.href} aria-current={markiert === n.id ? "page" : undefined}>
              <Symbol name={n.symbol} className="nav-symbol" />
              {n.text}
            </Link>
          ))}
        </nav>
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
