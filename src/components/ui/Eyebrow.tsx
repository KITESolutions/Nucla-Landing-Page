import type { ReactNode } from "react";

import styles from "./Eyebrow.module.css";

type Tone = "muted" | "mint";

/** Small monospace label above a heading or a block. */
export function Eyebrow({ children, tone, className = "" }: { children: ReactNode; tone: Tone; className?: string }) {
  return <div className={`${styles.eyebrow} ${styles[tone]} ${className}`}>{children}</div>;
}
