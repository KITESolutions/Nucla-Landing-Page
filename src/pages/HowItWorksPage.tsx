import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { FourSteps } from "@/features/how-it-works/FourSteps";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./HowItWorksPage.module.css";

const SOURCES = [
  { title: "Public data", text: "Funding, hiring, news and product signals" },
  { title: "Your internal data", text: "CRM, Teams, Drive and email, when you are ready" },
];

const ENGINE = ["Entity resolution", "Relationship graph", "Consistent scoring"];

const OUTPUTS = [
  { title: "Discover", text: "Companies that fit, beyond the ones you track", tone: "lilac" },
  { title: "Assess", text: "A proper first pass on every inbound", tone: "mint" },
  { title: "Rank", text: "On your team's own weighted criteria", tone: "lilac" },
  { title: "Report", text: "IC-ready memos, every claim cited", tone: "mint" },
] as const;

const QUESTIONS = [
  { q: "Has anyone spoken to this company?", a: "Yes. R. Okafor in Supply Chain met their CEO in March." },
  { q: "Did we pass on them before?", a: "Yes, 12 months ago. Too early for a pilot at the time." },
  { q: "Do we already work with them?", a: "Active vendor in SAP Ariba since 2025." },
];

/** Each logo's height, matched by eye in the redesign so the marks look the same size. */
const YOUR_SYSTEMS = [
  { src: `${import.meta.env.BASE_URL}images/salesforce-logo.png`, alt: "Salesforce", height: 22 },
  { src: `${import.meta.env.BASE_URL}images/hubspot-logo.png`, alt: "HubSpot", height: 24 },
  { src: `${import.meta.env.BASE_URL}images/affinity-logo.png`, alt: "Affinity", height: 24 },
  { src: `${import.meta.env.BASE_URL}images/gmail-logo.png`, alt: "Gmail", height: 24 },
];

const MARKET_DATA = [
  { src: `${import.meta.env.BASE_URL}images/linkedin-logo.png`, alt: "LinkedIn", height: 17 },
  { src: `${import.meta.env.BASE_URL}images/crustdata-logo.png`, alt: "Crustdata", height: 17 },
  { src: `${import.meta.env.BASE_URL}images/crunchbase-logo.png`, alt: "Crunchbase", height: 14 },
  { src: `${import.meta.env.BASE_URL}images/carbonarc-logo.png`, alt: "Carbon Arc", height: 17 },
];

const CLIENTS = ["Mars", "Wesco", "PMI"];
const CONTROLS = ["SOC 2 Type II", "Single sign-on", "No cross-client training"];
const ACTIVITY = [
  { time: "09:12", text: "searched “grid storage”" },
  { time: "09:14", text: "opened Hallex Energy" },
  { time: "09:20", text: "memo shared with IC" },
];

export function HowItWorksPage() {
  usePageTitle("How it works");
  return (
    <>
      <PageHero
        title="Other AI tools know the market."
        accent="Nucla knows your relationship context."
        layout="stacked"
        size="compact"
        lede="Nucla finds companies that fit your thesis and gives every inbound a proper first pass. Each one is ranked against your own criteria, with what your organization already knows about it attached."
        ledeWidth={760}
      />

      <section className={styles.what}>
        <div className={styles.whiteCard}>
          <SectionTitle accent="One place.">Market data and internal knowledge.</SectionTitle>
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
                <div key={output.title} className={`${styles.output} ${styles[output.tone]}`}>
                  <div className={styles.outputTitle}>{output.title}</div>
                  <div className={styles.sourceText}>{output.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FourSteps />

      <section className={styles.integrations}>
        <div className={styles.integrationsInner}>
          <div className={styles.split}>
            <div>
              <SectionTitle accent="already run." balance>
                Works with what you
              </SectionTitle>
              <p className={styles.integrationsText}>
                Nucla connects to your CRM, email and collaboration tools and pulls in the relationship context behind
                every company. Before anyone takes a meeting, you can see whether someone has already spoken to them, who
                owns the relationship, and whether you passed on them 12 months ago.
              </p>
            </div>
            <div className={styles.example}>
              <div className={styles.exampleHead}>
                <div>
                  <div className={styles.exampleCompany}>Hallex Energy</div>
                  <div className={styles.exampleMeta}>Copenhagen · Series A · Grid storage</div>
                </div>
              </div>
              {QUESTIONS.map((item) => (
                <div key={item.q} className={styles.qa}>
                  <div className={styles.question}>“{item.q}”</div>
                  <div className={styles.answer}>
                    <Tag>Nucla</Tag>
                    <span>{item.a}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sourceLists}>
            <div className={styles.sourceList}>
              <h3 className={styles.listTitle}>Your systems</h3>
              <div className={styles.logos}>
                {YOUR_SYSTEMS.map((logo) => (
                  <span key={logo.alt} className={styles.logoTile}>
                    <img src={logo.src} alt={logo.alt} height={logo.height} className={styles.logo} />
                  </span>
                ))}
                <span className={styles.more}>+ more</span>
              </div>
            </div>
            <div className={styles.sourceList}>
              <h3 className={styles.listTitle}>Market data</h3>
              <div className={`${styles.logos} ${styles.tight}`}>
                {MARKET_DATA.map((logo) => (
                  <span key={logo.alt} className={`${styles.logoTile} ${styles.narrowTile}`}>
                    <img src={logo.src} alt={logo.alt} height={logo.height} className={styles.logo} />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.mcp}>
            <span className={styles.mcpText}>
              <span className={styles.mcpLead}>Plus MCP access.</span> Query Nucla from Claude, ChatGPT and Copilot.
            </span>
          </div>
        </div>
      </section>

      <section className={styles.trust}>
        <div className={styles.trustHead}>
          <SectionTitle accent="for enterprise AI." stacked className={styles.trustTitle}>
            A security partner
          </SectionTitle>
          <div className={styles.trustAside}>
            <p className={styles.trustText}>From security review to go-live and beyond, we work alongside your IT team.</p>
            <div className={styles.running}>
              <span className={styles.runningLabel}>Running inside</span>
              {CLIENTS.map((client) => (
                <span key={client} className={styles.client}>
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.trustGrid}>
          <div className={`${styles.trustCard} ${styles.trustDark}`}>
            <div className={styles.trustVisual}>
              {CONTROLS.map((control) => (
                <div key={control} className={styles.control}>
                  <span className={styles.check} aria-hidden="true">
                    ✓
                  </span>
                  {control}
                </div>
              ))}
            </div>
            <div className={styles.trustCaption}>
              <h3 className={styles.trustCardTitle}>Built for IT review</h3>
              <p className={styles.trustCardText}>Procurement-ready from the first call.</p>
            </div>
          </div>
          <div className={styles.trustCard}>
            <div className={styles.trustVisual}>
              <div className={styles.claim}>
                <span className={`${styles.claimTag} ${styles.claimVerified}`}>Verified</span>
                <div className={styles.claimText}>
                  Raised €18M Series A{" "}
                  <span className={styles.claimLink} aria-hidden="true">
                    ↗
                  </span>
                </div>
              </div>
              <div className={styles.claim}>
                <span className={`${styles.claimTag} ${styles.claimInferred}`}>Inferred</span>
                <div className={styles.claimText}>Seeking a manufacturing partner</div>
              </div>
            </div>
            <div className={styles.trustCaption}>
              <h3 className={styles.trustCardTitle}>Traceable answers</h3>
              <p className={styles.trustCardText}>Every claim sourced and labeled.</p>
            </div>
          </div>
          <div className={styles.trustCard}>
            <div className={`${styles.trustVisual} ${styles.log}`}>
              {ACTIVITY.map((entry) => (
                <div key={entry.time}>
                  <span className={styles.logTime}>{entry.time}</span>
                  {"\u00a0\u00a0"}
                  {entry.text}
                </div>
              ))}
              <div className={styles.readOnly}>
                <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Read-only
              </div>
            </div>
            <div className={styles.trustCaption}>
              <h3 className={styles.trustCardTitle}>Auditable access</h3>
              <p className={styles.trustCardText}>Permission-aware. Every query logged.</p>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
