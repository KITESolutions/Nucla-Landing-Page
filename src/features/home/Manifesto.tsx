import styles from "./Manifesto.module.css";

const PROBLEMS = [
  "Most of your thesis never gets a proper look.",
  "Strong inbound gets buried until the round closes.",
  "'Why this one?' has no answer on record.",
];

export function Manifesto() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Ventures still run on <del className={styles.struck}>inboxes</del>. They should run on{" "}
        <span className={styles.accent}>intelligence</span>.
      </h2>
      <div className={styles.grid}>
        {PROBLEMS.map((problem, index) => (
          <div key={problem}>
            <div className={styles.label}>Problem {String(index + 1).padStart(2, "0")}</div>
            <p className={styles.problem}>{problem}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
