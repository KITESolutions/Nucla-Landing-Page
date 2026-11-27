/// <reference types="node" />
import { readFileSync } from "node:fs";
import { join } from "node:path";

// CSS Modules rename keyframes per file, so an animation only runs if its own module defines the keyframes.
const paths = Object.keys(import.meta.glob("/src/**/*.module.css"));
const KEYWORDS = new Set(["none", "inherit", "initial", "unset"]);

describe("CSS module animations", () => {
  it("finds the modules", () => {
    expect(paths.length).toBeGreaterThan(20);
  });

  for (const path of paths) {
    it(`${path} defines every keyframes it animates`, () => {
      // Vitest runs from the project root; glob keys start at it.
      const css = readFileSync(join(process.cwd(), path), "utf8");
      const used = [...css.matchAll(/animation(?:-name)?:\s*([a-zA-Z][\w-]*)/g)]
        .map((match) => match[1])
        .filter((name) => !KEYWORDS.has(name));
      const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]));
      for (const name of used) expect(defined, `@keyframes ${name}`).toContain(name);
    });
  }
});
