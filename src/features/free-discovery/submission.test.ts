import { beforeEach, describe, expect, it } from "vitest";
import { clearSubmission, submissionFor } from "./submission";

describe("browser submission identity", () => {
  beforeEach(() => clearSubmission());
  it("reuses an ambiguous network retry, including normalized form values", () => {
    const first = submissionFor("fintech  Canada", "acquisition_generic", "Ana@Example.com");
    expect(submissionFor(" fintech Canada ", "acquisition_generic", "ana@example.com")).toBe(first);
  });
  it("changes identity for a changed payload or an explicit second discovery", () => {
    const first = submissionFor("fintech Canada", "acquisition_generic", "ana@example.com");
    expect(submissionFor("robotics Canada", "acquisition_generic", "ana@example.com")).not.toBe(first);
    const second = submissionFor("fintech Canada", "acquisition_generic", "ana@example.com");
    clearSubmission();
    expect(submissionFor("fintech Canada", "acquisition_generic", "ana@example.com")).not.toBe(second);
  });
});
