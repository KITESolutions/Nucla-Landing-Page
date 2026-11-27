import { Navigate, useLocation } from "react-router-dom";

import { contactFormId, routes } from "@/lib/routes";

/** Keep links to the previous demo anchors working. */
export function LegacyLinks() {
  const { pathname, search, hash } = useLocation();
  if (pathname === routes.home && (hash === "#book" || hash === "#demo")) {
    return <Navigate to={{ pathname: routes.home, search, hash: `#${contactFormId}` }} replace />;
  }
  return null;
}
