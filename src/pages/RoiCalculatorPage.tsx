import { useId, useState } from "react";

import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatCount, hoursBack } from "@/lib/roi";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./RoiCalculatorPage.module.css";

type Unit = "month" | "year";

const DEFAULTS = { unit: "year" as Unit, perYear: 1000, minutes: 25, prep: 30 };
const COMPANY_RANGE: Record<Unit, { min: number; max: number; step: number }> = {
  month: { min: 10, max: 1000, step: 1 },
  year: { min: 100, max: 12000, step: 50 },
};

const ASSUMPTIONS = [
  "Every company falls into one of three groups: 20% clear non-fits, 60% maybes, 20% likely fits.",
  "First-pass time drops from 5 to 1 minute for non-fits, 30 to 8 for maybes and 30 to 15 for likely fits. That averages 25 minutes down to 8, a 68% cut.",
  "Likely fits go to a partner call. Nucla’s prepared report halves the prep time for each one.",
  "At 8 minutes instead of 25, the same hours cover roughly 3x as many companies.",
  "One analyst week is 40 hours.",
];

interface SliderProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  /** For a slider whose visible label sits elsewhere. */
  labelHidden?: boolean;
  onChange: (value: number) => void;
}

function Slider({ label, value, display, min, max, step, labelHidden = false, onChange }: SliderProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelHidden ? "visually-hidden" : styles.label}>
        {label}
      </label>
      <div className={styles.sliderRow}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={styles.slider}
        />
        <output htmlFor={id} className={styles.value}>
          {display}
        </output>
      </div>
    </div>
  );
}

export function RoiCalculatorPage() {
  usePageTitle("ROI calculator");
  const [unit, setUnit] = useState<Unit>(DEFAULTS.unit);
  const [perYear, setPerYear] = useState(DEFAULTS.perYear);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [prep, setPrep] = useState(DEFAULTS.prep);

  const monthly = unit === "month";
  const companies = monthly ? Math.round(perYear / 12) : perYear;
  const result = hoursBack({ companiesPerYear: perYear, minutesPerPass: minutes, prepMinutes: prep });

  const reset = () => {
    setUnit(DEFAULTS.unit);
    setPerYear(DEFAULTS.perYear);
    setMinutes(DEFAULTS.minutes);
    setPrep(DEFAULTS.prep);
  };

  return (
    <>
      <PageHero
        eyebrow="ROI calculator"
        title="What your team gets back"
        accent="in a year."
        lede="Enter your own numbers to see how many analyst hours Nucla gives back across first-pass review and partner-call prep."
      />

      <section className={styles.calculator} aria-label="Calculator">
        <div className={styles.grid}>
          <div className={styles.inputs}>
            <Eyebrow>Your team</Eyebrow>
            <div>
              <div className={styles.unitRow}>
                <span className={styles.label}>Companies reviewed</span>
                <div className={styles.units} role="group" aria-label="Count companies">
                  {(["month", "year"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={unit === option}
                      className={styles.unit}
                      onClick={() => setUnit(option)}
                    >
                      Per {option}
                    </button>
                  ))}
                </div>
              </div>
              <Slider
                label={`Companies reviewed per ${unit}`}
                value={companies}
                display={formatCount(companies)}
                {...COMPANY_RANGE[unit]}
                labelHidden
                onChange={(value) => setPerYear(monthly ? value * 12 : value)}
              />
            </div>
            <Slider label="Minutes per first pass" value={minutes} display={String(minutes)} min={5} max={90} step={1} onChange={setMinutes} />
            <Slider
              label="Partner-call prep, minutes per likely fit"
              value={prep}
              display={String(prep)}
              min={0}
              max={120}
              step={5}
              onChange={setPrep}
            />
            <button type="button" className={styles.reset} onClick={reset}>
              Reset to 1,000 a year
            </button>
          </div>

          <div className={styles.results} aria-live="polite">
            <Eyebrow tone="mint" className={styles.resultLabel}>
              Hours back per year
            </Eyebrow>
            <div className={styles.total}>{formatCount(result.total)}</div>
            <div className={styles.weeks}>
              About <span className={styles.weeksValue}>{result.weeks.toFixed(1)} weeks</span> of analyst time.
            </div>
            <div className={styles.breakdown}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Review</div>
                <div className={styles.statValue}>{formatCount(result.review)} h</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Partner calls</div>
                <div className={styles.statValue}>{formatCount(result.calls)} h</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Same hours</div>
                <div className={styles.statValue}>
                  ~3x <span className={styles.statUnit}>companies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.assumptions}>
        <div className={styles.assumptionsCard}>
          <h2 className={styles.assumptionsTitle}>The assumptions</h2>
          <div>
            <ol className={styles.assumptionList}>
              {ASSUMPTIONS.map((text, index) => (
                <li key={text} className={styles.assumption}>
                  <span className={styles.assumptionNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.assumptionText}>{text}</span>
                </li>
              ))}
            </ol>
            <div className={styles.disclaimer}>Modeled estimates, not guaranteed results.</div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
