import type { ReactNode } from "react";

import styles from "./SectionTitle.module.css";

interface Props {
  children: ReactNode;
  /** The second, colored half of the heading. */
  accent?: ReactNode;
  size?: "lg" | "md";
  /** Put the accent on its own line. */
  stacked?: boolean;
  /** Even out the line lengths (only some of the redesign's headings do). */
  balance?: boolean;
  id?: string;
  className?: string;
}

/** The redesign's two-tone section heading: ink text, then a primary-colored accent. */
export function SectionTitle({ children, accent, size = "lg", stacked = false, balance = false, id, className = "" }: Props) {
  return (
    <h2 id={id} className={`${styles.title} ${styles[size]} ${balance ? styles.balance : ""} ${className}`}>
      {children}
      {accent && (
        <>
          {stacked ? <br /> : " "}
          <span className={stacked ? styles.accentLine : styles.accent}>{accent}</span>
        </>
      )}
    </h2>
  );
}
