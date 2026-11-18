import { type ReactNode, useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import styles from "./FourSteps.module.css";

const WEIGHTS = ["Thesis fit · 30%", "Team · 25%", "Traction · 20%", "Deal · 10%", "Market · 10%", "Strategic alignment · 5%"];

const SYSTEMS = [
  { src: "/images/salesforce-logo.png", alt: "Salesforce" },
  { src: "/images/hubspot-logo.png", alt: "HubSpot" },
  { src: "/images/affinity-logo.png", alt: "Affinity" },
  { src: "/images/gmail-logo.png", alt: "Gmail" },
];

const QUEUE = [
  { name: "Hallex Energy", score: 92 },
  { name: "Verdant Grid", score: 87 },
  { name: "Corvo Materials", score: 81 },
];

const STEPS: { title: string; text: string; detail: ReactNode }[] = [
  {
    title: "Set your thesis",
    text: "Choose your criteria and how much each one counts.",
    detail: (
      <div className={styles.chips}>
        {WEIGHTS.map((weight) => (
          <span key={weight} className={styles.chip}>
            {weight}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Connect your systems",
    text: "Link your CRM and email when you are ready.",
    detail: (
      <div className={styles.systems}>
        {SYSTEMS.map((system) => (
          <span key={system.alt} className={styles.system}>
            <img src={system.src} alt={system.alt} height={16} className={styles.systemLogo} />
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Discover and assess",
    text: "Search the market and clear your inbound in one ranked queue.",
    detail: (
      <div className={styles.queue}>
        {QUEUE.map((row) => (
          <div key={row.name} className={styles.queueRow}>
            <span className={styles.queueName}>{row.name}</span>
            <span className={styles.meter}>
              <span className={styles.meterFill} style={{ width: `${row.score}%` }} />
            </span>
            <span className={styles.score}>{row.score}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Decide and share",
    text: "Send IC-ready reports with every source attached.",
    detail: (
      <>
        <div className={styles.memoLabel}>IC memo</div>
        <div className={styles.memoText}>Advance Hallex Energy to a partner meeting.</div>
        <div className={styles.chips}>
          <span className={`${styles.chip} ${styles.chipDone}`}>Every claim cited</span>
          <span className={styles.chip}>Share with IC</span>
        </div>
      </>
    ),
  },
];

const STEP_EVERY_MS = 2600;

/** The four steps on a track that fills one step at a time. */
export function FourSteps() {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % STEPS.length), STEP_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.title}>
          Four steps. <span className={styles.accent}>From thesis to IC.</span>
        </h2>
        <div className={styles.body}>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.trackFill} style={{ width: `${(current + 1) * 25}%` }} />
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className={styles.step}
                data-reached={index <= current || undefined}
                data-current={index === current || undefined}
              >
                <span className={styles.node} aria-hidden="true" />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
                <div className={styles.detail}>{step.detail}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
