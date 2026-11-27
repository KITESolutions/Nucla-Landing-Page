import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { contactFormId, discoveryPromptId, discoverySectionId, routes } from "@/lib/routes";

/** A new page starts at the top; a link with a #hash scrolls to that section. */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = pathname === routes.home && hash === "#discover" ? discoverySectionId : decodeURIComponent(hash.slice(1));
      const section = document.getElementById(id);
      if (id === contactFormId) section?.focus({ preventScroll: true });
      if (id === discoverySectionId) {
        document.getElementById(discoveryPromptId)?.focus({ preventScroll: true });
      }
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      section?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
      return;
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash, key]);

  return null;
}
