/**
 * Symbole, die nur der Eltern-Bereich braucht und die es in src/components/symbol.tsx noch nicht gibt.
 * Ebenfalls Lucide (Strich 2), gleiche Klasse „symbol“ wie dort.
 */
import { SlidersHorizontal } from "lucide-react";

export function FilterSymbol() {
  return <SlidersHorizontal className="symbol" strokeWidth={2} aria-hidden="true" focusable="false" />;
}
