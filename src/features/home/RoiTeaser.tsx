import { useState } from "react";
import { Link } from "react-router-dom";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatCount, hoursBack } from "@/lib/roi";
import { routes } from "@/lib/routes";

import styles from "./RoiTeaser.module.css";

const digits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

/** The one-sentence ROI estimate; first-pass time only. The full calculator adds partner-call prep. */
export function RoiTeaser() {
  const [perMonth, setPerMonth] = useState("85");
  const [minutes, setMinutes] = useState("25");
  const { review } = hoursBack({
    companiesPerYear: Number(perMonth || 0) * 12,
    minutesPerPass: Number(minutes || 0),
    prepMinutes: 0,
  });

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <Eyebrow className={styles.eyebrow}>ROI</Eyebrow>
        <p className={styles.sentence}>
          If your team reviews{" "}
          <input
            value={perMonth}
            onChange={(event) => setPerMonth(digits(event.target.value, 4))}
            inputMode="numeric"
            aria-label="Companies per month"
            className={`${styles.input} ${styles.wide}`}
          />{" "}
          companies a month and spends{" "}
          <input
            value={minutes}
            onChange={(event) => setMinutes(digits(event.target.value, 4))}
            inputMode="numeric"
            aria-label="Minutes per first pass"
            className={`${styles.input} ${styles.narrow}`}
          />{" "}
          minutes on each first pass, Nucla gives you back{" "}
          <output className={styles.hours} aria-live="polite">
            {formatCount(review)}
          </output>{" "}
          hours a year.
        </p>
        <div className={styles.footer}>
          <Link to={routes.roiCalculator} className={styles.link}>
            Open the full ROI calculator →
          </Link>
          <span className={styles.assumption}>Assumes a 68% cut in first-pass time, from our modeled 20/60/20 split.</span>
        </div>
      </div>
    </section>
  );
}
