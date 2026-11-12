import type { ReactNode } from "react";

import styles from "./Tag.module.css";

/** A rounded label: an integration name, a source, "Illustrative". */
export function Tag({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "mono" | "success" }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>;
}
