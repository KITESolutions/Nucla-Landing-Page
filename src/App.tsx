import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";
import { freeDiscoveryEnabled } from "@/lib/config";
import { routes } from "@/lib/routes";
import { ContactPage } from "@/pages/ContactPage";
import { FreeDiscoveryPage } from "@/pages/FreeDiscoveryPage";
import { HomePage } from "@/pages/HomePage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoiCalculatorPage } from "@/pages/RoiCalculatorPage";

/** Pages also answer at <page>.html: the old site's and the redesign's own links use that form. */
const HTML_PATHS: [string, string][] = [
  ["/index.html", routes.home],
  ...Object.values(routes)
    .filter((path) => path !== routes.home)
    .map((path): [string, string] => [`${path}.html`, path]),
];

function WithoutHtml({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: to, search, hash }} replace />;
}

/** Free discovery is left out of builds without its API settings, so the site can ship before it. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.howItWorks} element={<HowItWorksPage />} />
        <Route path={routes.roiCalculator} element={<RoiCalculatorPage />} />
        <Route
          path={routes.freeDiscovery}
          element={freeDiscoveryEnabled ? <FreeDiscoveryPage /> : <Navigate to={routes.home} replace />}
        />
        <Route path={routes.contact} element={<ContactPage />} />
        {HTML_PATHS.map(([path, to]) => (
          <Route key={path} path={path} element={<WithoutHtml to={to} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
