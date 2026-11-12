import { Navigate, useLocation } from "react-router-dom";

import { contactForm, routes } from "@/lib/routes";

/** The previous site's demo links (nucla.com/#book) still circulate; they open the contact form. */
export function LegacyLinks() {
  const { pathname, hash } = useLocation();
  if (pathname === routes.home && hash === "#book") return <Navigate to={contactForm} replace />;
  return null;
}
