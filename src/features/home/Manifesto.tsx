import styles from "./Manifesto.module.css";

const PROBLEMS = [
  "Most of your thesis never gets a proper look.",
  "Strong inbound gets buried until the round closes.",
  "'Why this one?' has no answer on record.",
];

export function Manifesto() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          Ventures still run on <del className={styles.struck}>inboxes</del>. They should run on{" "}
          <span className={styles.accent}>intelligence</span>.
        </h2>
        <div className={styles.grid}>
          {PROBLEMS.map((problem) => (
            <p key={problem} className={styles.problem}>
              {problem}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
