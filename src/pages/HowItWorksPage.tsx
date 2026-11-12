import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./HowItWorksPage.module.css";

const SOURCES = [
  { title: "Public data", text: "Funding, hiring, news and product signals" },
  { title: "Your internal data", text: "CRM, Teams, Drive and email, when you are ready" },
];

const ENGINE = ["Entity resolution", "Relationship graph", "Consistent scoring"];

const OUTPUTS = [
  { n: "01", title: "Discover", text: "Companies that fit, beyond the ones you track", tone: "lilac" },
  { n: "02", title: "Assess", text: "A proper first pass on every inbound", tone: "mint" },
  { n: "03", title: "Rank", text: "On your team's own weighted criteria", tone: "lilac" },
  { n: "04", title: "Report", text: "IC-ready memos, every claim cited", tone: "mint" },
] as const;

const STEPS = [
  { n: "01", tag: "About 10 minutes", title: "Set your thesis", text: "Describe what you look for and how you weigh it. Plain English works." },
  {
    n: "02",
    tag: "Optional · read-only",
    title: "Connect your systems",
    text: "Optional, whenever you are ready. Link your CRM, email and procurement tools. Nucla reads. It never writes.",
  },
  { n: "03", tag: "", title: "Discover and assess", text: "Search the market and clear your inbound in one ranked queue." },
  { n: "04", tag: "", title: "Decide and share", text: "Send IC-ready reports with every source attached." },
];

const QUESTIONS = [
  { q: "Has anyone spoken to this company?", a: "Yes. R. Okafor in Supply Chain met their CEO in March." },
  { q: "Did we pass on them before?", a: "Yes, 12 months ago. Too early for a pilot at the time." },
  { q: "Do we already work with them?", a: "Active vendor in SAP Ariba since 2025." },
];

const YOUR_SYSTEMS = [
  "Salesforce",
  "HubSpot",
  "Affinity",
  "Attio",
  "Microsoft Teams & email",
  "Google Workspace",
  "Slack",
  "SAP",
  "SAP Ariba",
  "Coupa",
  "Typeform",
  "Airtable",
  "Excel & CSV",
];

const MARKET_DATA = ["PitchBook", "Crunchbase", "Crustdata", "Owler", "LinkedIn", "Meltwater"];

const TRUST = [
  { title: "One resolved record", text: "Market data and your internal history merge into a single profile per company." },
  { title: "Traceable answers", text: "Every claim links to its source and is marked verified or inferred." },
  { title: "Auditable access", text: "Read-only and permission-aware. Every query is logged." },
  { title: "Built for IT review", text: "SOC 2 Type II, SSO and no cross-client training." },
];

export function HowItWorksPage() {
  usePageTitle("How it works");
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Other AI tools know the market."
        accent="Nucla knows your relationship context."
        layout="stacked"
        size="compact"
        lede="Nucla finds companies that fit your thesis and gives every inbound a proper first pass. Each one is ranked against your own criteria, with what your organization already knows about it attached."
        ledeWidth={760}
      />

      <section className={styles.what}>
        <div className={styles.whiteCard}>
          <Eyebrow>What is Nucla</Eyebrow>
          <SectionTitle accent="One place." className={styles.whatTitle}>
            Market data and internal knowledge.
          </SectionTitle>
          <p className={styles.lede}>
            Nucla brings public signals and what your organization already knows into one record per company, so every
            discovery and every inbound is judged with the full picture.
          </p>

          <div className={styles.flow}>
            <div className={styles.sources}>
              <Eyebrow tone="muted">Sources</Eyebrow>
              {SOURCES.map((source) => (
                <div key={source.title} className={styles.sourceCard}>
                  <div className={styles.sourceTitle}>{source.title}</div>
                  <div className={styles.sourceText}>{source.text}</div>
                </div>
              ))}
            </div>
            <div className={styles.arrow} aria-hidden="true" />
            <div className={styles.engine}>
              <div className={styles.engineTitle}>Nucla AI engine</div>
              <ul className={styles.engineList}>
                {ENGINE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.arrow} aria-hidden="true" />
            <div className={styles.outputs}>
              {OUTPUTS.map((output) => (
                <div key={output.n} className={`${styles.output} ${styles[output.tone]}`}>
                  <div className={styles.outputNumber}>{output.n}</div>
                  <div className={styles.outputTitle}>{output.title}</div>
                  <div className={styles.sourceText}>{output.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.fourSteps}>
        <SectionTitle accent="Live the same day.">Four steps.</SectionTitle>
        <ol className={styles.stepGrid}>
          {STEPS.map((step) => (
            <li key={step.n} className={styles.stepCard}>
              <div className={styles.stepMeta}>
                <span>{step.n}</span>
                <span className={styles.stepTag}>{step.tag}</span>
              </div>
              <div className={styles.stepTitle}>{step.title}</div>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.integrations}>
        <div className={styles.integrationsInner}>
          <div className={styles.split}>
            <div>
              <SectionTitle accent="already run." balance>
                Works with what you
              </SectionTitle>
              <p className={styles.integrationsText}>
                Nucla connects read-only to your CRM, email and collaboration tools and pulls in the relationship context
                behind every company. Before anyone takes a meeting, you can see whether someone has already spoken to
                them, who owns the relationship, and whether you passed on them 12 months ago.
              </p>
            </div>
            <div className={styles.example}>
              <div className={styles.exampleHead}>
                <div>
                  <div className={styles.exampleCompany}>Hallex Energy</div>
                  <div className={styles.exampleMeta}>Copenhagen · Series A · Grid storage</div>
                </div>
                <Tag tone="mono">Illustrative</Tag>
              </div>
              {QUESTIONS.map((item) => (
                <div key={item.q} className={styles.qa}>
                  <div className={styles.question}>“{item.q}”</div>
                  <div className={styles.answer}>
                    <Tag tone="success">Nucla</Tag>
                    <span>{item.a}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sourceLists}>
            <div className={styles.sourceList}>
              <Eyebrow tone="success" className={styles.listLabel}>
                Your systems · read-only
              </Eyebrow>
              <div className={styles.tags}>
                {YOUR_SYSTEMS.map((name) => (
                  <Tag key={name}>{name}</Tag>
                ))}
              </div>
            </div>
            <div className={styles.sourceList}>
              <Eyebrow className={styles.listLabel}>Market data</Eyebrow>
              <div className={styles.tags}>
                {MARKET_DATA.map((name) => (
                  <Tag key={name}>{name}</Tag>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.mcp}>
            <Eyebrow tone="mint" className={styles.mcpLabel}>
              Plus MCP access
            </Eyebrow>
            <span className={styles.mcpText}>Query Nucla from Claude, ChatGPT and Copilot.</span>
          </div>
        </div>
      </section>

      <section className={styles.trust}>
        <SectionTitle accent="for enterprise AI." stacked balance className={styles.trustTitle}>
          A security partner
        </SectionTitle>
        <p className={styles.trustText}>
          Nucla already runs inside global enterprises like Mars, Wesco and PMI. We work alongside your IT and AI teams
          through security and architecture review, and stay with you after go-live.
        </p>
        <div className={styles.trustGrid}>
          {TRUST.map((item) => (
            <div key={item.title} className={styles.trustCard}>
              <div className={styles.trustCardTitle}>{item.title}</div>
              <p className={styles.trustCardText}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
