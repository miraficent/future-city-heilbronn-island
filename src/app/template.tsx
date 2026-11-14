import type { ReactNode } from "react";

/** Wird bei jedem Seitenwechsel neu eingehängt: sanftes Einblenden statt hartem Farbsprung (reine CSS-Animation). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="seiten-einblendung">{children}</div>;
}
