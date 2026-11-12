import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { Spinner } from "@/components/ui/Spinner";
import { contactForm } from "@/lib/routes";

import styles from "./FreeDiscovery.module.css";
import { Matches } from "./Matches";
import { PromptForm } from "./PromptForm";
import { MESSAGES, type State } from "./state";
import { useFreeDiscovery } from "./useFreeDiscovery";

/** "hero" sits on the dark free discovery hero; "card" is the white card on the home page. */
export type Variant = "hero" | "card";

const SEEN_RATIO = 0.3;

/** The short message a screen reader hears for each step. */
function announcement(state: State) {
  if (state.step === "idle" && state.busy) return "Starting…";
  if (state.step === "searching") return "Searching…";
  if (state.step === "results") return `${state.matches.length} ${state.matches.length === 1 ? "match" : "matches"} ready`;
  if (state.step === "stopped") return state.stop?.title ?? "";
  return state.formError;
}

export function FreeDiscovery({ variant }: { variant: Variant }) {
  const { state, setPrompt, setLens, setEmail, start, restart, formSeen, bookDemo } = useFreeDiscovery();
  const strategy = state.lenses.find((option) => option.key === state.lens)?.name ?? "your strategy";

  // Each step replaces the last, so once the visitor acts, focus moves to the new step instead of falling to the
  // page: the searching title, the results heading, the stop, or the form field an error is about.
  const panel = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<HTMLElement | null>(null);
  const setFocusTarget = useCallback((node: HTMLElement | null) => {
    focusTarget.current = node;
  }, []);
  const following = useRef(false);
  const seen = useRef({ step: state.step, error: state.formError });
  useEffect(() => {
    const before = seen.current;
    seen.current = { step: state.step, error: state.formError };
    const changed = state.step !== before.step || (state.formError !== "" && state.formError !== before.error);
    const active = document.activeElement;
    const lost = !active || active === document.body || panel.current?.contains(active);
    if (!changed || !following.current || !lost) return;
    focusTarget.current?.focus();
    following.current = state.step === "searching";
  }, [state.step, state.formError]);
  // The form counts as seen once a third of it is on screen, so a home page visitor who never scrolls to it isn't.
  const showingForm = state.step === "idle";
  useEffect(() => {
    const node = panel.current;
    if (!showingForm || !node) return;
    if (typeof IntersectionObserver === "undefined") return formSeen();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.intersectionRatio >= SEEN_RATIO)) return;
        formSeen();
        observer.disconnect();
      },
      { threshold: SEEN_RATIO },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [showingForm, formSeen]);

  const follow = (action: () => void) => () => {
    following.current = true;
    action();
  };

  return (
    <div ref={panel} className={styles[`panel_${variant}`]}>
      <div role="status" className="visually-hidden">
        {announcement(state)}
      </div>

      {state.step === "idle" && (
        <PromptForm
          variant={variant}
          lenses={state.lenses}
          lens={state.lens}
          email={state.email}
          prompt={state.prompt}
          busy={state.busy}
          error={state.formError}
          focusRef={setFocusTarget}
          onLens={setLens}
          onEmail={setEmail}
          onPrompt={setPrompt}
          onSubmit={follow(start)}
        />
      )}

      {state.step === "searching" && (
        <div className={styles[`progress_${variant}`]}>
          <Spinner />
          <div className={styles.grow}>
            <div ref={setFocusTarget} tabIndex={-1} className={styles.progressTitle}>
              Searching live market data
            </div>
            {state.prompt && <div className={styles.quote}>“{state.prompt}”</div>}
            {state.notice && <div className={styles.progressStep}>{state.notice}</div>}
            {state.company && (
              <div className={styles.progressStep}>
                Tailoring the results to <span className={styles.strong}>{state.company}</span>.
              </div>
            )}
            <div className={styles.progressStep}>
              {state.unreachable
                ? MESSAGES.unreachable
                : state.slow
                  ? "This is taking longer than usual. Your matches will show here when it finishes."
                  : state.progress || "Starting your search…"}
            </div>
          </div>
        </div>
      )}

      {state.step === "results" && (
        <Matches
          matches={state.matches}
          prompt={state.prompt}
          strategy={strategy}
          company={state.company}
          remaining={state.remaining}
          headingRef={setFocusTarget}
          onAgain={follow(restart)}
          onBook={bookDemo}
        />
      )}

      {state.step === "stopped" && state.stop && (
        <div className={styles.card}>
          <div ref={setFocusTarget} tabIndex={-1} className={styles.cardTitle}>
            {state.stop.title}
          </div>
          <p className={styles.stopText}>{state.stop.text}</p>
          <Link to={contactForm} className={styles.demoButton} onClick={bookDemo}>
            Book a demo →
          </Link>
        </div>
      )}
    </div>
  );
}
