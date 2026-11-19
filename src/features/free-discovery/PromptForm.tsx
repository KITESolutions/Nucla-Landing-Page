import { useId } from "react";

import styles from "./FreeDiscovery.module.css";
import { MESSAGES } from "./state";
import type { Lens } from "./types";

const PRIVACY_URL = "https://app.nucla.com/legal/privacy";
const EXAMPLES = ["Series A climate tech in Europe", "AI for supply chain, Series B+", "Robotics for food manufacturing", "Packaging materials startups"];

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
      {lenses.length > 0 && (
        <div className={`${styles.chipRow} ${styles.lenses_card}`} role="group" aria-label="Score the matches for">
          {lenses.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={option.key === lens}
              title={option.description}
              className={`${styles.chip} ${styles.chip_card} ${option.key === lens ? styles.chipOn : ""}`}
              onClick={() => onLens(option.key)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <div className={styles.prompt_card}>
          <input
            value={prompt}
            onChange={(event) => onPrompt(event.target.value)}
            maxLength={300}
            aria-label="Describe the companies you are looking for"
            ref={focusRef}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={error === MESSAGES.tooShort || undefined}
            placeholder="Describe the companies you're looking for"
            className={styles.promptInput_card}
          />
          <button type="submit" className={styles.promptButton_card}>
            See my matches →
          </button>
        </div>
      </form>
      <div className={`${styles.chipRow} ${styles.examples_card}`}>
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
