import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";
import { routes } from "@/lib/routes";
import { ContactPage } from "@/pages/ContactPage";
import { HomePage } from "@/pages/HomePage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoiCalculatorPage } from "@/pages/RoiCalculatorPage";

/** Pages also answer at <page>.html: the redesign's own links use that form. */
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

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.howItWorks} element={<HowItWorksPage />} />
        <Route path={routes.roiCalculator} element={<RoiCalculatorPage />} />
        <Route path={routes.contact} element={<ContactPage />} />
        {HTML_PATHS.map(([path, to]) => (
          <Route key={path} path={path} element={<WithoutHtml to={to} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
