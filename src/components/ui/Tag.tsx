import type { ReactNode } from "react";

import styles from "./Tag.module.css";

/** A small green mono label, e.g. "Nucla" beside one of its answers. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className={styles.tag}>{children}</span>;
}
