import type { CSSProperties, ReactNode } from "react";

import styles from "./PageHero.module.css";

interface Props {
  /** Small label above the title, e.g. "How it works". */
  eyebrow?: string;
  /** Green status pill above the title instead of the eyebrow, e.g. "Free for venture & innovation teams". */
  badge?: string;
  title: string;
  accent: string;
  /** "stacked" puts the accent on its own line; "inline" keeps it in the sentence. */
  layout?: "stacked" | "inline";
  size?: "display" | "statement" | "compact";
  /** Width from which each stacked line stays whole (the redesign uses 900 or 960). */
  wholeLinesFrom?: 900 | 960;
  lede?: string;
  ledeWidth?: number;
  narrow?: boolean;
  id?: string;
  children?: ReactNode;
}

/** The dark band that opens every page, tucked under the floating header. */
export function PageHero({
  eyebrow,
  badge,
  title,
  accent,
  layout = "inline",
  size = "statement",
  wholeLinesFrom = 960,
  lede,
  ledeWidth = 680,
  narrow = false,
  id,
  children,
}: Props) {
  return (
    <section id={id} className={styles.band}>
      <div className={`${styles.inner} ${narrow ? styles.narrow : ""}`}>
        {badge && (
          <span className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            {badge}
          </span>
        )}
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={`${styles.title} ${styles[size]} ${styles[layout]} ${styles[`whole${wholeLinesFrom}`]}`}>
          <span className={styles.lead}>{title}</span> <span className={styles.accent}>{accent}</span>
        </h1>
        {lede && (
          <p className={styles.lede} style={{ "--lede-width": `${ledeWidth}px` } as CSSProperties}>
            {lede}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
