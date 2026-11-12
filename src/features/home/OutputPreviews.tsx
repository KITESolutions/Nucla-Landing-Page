import type { ReactNode } from "react";

import { Tag } from "@/components/ui/Tag";

import styles from "./FourOutputs.module.css";

/** Illustrative product previews, one per tab. Every company here is made up. */

function PreviewHead({ children }: { children: ReactNode }) {
  return (
    <div className={styles.previewHead}>
      <span className={styles.previewLabel}>{children}</span>
      <Tag tone="mono">Illustrative</Tag>
    </div>
  );
}

const DISCOVERED = [
  { name: "Tessel Robotics", meta: "Munich · Series B · Warehouse picking", score: 91 },
  { name: "Ardent Motion", meta: "Boston · Series A · Cobots for packaging", score: 88 },
  { name: "Kinfold", meta: "Osaka · Series A · Food-safe grippers", score: 84 },
  { name: "Lumen Arms", meta: "Toronto · Seed · Inspection robotics", score: 79 },
];

export function DiscoverPreview() {
  return (
    <>
      <PreviewHead>Discover</PreviewHead>
      <div className={styles.query}>Robotics companies that complement our portfolio</div>
      <div className={styles.subLabel}>4 of 186 · sorted by fit</div>
      {DISCOVERED.map((row) => (
        <div key={row.name} className={styles.row}>
          <div className={styles.grow}>
            <div className={styles.company}>{row.name}</div>
            <div className={styles.meta}>{row.meta}</div>
          </div>
          <span className={styles.score}>{row.score}</span>
        </div>
      ))}
    </>
  );
}

const SOURCES = ["Affinity", "CRM", "Email", "Applications", "Event lists", "Spreadsheets"];
const PIPELINE = ["Dedupe", "Enrich", "Score", "Route"];
const QUEUE = [
  { name: "Hallex Energy", source: "Affinity + email", route: "Partner", note: "Merged 2 records. Matches 5 of 6 criteria." },
  { name: "Brightpour", source: "Application", route: "Review", note: "Strong team. Revenue not yet verified." },
  { name: "Quilla AI", source: "Event list", route: "Decline", note: "Consumer focus. Outside your thesis." },
] as const;

export function AssessPreview() {
  return (
    <>
      <PreviewHead>Assess · one queue</PreviewHead>
      <div className={styles.sources}>
        {SOURCES.map((source) => (
          <span key={source} className={styles.source}>
            {source}
          </span>
        ))}
      </div>
      <div className={styles.pipeline}>
        {PIPELINE.map((step, index) => (
          <span key={step}>
            {index > 0 && <span className={styles.pipelineArrow}>→ </span>}
            {step}
          </span>
        ))}
      </div>
      {QUEUE.map((item) => (
        <div key={item.name} className={styles.queueRow}>
          <div className={styles.queueHead}>
            <div className={styles.grow}>
              <span className={styles.company}>{item.name}</span>{" "}
              <span className={styles.queueSource}>· {item.source}</span>
            </div>
            <span className={`${styles.route} ${styles[`route${item.route}`]}`}>{item.route}</span>
          </div>
          <div className={styles.note}>{item.note}</div>
        </div>
      ))}
      <div className={styles.known}>
        Who already knows them: 2 colleagues in Procurement · <span className={styles.knownTag}>With your systems connected</span>
      </div>
    </>
  );
}

const CRITERIA = [
  { name: "Thesis fit", weight: "30%", score: 92 },
  { name: "Team & traction", weight: "25%", score: 81 },
  { name: "Strategic complement", weight: "20%", score: 88 },
  { name: "Technology readiness", weight: "15%", score: 74 },
  { name: "Partnership risk", weight: "10%", score: 70 },
];

export function RankPreview() {
  return (
    <>
      <PreviewHead>Rank · score breakdown</PreviewHead>
      <div className={styles.rankHead}>
        <div>
          <div className={styles.rankCompany}>Hallex Energy</div>
          <div className={styles.meta}>Copenhagen · Series A · Grid storage</div>
        </div>
        <div className={styles.rankScore}>
          <div className={styles.bigScore}>84</div>
          <div className={styles.confidence}>Confidence · high</div>
        </div>
      </div>
      {CRITERIA.map((criterion) => (
        <div key={criterion.name} className={styles.criterion}>
          <div className={styles.criterionHead}>
            <span className={styles.criterionName}>{criterion.name}</span>
            <span className={styles.weight}>
              w {criterion.weight} · <span className={styles.criterionScore}>{criterion.score}</span>
            </span>
          </div>
          <div className={styles.meter}>
            <div className={styles.meterFill} style={{ width: `${criterion.score}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}

const EVIDENCE = [
  { tag: "Verified", text: "Raised €18M Series A in March 2026." },
  { tag: "Verified", text: "Engineering headcount up 40% in six months." },
  { tag: "Inferred", text: "Likely seeking a manufacturing partner in 2027." },
] as const;

export function ReportPreview() {
  return (
    <>
      <PreviewHead>IC memo · draft</PreviewHead>
      <div className={styles.memoCompany}>Hallex Energy</div>
      <div className={styles.verdict}>
        <div className={styles.verdictLabel}>Verdict</div>
        <div className={styles.verdictText}>
          Advance to partner meeting. Strong thesis fit, pilot-ready within two quarters.
        </div>
      </div>
      <div className={styles.subLabel}>Evidence</div>
      {EVIDENCE.map((item) => (
        <div key={item.text} className={styles.evidence}>
          <span className={`${styles.evidenceTag} ${styles[`evidence${item.tag}`]}`}>{item.tag}</span>
          <span className={styles.evidenceText}>{item.text}</span>
        </div>
      ))}
      <div className={styles.memoKnown}>
        Who already knows them: R. Okafor, Supply Chain ·{" "}
        <span className={styles.knownTagGreen}>With your systems connected</span>
      </div>
    </>
  );
}
