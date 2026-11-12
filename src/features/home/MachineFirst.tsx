import styles from "./MachineFirst.module.css";

const GROUPS = [
  { share: 20, tone: "nonFit", title: "Clear non-fits", text: "Declined with a reason.", before: "5 min", after: "1 min" },
  { share: 60, tone: "maybe", title: "The maybes", text: "Scored with reasoning.", before: "30 min", after: "8 min" },
  { share: 20, tone: "fit", title: "Likely fits", text: "Straight to a partner.", before: "30 min", after: "15 min" },
] as const;

/** The modeled 20/60/20 split and the first-pass time each group takes, before and after. */
export function MachineFirst() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          Machine-first. Human-final.
          <br />
          <span className={styles.accent}>1,000 companies a year, sorted.</span>
        </h2>
        <div className={styles.bar} aria-hidden="true">
          {GROUPS.map((group) => (
            <div key={group.title} className={`${styles.segment} ${styles[group.tone]}`} style={{ flex: group.share }}>
              {group.share}%
            </div>
          ))}
        </div>
        <ul className={styles.cards}>
          {GROUPS.map((group) => (
            <li key={group.title} className={styles.card}>
              <div className={styles.label}>
                <span className={`${styles.swatch} ${styles[group.tone]}`} aria-hidden="true" />
                {group.share}% · {group.title}
              </div>
              <div className={styles.cardTitle}>{group.title}</div>
              <div className={styles.cardText}>{group.text}</div>
              <div className={styles.times}>
                <span className="visually-hidden">First pass goes from </span>
                {group.before} <span className={styles.arrow} aria-hidden="true">→</span>
                <span className="visually-hidden"> to </span> <span className={styles.after}>{group.after}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
