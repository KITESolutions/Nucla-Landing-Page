// GitHub Pages has no SPA fallback, so a direct link to a client route 404s. Write each
// route's own index.html after the Vite build. Keep in step with the routes in src/App.jsx.
import { copyFileSync, mkdirSync } from "node:fs";

const ROUTES = ["try", "how-it-works", "contact"];

for (const route of ROUTES) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync("dist/index.html", `dist/${route}/index.html`);
}

// Any route missing from the list still renders the app (with a 404 status) instead of
// GitHub's error page.
copyFileSync("dist/index.html", "dist/404.html");
