"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Symbol } from "./symbol";

const MotionLink = motion.create(Link);

export type NavEintrag = { id: string; href: string; text: string; symbol: string };

/** Hauptnavigation mit kleinen Bewegungen: Symbole wackeln beim Drüberfahren, Klick federt. */
export function KopfNavigation({ eintraege, aktiv }: { eintraege: NavEintrag[]; aktiv?: string }) {
  return (
    <nav aria-label="Hauptnavigation" className="haupt-nav flex flex-wrap gap-1 text-sm">
      {eintraege.map((n, i) => (
        <MotionLink
          key={n.id}
          className="nav-link nav-einblenden"
          style={{ animationDelay: `${0.06 * i}s` }}
          href={n.href}
          aria-current={aktiv === n.id ? "page" : undefined}
          initial="ruhe"
          whileHover="schwebt"
          whileTap={{ scale: 0.94 }}
          variants={{ ruhe: { y: 0 }, schwebt: { y: -2 } }}
        >
          <motion.span className="inline-flex" variants={{ ruhe: { rotate: 0 }, schwebt: { rotate: [0, -14, 12, -6, 0], transition: { duration: 0.5 } } }}>
            <Symbol name={n.symbol} className="nav-symbol" />
          </motion.span>
          {n.text}
        </MotionLink>
      ))}
    </nav>
  );
}
