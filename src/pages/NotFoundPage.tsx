import { Link } from "react-router-dom";

import { PageHero } from "@/components/sections/PageHero";
import { routes } from "@/lib/routes";
import { usePageTitle } from "@/lib/usePageTitle";

import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <PageHero eyebrow="404" title="This page" accent="isn't here.">
      <Link to={routes.home} className={styles.home}>
        Go to the home page
      </Link>
    </PageHero>
  );
}
