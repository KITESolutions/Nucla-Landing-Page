import { type KeyboardEvent, useId, useRef, useState } from "react";

import { SectionTitle } from "@/components/ui/SectionTitle";

import styles from "./FourOutputs.module.css";
import { AssessPreview, DiscoverPreview, RankPreview, ReportPreview } from "./OutputPreviews";

const OUTPUTS = [
  {
    label: "Discover",
    text: "Describe your thesis in plain English. Nucla searches live market data and returns companies ranked against your criteria.",
    Preview: DiscoverPreview,
  },
  {
    label: "Assess",
    text: "Affinity, your CRM, email, applications, event lists and spreadsheets land in one queue. Nucla removes duplicates, fills the gaps, scores each company and routes it.",
    Preview: AssessPreview,
  },
  {
    label: "Rank",
    text: "Set what matters and how much. Every score shows its breakdown and how confident Nucla is in it.",
    Preview: RankPreview,
  },
  {
    label: "Report",
    text: "An IC-ready memo with a clear verdict. Every claim links to its source and is marked verified or inferred.",
    Preview: ReportPreview,
  },
];

const LAST = OUTPUTS.length - 1;

export function FourOutputs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const { text, Preview } = OUTPUTS[active];

  const select = (index: number, focus = false) => {
    const next = Math.min(LAST, Math.max(0, index));
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: LAST };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key], true);
  };

  return (
    <section id="platform" className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <SectionTitle accent="Four outputs." className={styles.title}>
            One engine.
          </SectionTitle>
          <div role="tablist" aria-label="What Nucla produces" aria-orientation="vertical" className={styles.tabs} onKeyDown={onKeyDown}>
            {OUTPUTS.map((output, index) => (
              <button
                key={output.label}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={index === active}
                aria-controls={`${id}-panel`}
                tabIndex={index === active ? 0 : -1}
                className={styles.tab}
                onClick={() => select(index)}
              >
                <span className={styles.tabBar} aria-hidden="true" />
                <span className={styles.tabLabel}>{output.label}</span>
              </button>
            ))}
          </div>
          <p className={styles.description}>{text}</p>
          <div className={styles.stepper}>
            <button type="button" className={styles.back} disabled={active === 0} onClick={() => select(active - 1)}>
              ← Back
            </button>
            <button type="button" className={styles.next} disabled={active === LAST} onClick={() => select(active + 1)}>
              Next →
            </button>
            <span className={styles.position}>
              {String(active + 1).padStart(2, "0")} / {String(OUTPUTS.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className={styles.stage}>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${active}`}
            tabIndex={0}
            className={styles.preview}
          >
            <Preview />
          </div>
        </div>
      </div>
    </section>
  );
}
