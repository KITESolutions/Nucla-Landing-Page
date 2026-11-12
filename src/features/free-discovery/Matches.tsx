import { Link } from "react-router-dom";

import { contactForm } from "@/lib/routes";

import styles from "./FreeDiscovery.module.css";
import type { Match } from "./types";

interface Props {
  matches: Match[];
  prompt: string;
  strategy: string;
  company: string | null;
  remaining: number;
  /** The heading takes focus when the matches replace the search. */
  headingRef: (node: HTMLElement | null) => void;
  onAgain: () => void;
  onBook: () => void;
}

/** The short demo: the top matches, scored, with the way into Nucla. */
export function Matches({ matches, prompt, strategy, company, remaining, headingRef, onAgain, onBook }: Props) {
  return (
    <div className={styles.results}>
      <div className={styles.resultsLabel}>
        Top {matches.length} {matches.length === 1 ? "match" : "matches"}
      </div>
      <h3 ref={headingRef} tabIndex={-1} className={styles.resultsTitle}>
        “{prompt}”
      </h3>
      <p className={styles.resultsFor}>
        Scored for {strategy}
        {company && (
          <>
            , tailored to <span className={styles.strong}>{company}</span>
          </>
        )}
        .
      </p>
      <ol className={styles.matchList}>
        {matches.map((match, index) => (
          <li key={`${match.name}-${index}`} className={styles.match}>
            <div className={styles.matchHead}>
              {match.url ? (
                <a href={match.url} target="_blank" rel="noopener noreferrer" className={styles.matchName}>
                  {match.name}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className={styles.matchName}>{match.name}</span>
              )}
              <span className={styles.matchScore}>{match.score}</span>
            </div>
            {match.meta && <div className={styles.matchMeta}>{match.meta}</div>}
            {match.reason && <p className={styles.matchReason}>{match.reason}</p>}
          </li>
        ))}
      </ol>
      <p className={styles.resultsNote}>
        This is a short demo on public data. Nucla ranks every company against your own criteria and what your team
        already knows.
      </p>
      <div className={styles.resultsActions}>
        <Link to={contactForm} className={styles.demoButton} onClick={onBook}>
          Book a demo →
        </Link>
        {remaining > 0 ? (
          <button type="button" className={styles.again} onClick={onAgain}>
            Run another discovery
          </button>
        ) : (
          <span className={styles.resultsNote}>You've used your free discoveries.</span>
        )}
      </div>
    </div>
  );
}
