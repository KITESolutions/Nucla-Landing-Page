import { useId } from "react";
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

const fundingFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** The short demo: the top matches, scored, with the way into Nucla. */
export function Matches({ matches, prompt, strategy, company, remaining, headingRef, onAgain, onBook }: Props) {
  const resultId = useId();

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
        {matches.map((match, index) => {
          const details = match.company_details;
          const facts = [
            details?.sector && { label: "Sector", value: details.sector },
            details?.founded_year && { label: "Founded", value: details.founded_year },
            details?.total_funding_usd != null && {
              label: "Total funding",
              value: fundingFormat.format(details.total_funding_usd) + " USD",
            },
          ];

          const nameId = `${resultId}-${index}`;
          const card = (
            <>
              <div className={styles.matchHead}>
                <span id={nameId} className={styles.matchName}>
                  {match.name}
                  {match.url && <span className="visually-hidden"> (opens in a new tab)</span>}
                </span>
                <span className={styles.matchScore}><span className="visually-hidden">Fit score </span>{match.score}</span>
              </div>
              {match.meta && (
                <div className={styles.matchMeta}>
                  {match.meta.split(" · ").map((fact, factIndex) => (
                    <span key={`${fact}-${factIndex}`} className={styles.matchFact}>{fact}</span>
                  ))}
                </div>
              )}
              {details?.description && details.description !== match.reason && (
                <p className={styles.matchDescription}>{details.description}</p>
              )}
              {match.reason && (
                <p className={styles.matchReason}>
                  <strong>Why it matches</strong>
                  <span>{match.reason}</span>
                </p>
              )}
              {facts.some(Boolean) && (
                <dl className={styles.matchEvidence}>
                  {facts.map((fact) => fact && (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </>
          );

          return (
            <li key={`${match.name}-${index}`}>
              {match.url ? (
                <a
                  href={match.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-labelledby={nameId}
                  className={styles.match}
                >
                  {card}
                </a>
              ) : (
                <div className={styles.match}>{card}</div>
              )}
            </li>
          );
        })}
      </ol>
      <div className={styles.resultsNext}>
        <h4>See these companies through your own criteria</h4>
        <p className={styles.resultsNote}>In a demo, see how Nucla would score these matches against your strategy and data.</p>
        <div className={styles.resultsActions}>
          <Link to={contactForm} className={styles.demoButton} onClick={onBook}>
            Book a demo
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
    </div>
  );
}
