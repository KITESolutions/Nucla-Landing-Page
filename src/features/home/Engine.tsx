import { type ComponentType, type ReactNode, useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import styles from "./Engine.module.css";
import { AssessVisual, DiscoverVisual, RankVisual, ReportVisual } from "./EngineVisuals";

const icon = (paths: ReactNode) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className={styles.tabIcon}>
    {paths}
  </svg>
);

interface Step {
  label: string;
  summary: string;
  title: string;
  text: string;
  icon: ReactNode;
  Visual: ComponentType;
}

const STEPS: Step[] = [
  {
    label: "Discover",
    summary: "Thesis in, companies out",
    title: "Describe it. Nucla finds it.",
    text: "Write your thesis in plain English. Nucla searches live market data and ranks what fits.",
    icon: icon(
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </>,
    ),
    Visual: DiscoverVisual,
  },
  {
    label: "Assess",
    summary: "Every inbound, one queue",
    title: "Six inboxes become one queue.",
    text: "Nucla merges duplicates, fills the gaps, scores each company and routes it.",
    icon: icon(<path d="M4 5h16l-6 7v6l-4 2v-8z" />),
    Visual: AssessVisual,
  },
  {
    label: "Rank",
    summary: "Your weights, every score explained",
    title: "Your criteria. Your weights.",
    text: "Every score shows its breakdown and how confident Nucla is in it.",
    icon: icon(
      <>
        <path d="M5 20V12" />
        <path d="M12 20V5" />
        <path d="M19 20v-9" />
      </>,
    ),
    Visual: RankVisual,
  },
  {
    label: "Report",
    summary: "An IC-ready memo, fully sourced",
    title: "A verdict you can defend.",
    text: "An IC-ready memo. Every claim links to its source and is marked verified or inferred.",
    icon: icon(
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M9 12h7" />
        <path d="M9 16h5" />
      </>,
    ),
    Visual: ReportVisual,
  },
];

const ADVANCE_EVERY_MS = 6000;

/** One engine, four steps: the open card shows its step, and the cards advance on their own until a visitor picks one. */
export function Engine() {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(0);
  const [picked, setPicked] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const autoplay = !picked && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => setOpen((index) => (index + 1) % STEPS.length), ADVANCE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay]);

  const pick = (index: number) => {
    setPicked(true);
    setOpen(index);
    // The clicked button goes away as its card opens, so focus moves to the card.
    requestAnimationFrame(() => panel.current?.focus());
  };

  return (
    <section id="platform" className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            One engine. <span className={styles.accent}>Thesis to IC memo.</span>
          </h2>
          <p className={styles.lede}>
            Every company moves through the same four steps, whether it came from a search, your CRM or an inbound
            application.
          </p>
        </div>
        {/* Focus in the cards stops the advance, so a card never closes under a keyboard or screen reader user. */}
        <div className={styles.cards} onFocus={() => setPicked(true)}>
          {STEPS.map((step, index) => (
            <div key={step.label} className={index === open ? `${styles.card} ${styles.open}` : styles.card}>
              {index === open ? (
                <div ref={panel} tabIndex={-1} aria-label={step.label} role="region" className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitles}>
                      <span className={styles.panelLabel}>{step.label}</span>
                      <h3 className={styles.panelTitle}>{step.title}</h3>
                    </div>
                    <p className={styles.panelText}>{step.text}</p>
                  </div>
                  <div className={styles.visualSlot}>
                    <step.Visual />
                  </div>
                  {autoplay && (
                    <div className={styles.track} aria-hidden="true">
                      <div className={styles.progress} />
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" className={styles.tab} onClick={() => pick(index)} aria-label={`Show ${step.label}`}>
                  {step.icon}
                  <span className={styles.tabText}>
                    <span className={styles.tabTitle}>{step.label}</span>
                    <span className={styles.tabSummary}>{step.summary}</span>
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
