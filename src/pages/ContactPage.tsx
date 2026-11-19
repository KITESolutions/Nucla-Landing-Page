import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/features/contact/ContactForm";
import { linkedIn, salesEmail } from "@/lib/routes";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./ContactPage.module.css";

export function ContactPage() {
  usePageTitle("Contact us");
  return (
    <PageHero
      title="Let's talk about"
      accent="your deal flow."
      lede="Leave your name and work email and we'll be in touch."
      ledeWidth={560}
      ledeGap={24}
    >
      <div id="contact-form" className={styles.card} role="region" aria-label="Contact form">
        <ContactForm />
      </div>
      <p className={styles.alt}>
        Or email <a href={`mailto:${salesEmail}`}>{salesEmail}</a> ·{" "}
        <a href={linkedIn} target="_blank" rel="noopener noreferrer">
          LinkedIn <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>
    </PageHero>
  );
}
