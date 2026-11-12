import styles from "./SignalMarquee.module.css";

const SIGNALS = [
  "Funding",
  "Hiring across 15+ ATS platforms",
  "60,000+ news, podcast & PR sources",
  "Product launches",
  "Technographics",
  "Web traffic",
  "Exec moves",
  "GitHub & research",
  "Competitive intel",
  "Your deal & relationship history",
];

/** The signals Nucla reads, scrolling. Two copies make the loop seamless. */
export function SignalMarquee() {
  return (
    <div className={styles.strip}>
      <ul className="visually-hidden" aria-label="Signals Nucla reads">
        {SIGNALS.map((signal) => (
          <li key={signal}>{signal}</li>
        ))}
      </ul>
      <div className={styles.track} aria-hidden="true">
        {[...SIGNALS, ...SIGNALS].map((signal, index) => (
          <span key={index} className={styles.item}>
            {signal}
            <span className={styles.dot}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
