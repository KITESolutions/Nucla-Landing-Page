import type { ReactNode } from "react";

import styles from "./CtaBand.module.css";

interface Props {
  title: string;
  accent: string;
  id?: string;
  children: ReactNode;
}

/** A dark band with a large two-tone line and its actions, closing a page. */
export function CtaBand({ title, accent, id, children }: Props) {
  return (
    <section id={id} className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          {title} <span className={styles.accent}>{accent}</span>
        </h2>
        {children}
      </div>
    </section>
  );
}
