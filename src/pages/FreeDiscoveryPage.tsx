import { CtaBand } from "@/components/sections/CtaBand";
import { CustomerProof } from "@/components/sections/CustomerProof";
import { PageHero } from "@/components/sections/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FreeDiscovery } from "@/features/free-discovery/FreeDiscovery";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./FreeDiscoveryPage.module.css";

const PROMISES = ["Free", "2 free discovery prompts", "No credit card needed"];

const STEPS = [
  { n: "01", title: "Describe your thesis", text: "One sentence in plain English is enough." },
  { n: "02", title: "Nucla searches live data", text: "Funding, hiring, news, launches and more." },
  { n: "03", title: "Get a ranked list", text: "Each company scored, with the reasoning, right here on the page." },
];

export function FreeDiscoveryPage() {
  usePageTitle("Free discovery");
  return (
    <>
      <PageHero
        id="start"
        badge="Free for venture & innovation teams"
        title="Discover new companies"
        accent="scored against your thesis."
        layout="stacked"
        size="display"
        wholeLinesFrom={900}
        narrow
      >
        <FreeDiscovery variant="hero" />
        <ul className={styles.promises}>
          {PROMISES.map((promise) => (
            <li key={promise}>
              <span className={styles.tick} aria-hidden="true">
                ✓
              </span>
              {promise}
            </li>
          ))}
        </ul>
      </PageHero>

      <section className={styles.steps}>
        <SectionTitle size="md" accent="One ranked list.">
          Three steps.
        </SectionTitle>
        <ol className={styles.stepGrid}>
          {STEPS.map((step) => (
            <li key={step.n} className={styles.stepCard}>
              <div className={styles.stepNumber}>{step.n}</div>
              <div className={styles.stepTitle}>{step.title}</div>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <CustomerProof />

      <CtaBand title="Run your first" accent="discovery.">
        <div className={styles.repeat}>
          <a href="#start" className={styles.startButton}>
            Start free →
          </a>
        </div>
        <div className={styles.note}>2 free discovery prompts · no credit card</div>
      </CtaBand>
    </>
  );
}
