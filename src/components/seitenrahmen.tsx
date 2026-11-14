import Link from "next/link";
import type { ReactNode } from "react";
import type { Modus } from "@/lib/entdecken";
import { AppShell, Button } from "./ui";

/**
 * Rahmen der Eltern-, Teen- und Infoseiten: Top-Leiste aus DESIGN.md (night, Eule, Kinder|Eltern),
 * darunter ein großer Knopf „Angebote suchen“ (das Wichtigste für Eltern), Inhalt auf „paper“ (max. 1100px), Fußzeile.
 * `aktiv` bleibt für ältere Seiten erhalten, die es noch übergeben; die Navigation hat nur noch einen Eintrag.
 */
type Bereich = Modus | "karte" | "einblicke";

export function Seitenrahmen({ children, modus = "eltern" }: { children: ReactNode; modus?: Modus; aktiv?: Bereich }) {
  return (
    <div data-modus={modus === "teen" ? "teen" : undefined}>
      <a href="#inhalt" className="sr-only z-50 rounded-full bg-white px-5 py-3 font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Zum Inhalt springen
      </a>
      <AppShell modus={modus === "kind" ? "kinder" : "eltern"}>
        <nav aria-label="Hauptnavigation" className="mx-auto max-w-[1100px] px-4 pt-5 sm:px-8">
          <Button variante="primary" groesse="kids" icon="search" href="/eltern/#suche">Angebote suchen</Button>
        </nav>
        {children}
        <footer className="mx-auto mt-16 flex max-w-[1100px] flex-wrap justify-between gap-5 border-t-2 border-linie px-4 py-7 text-sm sm:px-8">
          <p>Heilbronn entdecken. Gemeinsam etwas Neues lernen.</p>
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
