import type { ReactNode } from "react";

import styles from "./Eyebrow.module.css";

type Tone = "primary" | "muted" | "success" | "lilac" | "mint";

/** Small monospace label above a heading or a block. */
export function Eyebrow({ children, tone = "primary", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <div className={`${styles.eyebrow} ${styles[tone]} ${className}`}>{children}</div>;
}
