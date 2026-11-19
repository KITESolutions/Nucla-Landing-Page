import { Link, NavLink } from "react-router-dom";

import { appSignIn, contactForm, routes } from "@/lib/routes";

import styles from "./Header.module.css";

const NAV = [
  { to: routes.howItWorks, label: "How it works" },
  { to: routes.contact, label: "Contact us" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link to={routes.home} className={styles.brand}>
          <img src="/assets/nucla-logo.png" alt="Nucla" className={styles.logo} />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <a href={appSignIn} className={styles.signIn}>
            Sign in
          </a>
          <Link to={contactForm} className={styles.demo}>
            Book a demo <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
