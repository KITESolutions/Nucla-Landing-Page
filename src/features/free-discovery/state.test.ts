import { MESSAGES, STOPS, initialState, reducer, type State } from "./state";
import type { Match, SearchStatus } from "./types";

const MATCH: Match = { name: "Found Co", url: "https://found.co", meta: "Toronto, Canada", score: "7.8/10", reason: "Strong fit." };
const searching: State = { ...initialState("ana@acme.com"), step: "searching", searchId: "s1", prompt: "robotics" };

const status = (overrides: Partial<SearchStatus>): SearchStatus => ({
  search_id: "s1",
  query: "robotics in Europe",
  lens: "partnership_strategic",
  company: null,
  status: "running",
  step_message: "Scoring companies against your strategy...",
  matches: [],
  remaining: 1,
  next: null,
  error: null,
  ...overrides,
});

const poll = (state: State, overrides: Partial<SearchStatus>, slow = false) =>
  reducer(state, { type: "status", status: status(overrides), slow });

describe("following a search", () => {
  it("keeps searching while it runs, with the step and the company it's tailored to", () => {
    const next = poll(searching, { company: "Acme Robotics" }, true);
    expect(next).toMatchObject({
      step: "searching",
      progress: "Scoring companies against your strategy...",
      company: "Acme Robotics",
      prompt: "robotics in Europe",
      slow: true,
    });
  });

  it("shows the matches when it finishes, keeping the search for a reload", () => {
    const next = poll(searching, { status: "completed", matches: [MATCH], remaining: 0, next: "book" });
    expect(next).toMatchObject({ step: "results", searchId: "s1", matches: [MATCH], remaining: 0, lens: "partnership_strategic" });
  });

  it("goes back to the form with the API's reason when the search found nothing usable", () => {
    const next = poll(searching, { status: "completed", next: "retry", error: "Try a broader description." });
    expect(next).toMatchObject({ step: "idle", searchId: null, formError: "Try a broader description." });
    expect(poll(searching, { status: "failed", next: "retry" }).formError).toBe(MESSAGES.noMatches);
  });

  it("starts over with a reason when the search is gone", () => {
    expect(reducer(searching, { type: "expired" })).toMatchObject({ step: "idle", searchId: null, formError: MESSAGES.searchExpired });
  });

  it("picks a saved search back up from the start", () => {
    expect(initialState("", "s9")).toMatchObject({ step: "searching", searchId: "s9", resumed: true });
  });

  it("starts over quietly when a search picked up after a reload is gone, but not once it's been heard from", () => {
    const resumed = initialState("", "s9");
    expect(reducer(resumed, { type: "expired" })).toMatchObject({ step: "idle", searchId: null, formError: "" });
    const followed = poll(resumed, {});
    expect(reducer(followed, { type: "expired" }).formError).toBe(MESSAGES.searchExpired);
  });
});

describe("the form", () => {
  it("returns to the form with the error, dropping the search", () => {
    expect(reducer(searching, { type: "formError", message: MESSAGES.tooShort })).toMatchObject({
      step: "idle",
      searchId: null,
      formError: MESSAGES.tooShort,
    });
  });

  it("clears its error when the visitor edits the email or the description", () => {
    const failed = reducer(initialState(), { type: "formError", message: MESSAGES.invalidEmail });
    expect(reducer(failed, { type: "setEmail", email: "ana@acme.co" }).formError).toBe("");
    expect(reducer(failed, { type: "setPrompt", prompt: "robots" }).formError).toBe("");
  });

  it("defaults to acquisition and keeps an explicit choice", () => {
    const lenses = [
      { key: "acquisition_generic", name: "General Acquisition", description: "" },
      { key: "partnership_strategic", name: "Strategic Partnership", description: "" },
    ];
    expect(reducer(initialState(), { type: "lensesLoaded", lenses }).lens).toBe("acquisition_generic");
    const chosen = reducer(initialState(), { type: "setLens", lens: "partnership_strategic" });
    expect(reducer(chosen, { type: "lensesLoaded", lenses }).lens).toBe("partnership_strategic");
  });

  it("drops the missing-strategies error once they load, keeping any other", () => {
    const lenses = [{ key: "acquisition_generic", name: "General Acquisition", description: "" }];
    const missing = reducer(initialState(), { type: "lensesFailed" });
    expect(reducer(missing, { type: "lensesLoaded", lenses }).formError).toBe("");
    const invalid = reducer(initialState(), { type: "formError", message: MESSAGES.invalidEmail });
    expect(reducer(invalid, { type: "lensesLoaded", lenses }).formError).toBe(MESSAGES.invalidEmail);
  });

  it("says the strategies are missing only on the form", () => {
    expect(reducer(initialState(), { type: "lensesFailed" }).formError).toBe(MESSAGES.unavailable);
    expect(reducer(searching, { type: "lensesFailed" })).toBe(searching);
  });

  it("starts another discovery from a clean form, keeping the email", () => {
    const shown: State = { ...searching, step: "results", matches: [MATCH], company: "Acme" };
    expect(reducer(shown, { type: "restart" })).toMatchObject({
      step: "idle",
      searchId: null,
      prompt: "",
      matches: [],
      company: null,
      email: "ana@acme.com",
    });
  });

  it("stops at the limit", () => {
    expect(reducer(searching, { type: "stopped", stop: STOPS.limit })).toMatchObject({ step: "stopped", searchId: null });
  });
});
