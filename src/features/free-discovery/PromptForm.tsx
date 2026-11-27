import { useId } from "react";

import { discoveryPromptId } from "@/lib/routes";

import styles from "./FreeDiscovery.module.css";
import { MESSAGES } from "./state";
import type { Lens } from "./types";

const PRIVACY_URL = "https://app.nucla.com/legal/privacy";
const EXAMPLES = ["Series A climate tech in Europe", "AI for supply chain, Series B+", "Robotics for food manufacturing", "Packaging materials startups"];

const STRATEGIES: Partial<Record<string, { title: string; description: string }>> = {
  acquisition_generic: { title: "Acquisition", description: "Find companies to buy." },
  minority_investment_strategic: { title: "Minority investment", description: "Find companies to invest in without buying control." },
  partnership_strategic: { title: "Partnership", description: "Find companies to work with." },
  sales_general: { title: "Sales prospecting", description: "Find potential customers for what you sell." },
};

interface Props {
  lenses: Lens[];
  lens: string;
  prompt: string;
  busy: boolean;
  error: string;
  /** Takes the field focus belongs on: the one the error is about, or else the description. */
  focusRef: (node: HTMLElement | null) => void;
  onLens: (lens: string) => void;
  onPrompt: (prompt: string) => void;
  onSubmit: () => void;
}

export function PromptForm({ lenses, lens, prompt, busy, error, focusRef, onLens, onPrompt, onSubmit }: Props) {
  const id = useId();
  const strategies = lenses.map((option) => ({
    key: option.key,
    descriptionId: id + "-strategy-" + option.key + "-hint",
    ...(STRATEGIES[option.key] ?? { title: option.name, description: option.description }),
  }));

  return (
    <>
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        {lenses.length > 0 && (
          <fieldset disabled={busy} className={styles.strategies} aria-describedby={`${id}-strategy-hint`}>
            <legend className={styles.groupLabel}>Scoring strategy</legend>
            <p id={`${id}-strategy-hint`} className={styles.strategyHelp}>Your strategy shapes how Nucla scores and ranks your matches.</p>
            <div className={styles.chipRow}>
              {strategies.map((strategy) => (
                <label key={strategy.key} className={styles.strategy}>
                  <input
                    className="visually-hidden"
                    type="radio"
                    name={id + "-strategy"}
                    value={strategy.key}
                    checked={strategy.key === lens}
                    aria-describedby={strategy.descriptionId}
                    onChange={() => onLens(strategy.key)}
                  />
                  <span>{strategy.title}</span>
                </label>
              ))}
            </div>
            {strategies.map((strategy) => (
              <p
                key={strategy.key}
                id={strategy.descriptionId}
                className={styles.strategyHint}
                hidden={strategy.key !== lens}
              >
                {strategy.description}
              </p>
            ))}
          </fieldset>
        )}
        <div className={styles.prompt_card}>
          <input
            id={discoveryPromptId}
            value={prompt}
            readOnly={busy}
            onChange={(event) => onPrompt(event.target.value)}
            maxLength={300}
            aria-label="Describe the companies you are looking for"
            ref={focusRef}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={error === MESSAGES.tooShort || undefined}
            placeholder="Describe the companies you're looking for"
            className={styles.promptInput_card}
          />
          <button type="submit" disabled={busy} className={styles.promptButton_card}>
            {busy ? "Starting…" : "See my matches"}
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
              disabled={busy}
              className={`${styles.chip} ${styles.chip_card}`}
              onClick={() => onPrompt(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      {error && (
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
      <div className={styles.prompt_card}>
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
          className={styles.promptInput_card}
          readOnly={busy}
        />
        <button type="submit" disabled={busy} className={styles.promptButton_card}>
          {busy ? "Starting…" : "Find my matches"}
        </button>
      </div>
      <p id={`${id}-hint`} className={styles.hint_card}>Using your work email helps us tailor the results to your company.</p>
      {error && <p id={`${id}-error`} className={styles.formError_card}>{error}</p>}
      <button type="button" disabled={busy} className={`${styles.promptButton_card} ${styles.emailBack}`} onClick={onEdit}>
        Back
      </button>
      <p className={styles.privacy_card}>
        Your email is saved with your request. Your matches appear on this page.{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
          Privacy policy
        </a>
      </p>
    </form>
  );
}
