import { type FormEvent, useId } from "react";

import styles from "./FreeDiscovery.module.css";
import { MESSAGES } from "./state";
import type { Lens } from "./types";

const PRIVACY_URL = "https://app.nucla.com/legal/privacy";
const EXAMPLES = ["Series A climate tech in Europe", "AI for supply chain, Series B+", "Robotics for food manufacturing", "Packaging materials startups"];

interface Props {
  lenses: Lens[];
  lens: string;
  email: string;
  prompt: string;
  busy: boolean;
  error: string;
  /** Takes the field focus belongs on: the one the error is about, or else the description. */
  focusRef: (node: HTMLElement | null) => void;
  onLens: (lens: string) => void;
  onEmail: (email: string) => void;
  onPrompt: (prompt: string) => void;
  onSubmit: () => void;
}

/** Strategy, then the email (the search only runs once we have it), then the description. */
export function PromptForm({ lenses, lens, email, prompt, busy, error, focusRef, onLens, onEmail, onPrompt, onSubmit }: Props) {
  const id = useId();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
  const label = busy ? "Starting…" : "See my matches →";
  // The email's own check belongs to the email field; any other error is read with the description.
  const emailError = error === MESSAGES.invalidEmail;
  const promptField = {
    ref: emailError ? undefined : focusRef,
    "aria-describedby": error && !emailError ? `${id}-error` : undefined,
    "aria-invalid": error === MESSAGES.tooShort || undefined,
  };

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
      {/* The browser's own email check would hide our message, so the form checks it instead. */}
      <form onSubmit={submit} noValidate>
        <label htmlFor={`${id}-email`} className="visually-hidden">
          Your email
        </label>
        <input
          ref={emailError ? focusRef : undefined}
          id={`${id}-email`}
          type="email"
          value={email}
          onChange={(event) => onEmail(event.target.value)}
          maxLength={320}
          autoComplete="email"
          placeholder="Your work email"
          aria-describedby={emailError ? `${id}-error ${id}-hint` : `${id}-hint`}
          aria-invalid={emailError || undefined}
          className={styles.emailInput_card}
        />
        <p id={`${id}-hint`} className={styles.hint_card}>Using your work email helps us tailor the results to your company.</p>
        <div className={styles.prompt_card}>
          <input
            value={prompt}
            onChange={(event) => onPrompt(event.target.value)}
            maxLength={300}
            aria-label="Describe the companies you are looking for"
            {...promptField}
            placeholder="Describe the companies you're looking for"
            className={styles.promptInput_card}
          />
          <button type="submit" disabled={busy} className={styles.promptButton_card}>
            {label}
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
      <p className={styles.privacy_card}>
        Your email is saved with your request. Your matches appear on this page.{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
          Privacy policy
        </a>
      </p>
    </>
  );
}
