import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { freeDiscoveryEnabled } from "@/lib/config";
import { local, session } from "@/lib/storage";

import { FreeDiscoveryError, freeDiscoveryApi } from "./api";
import { MESSAGES, STOPS, initialState, reducer } from "./state";
import type { FunnelStep } from "./types";
import { VerificationError, useTurnstile } from "./useTurnstile";

const VISITOR_KEY = "nucla_free_discovery_visitor";
const SEARCH_KEY = "nucla_free_discovery_search";
const STARTED_KEY = "nucla_free_discovery_started";
const EMAIL_KEY = "nucla_free_discovery_email";
const FUNNEL_KEY = "nucla_free_discovery_funnel";
export const POLL_MS = 2_500;
/** One quiet retry when the strategies don't load, before the visitor has to submit. */
export const LENS_RETRY_MS = 3_000;
/** After this long the page says the search is slow (it keeps polling). */
export const SLOW_MS = 4 * 60 * 1_000;
/** Failed polls in a row before the page says it can't reach Nucla (it keeps polling). */
export const UNREACHABLE_AFTER = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function visitorId() {
  const stored = local.get(VISITOR_KEY);
  if (stored && UUID.test(stored)) return stored;
  const id = crypto.randomUUID();
  local.set(VISITOR_KEY, id);
  return id;
}

/** The id the funnel reports carry: separate from the visitor id, so a page view can't be tied to a search or an
 * email. Kept for the page when storage is blocked, so moving around the site counts one browser. */
let funnel: string | null = null;
function funnelId() {
  const stored = local.get(FUNNEL_KEY);
  funnel = stored && UUID.test(stored) ? stored : (funnel ?? crypto.randomUUID());
  local.set(FUNNEL_KEY, funnel);
  return funnel;
}

/** This tab's search and when it started, kept so a reload in the same tab picks it back up. */
function savedSearch() {
  const id = session.get(SEARCH_KEY);
  const startedAt = Number(session.get(STARTED_KEY));
  return id && UUID.test(id) && startedAt > 0 ? { id, startedAt } : null;
}

/** The free discovery flow: the email and the description start a search, whose top matches show here. */
export function useFreeDiscovery() {
  // The email and the search are kept for this tab only, so a shared computer doesn't offer them to the next person
  // and a visitor back another day starts at the form instead of an expired search.
  const saved = useMemo(savedSearch, []);
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState(session.get(EMAIL_KEY) ?? "", saved?.id ?? null),
  );
  const visitor = useMemo(visitorId, []);
  const getToken = useTurnstile();
  const startedAt = useRef(saved?.startedAt ?? 0);
  const [lensAttempt, retryLenses] = useReducer((attempt: number) => attempt + 1, 0);

  // Each step is reported once per page; the API counts a browser once per step a day.
  const reported = useRef(new Set<FunnelStep>());
  const report = useCallback((step: FunnelStep) => {
    if (!freeDiscoveryEnabled || reported.current.has(step)) return;
    reported.current.add(step);
    void freeDiscoveryApi.step(funnelId(), step);
  }, []);
  const formSeen = useCallback(() => report("form_viewed"), [report]);
  useEffect(() => {
    if (state.step === "results") report("results_viewed");
  }, [state.step, report]);

  // The search is saved while it runs and while its matches show, so a reload picks it back up.
  useEffect(() => {
    session.set(SEARCH_KEY, state.searchId);
    session.set(STARTED_KEY, state.searchId ? String(startedAt.current) : null);
  }, [state.searchId]);

  // Strategies come from the API, so the page always offers what the backend scores.
  useEffect(() => {
    if (!freeDiscoveryEnabled) return;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    freeDiscoveryApi
      .lenses()
      .then((lenses) => !cancelled && dispatch({ type: "lensesLoaded", lenses }))
      .catch(() => {
        if (cancelled) return;
        dispatch({ type: "lensesFailed" });
        if (lensAttempt === 0) retry = setTimeout(retryLenses, LENS_RETRY_MS);
      });
    return () => {
      cancelled = true;
      clearTimeout(retry);
    };
  }, [lensAttempt]);

  const polling = state.searchId !== null && state.step === "searching";
  useEffect(() => {
    if (!polling || !state.searchId) return;
    const searchId = state.searchId;
    let cancelled = false;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // A hidden tab stops polling and catches up when it's shown.
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      void tick();
    };
    const schedule = () => {
      if (cancelled) return;
      if (document.hidden) document.addEventListener("visibilitychange", onVisible);
      else timer = setTimeout(tick, POLL_MS * Math.min(2 ** failures, 8));
    };
    const tick = async () => {
      try {
        const status = await freeDiscoveryApi.status(searchId, visitor);
        if (cancelled) return;
        failures = 0;
        dispatch({ type: "status", status, slow: Date.now() - startedAt.current > SLOW_MS });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof FreeDiscoveryError && error.status === 404) {
          dispatch({ type: "expired" });
          return;
        }
        failures += 1;
        dispatch({
          type: "pollFailed",
          slow: Date.now() - startedAt.current > SLOW_MS,
          unreachable: failures >= UNREACHABLE_AFTER,
        });
      }
      schedule();
    };

    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [polling, state.searchId, visitor]);

  const start = useCallback(async () => {
    if (state.busy) return;
    if (!freeDiscoveryEnabled) return dispatch({ type: "formError", message: MESSAGES.unavailable });
    // Without the strategies there's nothing to score against; don't spend a verification on it.
    if (!state.lens) {
      retryLenses();
      return dispatch({ type: "formError", message: MESSAGES.unavailable });
    }
    const email = state.email.trim();
    if (!EMAIL.test(email)) return dispatch({ type: "formError", message: MESSAGES.invalidEmail });
    const query = state.prompt.trim();
    if (query.length < 3) return dispatch({ type: "formError", message: MESSAGES.tooShort });
    dispatch({ type: "busy", busy: true });
    try {
      const turnstile_token = await getToken();
      const started = await freeDiscoveryApi.start({ query, lens: state.lens, email, visitor_id: visitor, turnstile_token });
      session.set(EMAIL_KEY, email);
      startedAt.current = Date.now();
      // Spaced as the API stores the query, so the same search is never reported as another one.
      const typed = query.replace(/\s+/g, " ");
      dispatch({ type: "started", searchId: started.search_id, resumed: started.resumed, typed });
    } catch (error) {
      if (error instanceof FreeDiscoveryError && error.code === "tripwire_limit_reached") {
        dispatch({ type: "stopped", stop: STOPS.limit });
      } else if (error instanceof FreeDiscoveryError && error.code === "tripwire_busy") {
        dispatch({ type: "stopped", stop: STOPS.busy });
      } else {
        const message =
          error instanceof FreeDiscoveryError
            ? error.message
            : error instanceof VerificationError
              ? MESSAGES.verification
              : MESSAGES.generic;
        dispatch({ type: "formError", message });
      }
    } finally {
      dispatch({ type: "busy", busy: false });
    }
  }, [getToken, state.busy, state.email, state.lens, state.prompt, visitor]);

  return {
    state,
    setPrompt: (prompt: string) => dispatch({ type: "setPrompt", prompt }),
    setLens: (lens: string) => dispatch({ type: "setLens", lens }),
    setEmail: (email: string) => dispatch({ type: "setEmail", email }),
    start,
    restart: () => dispatch({ type: "restart" }),
    formSeen,
    bookDemo: () => report("demo_clicked"),
  };
}
