import { Link, NavLink } from "react-router-dom";

import { appSignIn, contactForm, routes } from "@/lib/routes";

import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link to={routes.home} className={styles.brand}>
          <img src={`${import.meta.env.BASE_URL}assets/nucla-logo.png`} alt="Nucla" className={styles.logo} />
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <NavLink
            to={routes.howItWorks}
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
          >
            How it works
          </NavLink>
          <Link to={contactForm} className={styles.navLink}>
            Contact us
          </Link>
        </nav>
        <div className={styles.actions}>
          <a href={appSignIn} className={styles.signIn}>
            Sign in
          </a>
          <Link to={contactForm} className={styles.demo}>
            Book a demo
          </Link>
        </div>
      </div>
    </header>
  );
}
