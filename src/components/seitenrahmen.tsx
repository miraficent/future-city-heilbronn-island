import Link from "next/link";
import type { ReactNode } from "react";
import type { Modus } from "@/lib/entdecken";
import { KopfNavigation } from "./kopf-navigation";
import { AppShell } from "./ui";

/**
 * Rahmen der Eltern-, Teen- und Infoseiten: Top-Leiste aus DESIGN.md (night, Eule, Kinder|Eltern),
 * darunter die Bereichsnavigation, Inhalt auf „paper“ (max. 1100px), Fußzeile.
 */
type Bereich = Modus | "karte" | "einblicke";

const NAVIGATION: Array<{ id: Bereich; href: string; text: string; symbol: string }> = [
  { id: "eltern", href: "/eltern/", text: "Angebote suchen", symbol: "search" },
  { id: "karte", href: "/einrichtungen/", text: "Orte in Heilbronn", symbol: "map" },
  { id: "teen", href: "/teen/", text: "Teens", symbol: "star" },
  { id: "einblicke", href: "/einblicke/", text: "Einblicke", symbol: "bulb" },
];

export function Seitenrahmen({ children, modus = "eltern", aktiv }: { children: ReactNode; modus?: Modus; aktiv?: Bereich }) {
  const markiert = aktiv ?? modus;
  return (
    <div data-modus={modus === "teen" ? "teen" : undefined}>
      <a href="#inhalt" className="sr-only z-50 rounded-full bg-white px-5 py-3 font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Zum Inhalt springen
      </a>
      <AppShell modus={modus === "kind" ? "kinder" : "eltern"}>
        <div className="mx-auto max-w-[1100px] px-4 pt-4 sm:px-8">
          <KopfNavigation eintraege={NAVIGATION} aktiv={markiert} />
        </div>
        {children}
        <footer className="mx-auto mt-16 flex max-w-[1100px] flex-wrap justify-between gap-5 border-t-2 border-linie px-4 py-7 text-sm sm:px-8">
          <p>Heilbronn entdecken. Gemeinsam etwas Neues lernen.<br /><span className="text-tinte-2">Hackathon-Prototyp · Anmeldung immer beim Veranstalter.</span></p>
          <nav aria-label="Weitere Informationen" className="flex flex-wrap items-start gap-5">
            <Link className="underline underline-offset-4" href="/mitmachen/">Mitmachen</Link>
            <Link className="underline underline-offset-4" href="/datenschutz/">Datenschutz & Speicher</Link>
            <Link className="underline underline-offset-4" href="/impressum/">Impressum</Link>
            <Link className="underline underline-offset-4" href="/projekt/">Über das Projekt</Link>
          </nav>
        </footer>
      </AppShell>
    </div>
  );
}
