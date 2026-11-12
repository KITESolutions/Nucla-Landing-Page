import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import { LegacyLinks } from "./LegacyLinks";
import { ScrollManager } from "./ScrollManager";

export function Layout() {
  return (
    <div className={styles.page}>
      <LegacyLinks />
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
