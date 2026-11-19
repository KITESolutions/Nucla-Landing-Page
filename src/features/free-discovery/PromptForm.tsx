import { useId } from "react";

import styles from "./FreeDiscovery.module.css";
import { MESSAGES } from "./state";
import type { Lens } from "./types";

const PRIVACY_URL = "https://app.nucla.com/legal/privacy";
const EXAMPLES = ["Series A climate tech in Europe", "AI for supply chain, Series B+", "Robotics for food manufacturing", "Packaging materials startups"];

const STRATEGIES: Partial<Record<string, { title: string; description: string }>> = {
  acquisition_generic: { title: "Acquisition", description: "Find companies to buy." },
  minority_investment_strategic: { title: "Minority investment", description: "Find companies to invest in without buying control." },
  partnership_strategic: { title: "Partnership", description: "Find companies to work with." },
};

interface Props {
  lenses: Lens[];
  lens: string;
  prompt: string;
  error: string;
  /** Takes the field focus belongs on: the one the error is about, or else the description. */
  focusRef: (node: HTMLElement | null) => void;
  onLens: (lens: string) => void;
  onPrompt: (prompt: string) => void;
  onSubmit: () => void;
}

export function PromptForm({ lenses, lens, prompt, error, focusRef, onLens, onPrompt, onSubmit }: Props) {
  const id = useId();
  return (
    <>
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        {lenses.length > 0 && (
          <fieldset className={styles.strategies} aria-describedby={error === MESSAGES.chooseStrategy ? `${id}-error` : undefined}>
            <legend className={styles.groupLabel}>Choose a strategy</legend>
            <div className={styles.strategyGrid}>
              {lenses.map((option, index) => {
                const copy = STRATEGIES[option.key] ?? { title: option.name, description: option.description };
                const optionId = `${id}-strategy-${index}`;
                return (
                  <label key={option.key} className={styles.strategy}>
                    <input
                      ref={error === MESSAGES.chooseStrategy && index === 0 ? focusRef : undefined}
                      type="radio"
                      name={`${id}-strategy`}
                      value={option.key}
                      checked={option.key === lens}
                      aria-labelledby={`${optionId}-label`}
                      aria-describedby={`${optionId}-hint`}
                      onChange={() => onLens(option.key)}
                    />
                    <span>
                      <span id={`${optionId}-label`} className={styles.strategyTitle}>{copy.title}</span>
                      <span id={`${optionId}-hint`} className={styles.strategyHint}>{copy.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {error === MESSAGES.chooseStrategy && <p id={`${id}-error`} className={styles.formError_card}>{error}</p>}
          </fieldset>
        )}
        <div className={styles.prompt_card}>
          <input
            value={prompt}
            onChange={(event) => onPrompt(event.target.value)}
            maxLength={300}
            aria-label="Describe the companies you are looking for"
            ref={error === MESSAGES.chooseStrategy ? undefined : focusRef}
            aria-describedby={error && error !== MESSAGES.chooseStrategy ? `${id}-error` : undefined}
            aria-invalid={error === MESSAGES.tooShort || undefined}
            placeholder="Describe the companies you're looking for"
            className={styles.promptInput_card}
          />
          <button type="submit" className={styles.promptButton_card}>
            See my matches →
          </button>
        </div>
      </form>
      <div className={styles.examples_card} role="group" aria-labelledby={`${id}-examples`}>
        <p id={`${id}-examples`} className={styles.groupLabel}>Example searches</p>
        <div className={styles.chipRow}>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className={`${styles.chip} ${styles.chip_card}`}
              onClick={() => onPrompt(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      {error && error !== MESSAGES.chooseStrategy && (
        <div id={`${id}-error`} className={styles.formError_card}>
          <span>{error}</span>
        </div>
      )}
    </>
  );
}

interface EmailProps {
  email: string;
  prompt: string;
  busy: boolean;
  error: string;
  focusRef: (node: HTMLElement | null) => void;
  onEmail: (email: string) => void;
  onEdit: () => void;
  onSubmit: () => void;
}

export function DiscoveryEmailForm({ email, prompt, busy, error, focusRef, onEmail, onEdit, onSubmit }: EmailProps) {
  const id = useId();
  const invalidEmail = error === MESSAGES.invalidEmail;
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} noValidate>
      <label htmlFor={`${id}-email`} className={styles.cardTitle}>Your email</label>
      <p className={styles.quote}>“{prompt.trim()}”</p>
      <input
        ref={focusRef}
        id={`${id}-email`}
        type="email"
        value={email}
        onChange={(event) => onEmail(event.target.value)}
        maxLength={320}
        autoComplete="email"
        placeholder="you@example.com"
        aria-describedby={error ? `${id}-error ${id}-hint` : `${id}-hint`}
        aria-invalid={invalidEmail || undefined}
        className={styles.emailInput_card}
        readOnly={busy}
      />
      <p id={`${id}-hint`} className={styles.hint_card}>Using your work email helps us tailor the results to your company.</p>
      {error && <p id={`${id}-error`} className={styles.formError_card}>{error}</p>}
      <div className={styles.emailActions}>
        <button type="submit" disabled={busy} className={styles.promptButton_card}>
          {busy ? "Starting…" : "Find my matches →"}
        </button>
        <button type="button" disabled={busy} className={`${styles.chip} ${styles.chip_card}`} onClick={onEdit}>
          Edit search
        </button>
      </div>
      <p className={styles.privacy_card}>
        Your email is saved with your request. Your matches appear on this page.{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
          Privacy policy
        </a>
      </p>
    </form>
  );
}
