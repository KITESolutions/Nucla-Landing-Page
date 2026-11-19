import type { Lens, Match, SearchStatus } from "./types";

/**
 * idle      the form: strategy and description
 * email     capture an address before starting the search
 * searching the search runs, tailored to the visitor's company when we found it
 * results   the top matches, on the page
 * stopped   no more free discoveries for this visitor, or for today
 */
export type Step = "idle" | "email" | "searching" | "results" | "stopped";

export interface Stop {
  title: string;
  text: string;
}

export interface State {
  step: Step;
  searchId: string | null;
  /** Picked up from this tab after a reload, and not heard from since. */
  resumed: boolean;
  lenses: Lens[];
  lens: string;
  prompt: string;
  email: string;
  company: string | null;
  progress: string;
  matches: Match[];
  slow: boolean;
  /** Polls keep failing: the search may still be running, but the page can't reach Nucla. */
  unreachable: boolean;
  /** The query typed when the API handed back a search already running, until its first poll. */
  typed: string | null;
  /** Says the search on screen isn't the one just asked for. */
  notice: string;
  remaining: number;
  busy: boolean;
  formError: string;
  stop: Stop | null;
}

export type Action =
  | { type: "lensesLoaded"; lenses: Lens[] }
  | { type: "lensesFailed" }
  | { type: "setLens"; lens: string }
  | { type: "setPrompt"; prompt: string }
  | { type: "setEmail"; email: string }
  | { type: "requestEmail" }
  | { type: "editPrompt" }
  | { type: "busy"; busy: boolean }
  | { type: "started"; searchId: string; resumed?: boolean; typed?: string }
  | { type: "status"; status: SearchStatus; slow: boolean }
  | { type: "pollFailed"; slow: boolean; unreachable: boolean }
  | { type: "expired" }
  | { type: "formError"; message: string }
  | { type: "stopped"; stop: Stop }
  | { type: "restart" };

export const MESSAGES = {
  unavailable: "Free discovery isn't available right now. Please try again later.",
  tooShort: "Describe the companies you want in a few words.",
  invalidEmail: "Enter a valid email address.",
  noMatches: "No strong matches for that description. That search didn't count, so try describing it differently.",
  verification: "We couldn't verify this browser. Refresh the page and try again.",
  generic: "Something went wrong. Try again.",
  searchExpired: "That search has expired. Run it again.",
  unreachable: "We're having trouble reaching Nucla. Your search is still running, and your matches will show here.",
  alreadyRunning: "A free discovery was already running in this browser, so this is that one. Yours can run once it finishes.",
};

export const STOPS = {
  limit: {
    title: "You've used your free discoveries",
    text: "Book a demo and we'll run Nucla against your own thesis and data.",
  },
  busy: {
    title: "Free discovery is full for today",
    text: "Come back tomorrow, or book a demo and we'll run Nucla against your own thesis.",
  },
} satisfies Record<string, Stop>;

/** A fresh page, or one picking up the visitor's saved search after a reload. */
export function initialState(email = "", searchId: string | null = null): State {
  return {
    step: searchId ? "searching" : "idle",
    searchId,
    resumed: searchId !== null,
    lenses: [],
    lens: "",
    prompt: "",
    email,
    company: null,
    progress: "",
    matches: [],
    slow: false,
    unreachable: false,
    typed: null,
    notice: "",
    remaining: 1,
    busy: false,
    formError: "",
    stop: null,
  };
}

/** What the page shows for a poll of the search. */
function applyStatus(previous: State, s: SearchStatus, slow: boolean): State {
  const prompt = s.query || previous.prompt;
  const handedBack = previous.typed !== null && s.query !== "" && s.query !== previous.typed;
  const state = {
    ...previous,
    unreachable: false,
    typed: null,
    notice: handedBack ? MESSAGES.alreadyRunning : previous.notice,
  };
  if (s.next === "retry" || s.status === "failed") {
    return { ...state, step: "idle", searchId: null, prompt, formError: s.error ?? MESSAGES.noMatches };
  }
  if (s.status === "completed") {
    return {
      ...state,
      step: "results",
      prompt,
      lens: s.lens || state.lens,
      company: s.company,
      matches: s.matches,
      remaining: s.remaining,
    };
  }
  return { ...state, step: "searching", prompt, company: s.company, progress: s.step_message, slow };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "lensesLoaded":
      return {
        ...state,
        lenses: action.lenses,
        lens: state.lens || action.lenses[0]?.key || "",
        formError: state.formError === MESSAGES.unavailable ? "" : state.formError,
      };
    case "lensesFailed":
      // Only the form needs the strategies; a resumed search carries on.
      return state.step === "idle" ? { ...state, formError: MESSAGES.unavailable } : state;
    case "setLens":
      return { ...state, lens: action.lens };
    case "setPrompt":
      return { ...state, prompt: action.prompt, formError: "" };
    case "setEmail":
      return { ...state, email: action.email, formError: "" };
    case "requestEmail":
      return { ...state, step: "email", formError: "" };
    case "editPrompt":
      return { ...state, step: "idle", formError: "" };
    case "busy":
      // A retry clears the last error, so the same error coming back is announced again.
      return action.busy ? { ...state, busy: true, formError: "" } : { ...state, busy: false };
    case "started":
      return {
        ...state,
        step: "searching",
        searchId: action.searchId,
        resumed: false,
        company: null,
        progress: "",
        matches: [],
        slow: false,
        unreachable: false,
        typed: action.resumed ? (action.typed ?? null) : null,
        notice: "",
        formError: "",
      };
    case "status":
      return applyStatus({ ...state, resumed: false }, action.status, action.slow);
    case "pollFailed":
      return { ...state, slow: state.slow || action.slow, unreachable: action.unreachable };
    case "expired":
      // A search picked up after a reload may simply be old: back to the form without a fuss.
      return {
        ...state,
        step: "idle",
        searchId: null,
        resumed: false,
        formError: state.resumed ? "" : MESSAGES.searchExpired,
      };
    case "formError":
      return { ...state, step: state.step === "email" ? "email" : "idle", searchId: null, formError: action.message };
    case "stopped":
      return { ...state, step: "stopped", searchId: null, stop: action.stop };
    case "restart":
      return {
        ...state,
        step: "idle",
        searchId: null,
        prompt: "",
        matches: [],
        company: null,
        formError: "",
        notice: "",
        stop: null,
      };
  }
}
