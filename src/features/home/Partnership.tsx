import type { ReactNode } from "react";

import { SectionTitle } from "@/components/ui/SectionTitle";

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

interface Stage {
  icon: ReactNode;
  label: string;
  title: string;
  text: string;
  tags: string[];
  more?: boolean;
  dark?: boolean;
}

const STAGES: Stage[] = [
  {
    icon: Globe,
    label: "Day one",
    title: "Public data.",
    text: "Start discovering with live market data on day one. No integrations, no IT ticket.",
    tags: ["No setup", "Live market data"],
  },
  {
    icon: Lock,
    label: "On your rules",
    title: "Integrations, read-only.",
    text: "Connect Affinity, your CRM and email when you choose. Read-only and permission-aware.",
    tags: ["Affinity", "CRM", "Email"],
    more: true,
  },
  {
    icon: Code,
    label: "Part of your stack",
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
        <SectionTitle accent="Part of your AI stack when you're ready." stacked balance className={styles.title}>
          Live in ten minutes.
        </SectionTitle>
        <p className={styles.lede}>
          Start small and add connections as your team gets comfortable. Each step is optional.
        </p>
      </div>
      <div className={styles.grid}>
        {STAGES.map((stage, index) => (
          <article key={stage.label} className={`${styles.card} ${stage.dark ? styles.dark : ""}`}>
            <div className={styles.cardTop}>
              <span className={styles.icon}>{stage.icon}</span>
              <span className={styles.count}>
                {String(index + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
              </span>
            </div>
            <div>
              <div className={styles.label}>{stage.label}</div>
              <h3 className={styles.cardTitle}>{stage.title}</h3>
              <p className={styles.cardText}>{stage.text}</p>
            </div>
            <div className={styles.tags}>
              {stage.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
              {stage.more && <span className={`${styles.tag} ${styles.more}`}>+ more</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
