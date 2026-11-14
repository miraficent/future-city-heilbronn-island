"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { Symbol } from "../symbol";

/** Fenster über dem Spiel: Fokus wandert hinein, Escape schließt, danach kommt der Fokus zurück. */
export function Fensterrahmen({ titel, kennung, offen, schliessen, kopfbild, children, breit = false }: {
  titel: string;
  kennung: string;
  offen: boolean;
  schliessen: () => void;
  kopfbild?: ReactNode;
  children: ReactNode;
  breit?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const schliessenRef = useRef(schliessen);
  schliessenRef.current = schliessen;
  useEffect(() => {
    if (!offen) return;
    const vorher = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") schliessenRef.current();
    };
    window.addEventListener("keydown", taste);
    return () => {
      window.removeEventListener("keydown", taste);
      vorher?.focus?.({ preventScroll: true });
    };
  }, [offen]);
  return (
    <AnimatePresence>
      {offen && (
        <motion.div className="fenster-hintergrund" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && schliessen()}>
          <motion.div
            ref={box}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={kennung}
            className={`spiel-fenster ${breit ? "spiel-fenster-breit" : ""}`}
            initial={{ y: 60, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="spiel-fenster-kopf">
              {kopfbild}
              <h2 id={kennung}>{titel}</h2>
              <button className="rund-knopf" onClick={schliessen} aria-label="Schließen">
                <Symbol name="close" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
