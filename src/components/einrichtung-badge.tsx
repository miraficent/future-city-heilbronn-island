import type { QuelleMeta } from "@/lib/daten";

const KURZNAMEN: Record<string, string> = { aim: "aim", experimenta: "experimenta", hdf: "Haus der Familie", ipai: "IPAI" };

export function kurzname(quelle: QuelleMeta | undefined, id: string): string {
  return KURZNAMEN[id] ?? quelle?.name.split(/[–-]/)[0]?.trim() ?? id;
}

export function EinrichtungBadge({ quelle, id, klein = false }: { quelle: QuelleMeta | undefined; id: string; klein?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wide ${klein ? "text-[0.68rem]" : "text-xs"}`}>
      <span aria-hidden className="inline-block size-2.5 rounded-full" style={{ background: quelle?.farbe ?? "#888" }} />
      {kurzname(quelle, id)}
    </span>
  );
}
