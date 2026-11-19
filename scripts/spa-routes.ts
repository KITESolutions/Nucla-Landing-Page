/**
 * GitHub Pages serves files, not routes. After the build, give every page its own copy of
 * index.html (served without the extension, so /how-it-works loads directly) and a 404.html
 * so an unknown path still opens the site on its not-found page.
 */
import { copyFile } from "node:fs/promises";

import { routes } from "../src/lib/routes.ts";

const dist = new URL("../dist/", import.meta.url);
const index = new URL("index.html", dist);

for (const path of Object.values(routes)) {
  if (path === routes.home) continue;
  await copyFile(index, new URL(`${path.slice(1)}.html`, dist));
}
await copyFile(index, new URL("404.html", dist));
