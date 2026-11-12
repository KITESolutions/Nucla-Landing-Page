/// <reference types="node" />
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// CSS module class names are plain strings to TypeScript: a typo renders unstyled instead of failing.
const components = Object.keys(import.meta.glob("/src/**/*.tsx")).filter((path) => !path.includes(".test."));

describe("CSS module class names", () => {
  for (const path of components) {
    const source = readFileSync(join(process.cwd(), path), "utf8");
    const module = source.match(/import styles from "(\.\/[^"]+\.module\.css)"/)?.[1];
    if (!module) continue;

    it(`${path} only uses classes its stylesheet defines`, () => {
      const css = readFileSync(join(process.cwd(), dirname(path), module), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      const defined = new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]));
      for (const [, name] of source.matchAll(/styles\.(\w+)/g)) expect(defined, `.${name}`).toContain(name);
      // styles[`chip_${variant}`]: at least one class must carry the prefix.
      for (const [, prefix] of source.matchAll(/styles\[`([\w-]+)\$\{/g)) {
        expect([...defined].some((name) => name.startsWith(prefix)), `.${prefix}*`).toBe(true);
      }
    });
  }
});
