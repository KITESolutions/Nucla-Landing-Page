import styles from "./Engine.module.css";

/** Illustrative product moments, one per engine step. Every company here is made up. */

const delay = (start: number, index: number, each = 0.08) => ({ animationDelay: `${(start + each * index).toFixed(2)}s` });

const DISCOVERED = [
  { name: "Tessel Robotics", score: 91 },
  { name: "Ardent Motion", score: 88 },
  { name: "Kinfold", score: 84 },
  { name: "Lumen Arms", score: 79 },
];

export function DiscoverVisual() {
  return (
    <div className={`${styles.visual} ${styles.discover}`}>
      <div className={styles.search}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <span className={styles.query}>
          Robotics companies that complement our portfolio
          <span className={styles.caret} aria-hidden="true" />
        </span>
      </div>
      <div className={styles.found}>
        {DISCOVERED.map((row, index) => (
          <div key={row.name} className={`${styles.enter} ${styles.foundRow}`} style={delay(0.1, index)}>
            <span className={styles.company}>{row.name}</span>
            <div className={styles.meter}>
              <div className={styles.fill} style={{ width: `${row.score}%`, ...delay(0.1, index) }} />
            </div>
            <span className={styles.foundScore}>{row.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SOURCES = ["Affinity", "CRM", "Email", "Applications", "Event lists", "Spreadsheets"];
const QUEUE = [
  { name: "Hallex Energy", note: "2 records merged · fits 5 of 6 criteria", route: "Partner" },
  { name: "Brightpour", note: "Strong team · revenue unverified", route: "Review" },
  { name: "Quilla AI", note: "Consumer focus · outside thesis", route: "Decline" },
] as const;

export function AssessVisual() {
  return (
    <div className={`${styles.visual} ${styles.assess}`}>
      <div className={styles.sources}>
        {SOURCES.map((source, index) => (
          <span key={source} className={`${styles.enter} ${styles.source}`} style={delay(0, index, 0.04)}>
            {source}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 600 44" preserveAspectRatio="none" aria-hidden="true" className={styles.funnel}>
        {[50, 150, 250, 350, 450, 550].map((x) => (
          <path key={x} d={`M${x} 0 C${x} 30 300 14 300 44`} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className={styles.queue}>
        {QUEUE.map((item, index) => (
          <div key={item.name} className={`${styles.enter} ${styles.queueRow}`} style={delay(0.34, index)}>
            <div className={styles.queueText}>
              <span className={styles.company}>{item.name}</span>
              <span className={styles.note}>{item.note}</span>
            </div>
            <span className={`${styles.route} ${styles[`route${item.route}`]}`}>{item.route}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CRITERIA = [
  { name: "Thesis fit", weight: "30%", score: 92 },
  { name: "Team & traction", weight: "25%", score: 81 },
  { name: "Strategic complement", weight: "20%", score: 88 },
  { name: "Technology readiness", weight: "15%", score: 74 },
  { name: "Partnership risk", weight: "10%", score: 70 },
];

export function RankVisual() {
  return (
    <div className={`${styles.visual} ${styles.rank}`}>
      <div className={styles.dial}>
        <div className={styles.ring}>
          <svg width="132" height="132" viewBox="0 0 168 168" aria-hidden="true">
            <circle cx="84" cy="84" r="66" className={styles.ringTrack} />
            <circle cx="84" cy="84" r="66" transform="rotate(-90 84 84)" className={styles.ringFill} />
          </svg>
          <div className={styles.ringLabel}>
            <span className={styles.ringScore}>84</span>
            <span className={styles.ringCompany}>Hallex Energy</span>
          </div>
        </div>
        <span className={styles.confidence}>Confidence · high</span>
      </div>
      <div className={styles.criteria}>
        {CRITERIA.map((criterion, index) => (
          <div key={criterion.name} className={`${styles.enter} ${styles.criterion}`} style={delay(0.1, index)}>
            <div className={styles.criterionHead}>
              <span className={styles.criterionName}>{criterion.name}</span>
              <span className={styles.weight}>
                w {criterion.weight} · <span className={styles.criterionScore}>{criterion.score}</span>
              </span>
            </div>
            <div className={`${styles.meter} ${styles.thin}`}>
              <div className={styles.fill} style={{ width: `${criterion.score}%`, ...delay(0.1, index) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EVIDENCE = [
  { tag: "Verified", text: "Raised €18M Series A, March 2026" },
  { tag: "Verified", text: "Engineering headcount up 40% in 6 months" },
  { tag: "Inferred", text: "Likely seeking a manufacturing partner" },
] as const;

export function ReportVisual() {
  return (
    <div className={`${styles.visual} ${styles.report}`}>
      <div className={styles.memoHead}>
        <span className={styles.memoCompany}>Hallex Energy</span>
        <span className={styles.memoLabel}>IC memo</span>
      </div>
      <div className={`${styles.enter} ${styles.verdict}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className={styles.verdictIcon}>
          <path d="M5 12l5 5 9-10" />
        </svg>
        <span className={styles.verdictText}>Advance to partner meeting</span>
      </div>
      <div>
        {EVIDENCE.map((item, index) => (
          <div key={item.text} className={`${styles.enter} ${styles.evidence}`} style={delay(0.18, index)}>
            <span className={`${styles.evidenceTag} ${styles[`evidence${item.tag}`]}`}>{item.tag}</span>
            <span className={styles.evidenceText}>{item.text}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={styles.sourceIcon}>
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
