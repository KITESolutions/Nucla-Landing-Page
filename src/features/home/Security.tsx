import styles from "./Security.module.css";

const BADGES = ["SOC 2 Type II", "No cross-client training"];

export function Security() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Your deal flow stays yours. Read-only, permission-aware and auditable.</h2>
      <ul className={styles.badges}>
        {BADGES.map((badge) => (
          <li key={badge} className={styles.badge}>
            {badge}
          </li>
        ))}
      </ul>
    </section>
  );
}
