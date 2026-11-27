import { CtaBand } from "@/components/sections/CtaBand";
import { contactFormId } from "@/lib/routes";

import { ContactForm } from "./ContactForm";
import styles from "./DemoSection.module.css";

export function DemoSection() {
  return (
    <CtaBand title="See it on your own" accent="deal flow.">
      <div id={contactFormId} className={styles.card} role="region" aria-label="Contact form" tabIndex={-1}>
        <p className={styles.lede}>Leave your name and work email and we’ll be in touch.</p>
        <ContactForm />
      </div>
    </CtaBand>
  );
}
