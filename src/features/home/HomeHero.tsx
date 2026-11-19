import { useEffect, useState } from "react";

import { discoverySectionId } from "@/lib/routes";
import { freeDiscoveryEnabled } from "@/lib/config";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { Globe } from "./Globe";
import styles from "./HomeHero.module.css";
import { Typer } from "./Typer";

const PILLARS = ["Discover new companies.", "Score every deal.", "Automate reporting."];
const PILLAR_EVERY_MS = 3200;

function usePillar() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % PILLARS.length), PILLAR_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);
  return active;
}

export function HomeHero() {
  const active = usePillar();
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          <span className={styles.line}>
            Find your next <span className={styles.accent}>best investment.</span>
          </span>{" "}
          <span className={styles.line}>Assess every opportunity faster.</span>
        </h1>
        <p className={styles.typer}>
          <span className={styles.findMe}>Find me </span>
          <Typer />
        </p>
        <div className={styles.actions}>
          {freeDiscoveryEnabled && (
            <a href={`#${discoverySectionId}`} className={styles.tryButton}>
              Try a free discovery →
            </a>
          )}
          <a href="#demo" className={styles.demoButton}>
            Book a demo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className={styles.stage}>
        <div className={styles.globe}>
          <Globe />
        </div>
        <ol className={styles.pillars}>
          {PILLARS.map((title, index) => (
            <li key={title} className={styles.pillar} data-active={index === active || undefined}>
              <span className={styles.pillarBar} aria-hidden="true" />
              <div className={styles.pillarTitle}>{title}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
