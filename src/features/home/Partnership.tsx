import type { ReactNode } from "react";

import styles from "./Partnership.module.css";

const Globe = (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z" />
  </svg>
);
const Lock = (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const Code = (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 7 4 12l5 5M15 7l5 5-5 5" />
  </svg>
);

/** Each logo's height, matched by eye in the redesign so the marks look the same size. */
interface Logo {
  src: string;
  alt: string;
  height: number;
}

interface Stage {
  icon: ReactNode;
  title: string;
  text: string;
  logos?: Logo[];
  /** Set the logos further apart (the public data row). */
  spread?: boolean;
  tags?: string[];
  more?: boolean;
  dark?: boolean;
}

const STAGES: Stage[] = [
  {
    icon: Globe,
    title: "Public data.",
    text: "Start discovering with live market data on day one. No integrations, no IT ticket.",
    logos: [
      { src: `${import.meta.env.BASE_URL}images/linkedin-logo.png`, alt: "LinkedIn", height: 18 },
      { src: `${import.meta.env.BASE_URL}images/crustdata-logo.png`, alt: "Crustdata", height: 18 },
      { src: `${import.meta.env.BASE_URL}images/crunchbase-logo.png`, alt: "Crunchbase", height: 15 },
      { src: `${import.meta.env.BASE_URL}images/carbonarc-logo.png`, alt: "Carbon Arc", height: 18 },
    ],
    spread: true,
  },
  {
    icon: Lock,
    title: "Integrations, read-only.",
    text: "Connect your CRM and email when you choose.",
    logos: [
      { src: `${import.meta.env.BASE_URL}images/salesforce-logo.png`, alt: "Salesforce", height: 20 },
      { src: `${import.meta.env.BASE_URL}images/hubspot-logo.png`, alt: "HubSpot", height: 20 },
      { src: `${import.meta.env.BASE_URL}images/affinity-logo.png`, alt: "Affinity", height: 20 },
      { src: `${import.meta.env.BASE_URL}images/gmail-logo.png`, alt: "Gmail", height: 20 },
    ],
    more: true,
  },
  {
    icon: Code,
    title: "MCP connections.",
    text: "Ask Nucla from the AI assistants your team already uses.",
    tags: ["Claude", "ChatGPT", "Copilot"],
    dark: true,
  },
];

export function Partnership() {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          Start simple.
          <br />
          <span className={styles.accent}>Part of your AI stack when you're ready.</span>
        </h2>
      </div>
      <div className={styles.grid}>
        {STAGES.map((stage) => (
          <article key={stage.title} className={`${styles.card} ${stage.dark ? styles.dark : ""}`}>
            <span className={styles.icon}>{stage.icon}</span>
            <div>
              <h3 className={styles.cardTitle}>{stage.title}</h3>
              <p className={styles.cardText}>{stage.text}</p>
            </div>
            <div className={`${styles.footer} ${stage.spread ? styles.spread : stage.logos ? styles.logos : ""}`}>
              {stage.logos?.map((logo) => (
                <img key={logo.alt} src={logo.src} alt={logo.alt} height={logo.height} className={styles.logo} />
              ))}
              {stage.tags?.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
              {stage.more && <span className={styles.more}>+ more</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
