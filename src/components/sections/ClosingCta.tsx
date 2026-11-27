import { Link } from "react-router-dom";

import { contactForm, salesEmail } from "@/lib/routes";

import styles from "./ClosingCta.module.css";
import { CtaBand } from "./CtaBand";

/** "See it on your own deal flow": the band that closes most pages. */
export function ClosingCta() {
  return (
    <CtaBand id="demo" title="See it on your own" accent="deal flow.">
      <div className={styles.actions}>
        <Link to={contactForm} className={styles.demo}>
          Book a demo
        </Link>
        <a href={`mailto:${salesEmail}`} className={styles.email}>
          {salesEmail}
        </a>
      </div>
    </CtaBand>
  );
}
