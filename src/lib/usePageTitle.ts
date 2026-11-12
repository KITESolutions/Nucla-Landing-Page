import { useEffect } from "react";

const SITE_TITLE = "Nucla · The intelligence layer for corporate venture";

/** Sets the tab title, e.g. "How it works · Nucla". The home page passes nothing and gets the site title. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Nucla` : SITE_TITLE;
  }, [title]);
}
