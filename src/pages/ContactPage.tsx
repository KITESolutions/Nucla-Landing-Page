import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HubSpotForm } from "@/features/contact/HubSpotForm";
import { linkedIn, salesEmail } from "@/lib/routes";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./ContactPage.module.css";

const NEXT_STEPS = [
  { n: "01", title: "We read your note", text: "A real person on our team reviews every message." },
  { n: "02", title: "We set up a call", text: "Thirty minutes on your thesis, your inbound and where Nucla fits." },
  {
    n: "03",
    title: "You see it on your own deal flow",
    text: "A live demo or a trial on public data. No integrations needed to start.",
  },
];

export function ContactPage() {
  usePageTitle("Contact us");
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Let's talk about"
        accent="your deal flow."
        lede="Book a demo, ask about pricing or talk to us about a partnership. Tell us a little about your team and we'll take it from there."
        ledeWidth={640}
      />

      <section id="contact-form" className={styles.section} aria-label="Contact form">
        <div className={styles.grid}>
          <div className={styles.formCard}>
            <Eyebrow>Send us a message</Eyebrow>
            <HubSpotForm />
            <p className={styles.alt}>
              Prefer email? Write to <a href={`mailto:${salesEmail}`}>{salesEmail}</a>.
            </p>
          </div>

          <div className={styles.infoCard}>
            <div>
              <Eyebrow tone="mint">What happens next</Eyebrow>
              <ol className={styles.steps}>
                {NEXT_STEPS.map((step) => (
                  <li key={step.n} className={styles.step}>
                    <span className={styles.stepNumber}>{step.n}</span>
                    <div>
                      <div className={styles.stepTitle}>{step.title}</div>
                      <div className={styles.stepText}>{step.text}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.details}>
              <div className={styles.detail}>
                <div className={styles.detailLabel}>Email</div>
                <a href={`mailto:${salesEmail}`} className={styles.detailLink}>
                  {salesEmail}
                </a>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailLabel}>Mailing address</div>
                <address className={styles.address}>
                  Nucla Inc.
                  <br />
                  4845 Pearl East Circle
                  <br />
                  Boulder, CO
                </address>
              </div>
              <div className={styles.detail}>
                <div className={styles.detailLabel}>LinkedIn</div>
                <a href={linkedIn} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
                  Follow Nucla <span aria-hidden="true">↗</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
