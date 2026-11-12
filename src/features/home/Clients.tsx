import styles from "./Clients.module.css";

const CLIENTS = [
  { src: "/images/mars-logo.png", name: "Mars" },
  { src: "/images/wesco-logo.png", name: "Wesco" },
  { src: "/images/pmi-logo.png", name: "Philip Morris International" },
  { src: "/images/vsp-logo.png", name: "VSP Vision Care" },
  { src: "/images/cail-logo.png", name: "CAIL", short: true },
];

export function Clients() {
  return (
    <section className={styles.section} aria-labelledby="clients-title">
      <h2 id="clients-title" className={styles.label}>
        Trusted by venture and innovation teams at
      </h2>
      <ul className={styles.grid}>
        {CLIENTS.map((client) => (
          <li key={client.name} className={styles.tile}>
            <img src={client.src} alt={client.name} className={client.short ? styles.logoShort : styles.logo} />
          </li>
        ))}
      </ul>
    </section>
  );
}
