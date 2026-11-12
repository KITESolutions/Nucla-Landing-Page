import { Link } from "react-router-dom";

import { linkedIn, routes, salesEmail } from "@/lib/routes";

import styles from "./Footer.module.css";

const LINKS = [
  { to: `${routes.home}#platform`, label: "Platform" },
  { to: routes.howItWorks, label: "How it works" },
  { to: routes.roiCalculator, label: "ROI calculator" },
  { to: routes.contact, label: "Contact us" },
];

export function Footer() {
  return (
    <footer>
      <div className={styles.columns}>
        <div>
          <img src="/assets/nucla-logo.png" alt="Nucla" className={styles.logo} />
          <p className={styles.tagline}>The intelligence layer for corporate venture and innovation teams.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.contact}>
          <span>4845 Pearl East Circle, Boulder, CO</span>
          <a href={`mailto:${salesEmail}`}>{salesEmail}</a>
          <a href={linkedIn} target="_blank" rel="noopener noreferrer" className={styles.linkedIn}>
            LinkedIn <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <div className={styles.legal}>© {new Date().getFullYear()} Nucla Inc.</div>
    </footer>
  );
}
