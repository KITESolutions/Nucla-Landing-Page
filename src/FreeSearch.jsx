import React, { useCallback, useEffect, useRef, useState } from "react";

// Free Nucla search: one search, one more after an emailed code, then the booking form.
// Every limit is enforced by the Nucla API; this component only shows the state it returns.
// Both values are set at build time (see .github/workflows/static.yml). Without them the search stays off.
const API = (import.meta.env.VITE_NUCLA_API_URL || "").replace(/\/$/, "");
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const VISITOR_KEY = "nucla_free_search_visitor";
const SEARCH_KEY = "nucla_free_search_last";
const TURNSTILE_SCRIPT_ID = "cf-turnstile-api";
const POLL_MS = 2500;
const POLL_GIVE_UP_MS = 10 * 60 * 1000;
const VERIFY_TIMEOUT_MS = 90 * 1000;

function store(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the visitor id still lives in memory for this page.
  }
}

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function newId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const REQUEST_TIMEOUT_MS = 30 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function call(path, { body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API}/api/v1/tripwire${path}`, {
      method: body ? "POST" : "GET",
      credentials: "omit",
      // Only requests with a body declare one, so the poll stays a simple request.
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // Offline, timed out, or a server error without CORS headers: all look the same here.
    const error = new Error("We couldn't reach Nucla. Try again in a moment.");
    error.code = "network";
    throw error;
  } finally {
    clearTimeout(timer);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || "Something went wrong. Try again.");
    error.code = data?.error?.code || `http_${response.status}`;
    error.status = response.status;
    throw error;
  }
  return data;
}

// Loads Cloudflare Turnstile once and returns a function that yields a fresh token per request.
function useTurnstile() {
  const holder = useRef(null);
  const widget = useRef(null);
  const pending = useRef(null);
  const ready = useRef(null);

  if (ready.current === null) {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    promise.catch(() => {});
    ready.current = { promise, resolve, reject };
  }

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;
    const settle = (fn) => (value) => {
      const current = pending.current;
      pending.current = null;
      current?.[fn](value);
    };
    const fail = () => settle("reject")(new Error("verification"));
    const render = () => {
      if (cancelled || !holder.current || widget.current !== null || !window.turnstile) return;
      widget.current = window.turnstile.render(holder.current, {
        sitekey: SITE_KEY,
        execution: "execute",
        appearance: "interaction-only",
        callback: settle("resolve"),
        "error-callback": fail,
        "expired-callback": fail,
        "timeout-callback": fail,
        "unsupported-callback": fail,
      });
      ready.current.resolve();
    };
    const blocked = () => ready.current.reject(new Error("verification"));
    // One script tag per page, as the HubSpot form loader does.
    let script = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (window.turnstile) render();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      script.addEventListener("error", blocked);
    }
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", blocked);
      if (widget.current !== null && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, []);

  const token = useCallback(async () => {
    if (!SITE_KEY) throw new Error("verification");
    await Promise.race([
      ready.current.promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("verification")), 15000)),
    ]);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.current = null;
        reject(new Error("verification"));
      }, VERIFY_TIMEOUT_MS);
      pending.current = {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      };
      window.turnstile.reset(widget.current);
      window.turnstile.execute(widget.current);
    });
  }, []);

  return { holder, token };
}

// "series_b" → "Series B", "private_equity" → "Private equity"; unknown stages are hidden.
function stageLabel(stage) {
  if (!stage || /unknown/i.test(stage)) return null;
  const words = String(stage).toLowerCase().split(/[_\s]+/).filter(Boolean);
  if (words[0] === "series") return `Series ${words.slice(1).join(" ").toUpperCase()}`;
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span className="fs-score fs-score-none">Not scored</span>;
  return <span className="fs-score">{Number(score).toFixed(1)}<small>/10</small></span>;
}

function ResultCard({ item }) {
  const place = [item.city, item.country].filter(Boolean).join(", ");
  const stage = stageLabel(item.funding_stage);
  return (
    <li className="deliverable fs-card">
      <div className="fs-card-head">
        <div>
          <h3>{item.name}</h3>
          <div className="fs-meta">
            {item.domain ? (
              <a href={`https://${item.domain}`} target="_blank" rel="noopener noreferrer">{item.domain}</a>
            ) : null}
            {place ? <span>{place}</span> : null}
            {item.employees ? <span>{item.employees} employees</span> : null}
            {stage ? <span>{stage}</span> : null}
          </div>
        </div>
        <ScoreBadge score={item.score} />
      </div>
      {item.rationale || item.description ? <p>{item.rationale || item.description}</p> : null}
      {item.criteria?.length ? (
        <div className="chips">
          {item.criteria.map((c) => (
            <span key={c.label}>{c.label} {c.score ?? "–"}</span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export default function FreeSearch({ bookAction }) {
  const { holder, token } = useTurnstile();
  // Created here, not by the server, so every call carries it even when storage is blocked.
  const [initialVisitor] = useState(() => {
    const stored = read(VISITOR_KEY);
    return stored && UUID_RE.test(stored) ? stored : newId();
  });
  const visitor = useRef(initialVisitor);
  const [lenses, setLenses] = useState([]);
  const [lens, setLens] = useState("");
  const [query, setQuery] = useState("");
  // form | running | results | email | code | book | busy
  const [phase, setPhase] = useState("form");
  const [search, setSearch] = useState(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    store(VISITOR_KEY, visitor.current);
    if (!API || !SITE_KEY) {
      setError("Free search isn't available right now.");
      return;
    }
    call("/lenses")
      .then((items) => {
        setLenses(items);
        setLens((current) => current || items.find((l) => l.key === "minority_investment_strategic")?.key || items[0]?.key || "");
      })
      .catch(() => setError("Free search isn't available right now."));
    // Re-show the visitor's last search, running or finished, after a refresh.
    const last = read(SEARCH_KEY);
    if (last) {
      setSearch({ search_id: last, status: "running" });
      setPhase("running");
    }
  }, []);

  // Poll the running search. The API never changes a count on a read. A failed poll is
  // retried with backoff; only "not found" ends it.
  useEffect(() => {
    if (phase !== "running" || !search?.search_id) return undefined;
    let stop = false;
    let timer = null;
    let failures = 0;
    const startedAt = Date.now();
    const tick = async () => {
      if (stop) return;
      if (Date.now() - startedAt > POLL_GIVE_UP_MS) {
        // Submitting again returns this same search if it is still running.
        setError("This search is taking longer than usual. Try again in a few minutes.");
        setPhase("form");
        return;
      }
      try {
        const body = await call(`/searches/${search.search_id}?visitor_id=${encodeURIComponent(visitor.current)}`);
        if (stop) return;
        failures = 0;
        setSearch(body);
        if (body.status === "completed") {
          if (!body.results?.length) {
            // Nothing found is not charged, so the visitor can describe it differently.
            store(SEARCH_KEY, null);
            setError("No strong matches for that description. This search didn't count, so try describing it differently.");
            setPhase(body.next === "email" ? "email" : "form");
            return;
          }
          setError("");
          setPhase("results");
          return;
        }
        if (body.status === "failed") {
          store(SEARCH_KEY, null);
          setError(body.error || "That search didn't finish. Try again.");
          setPhase(body.next === "email" ? "email" : "form");
          return;
        }
      } catch (err) {
        if (stop) return;
        if (err.status === 404) {
          store(SEARCH_KEY, null);
          setSearch(null);
          setPhase("form");
          return;
        }
        failures += 1;
      }
      timer = setTimeout(tick, POLL_MS * Math.min(2 ** failures, 8));
    };
    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [phase, search?.search_id]);

  const handleRefusal = (err) => {
    if (err.code === "tripwire_email_required") setPhase("email");
    else if (err.code === "tripwire_limit_reached") setPhase("book");
    else if (err.code === "tripwire_busy") setPhase("busy");
    setError(err.message === "verification" ? "We couldn't verify this browser. Refresh and try again." : err.message);
  };

  const running = (started) => {
    if (!started?.search_id) throw new Error("Something went wrong. Try again.");
    if (started.visitor_id && UUID_RE.test(started.visitor_id)) {
      visitor.current = started.visitor_id;
      store(VISITOR_KEY, started.visitor_id);
    }
    store(SEARCH_KEY, started.search_id);
    setSearch({ search_id: started.search_id, status: "running", query });
    setPhase("running");
  };

  const start = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const started = await call("/searches", {
        body: { query, lens, visitor_id: visitor.current, turnstile_token: await token() },
      });
      running(started);
    } catch (err) {
      handleRefusal(err);
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const sent = await call("/email/code", {
        body: { email, query, lens, visitor_id: visitor.current, turnstile_token: await token() },
      });
      setChallenge(sent.challenge);
      setCode("");
      setPhase("code");
    } catch (err) {
      handleRefusal(err);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const started = await call("/email/verify", {
        body: { challenge, code, email, query, lens, visitor_id: visitor.current },
      });
      setCode("");
      running(started);
    } catch (err) {
      handleRefusal(err);
      // Wrong code, full day and used-up searches are answered before or without using the
      // code. Anything else may come after the server used it, so ask for a new one.
      if (!["invalid_or_expired_code", "tripwire_busy", "tripwire_limit_reached"].includes(err.code)) {
        // The server may already have used this code, so a retry needs a new one.
        setPhase("email");
        setError(`${err.message} Request a new code to try again.`);
      }
    } finally {
      setBusy(false);
    }
  };

  const lensPicker = (
    <div className="fs-lenses" role="radiogroup" aria-label="Strategy lens">
      {lenses.map((l) => (
        <button
          key={l.key}
          type="button"
          role="radio"
          aria-checked={lens === l.key}
          className={`fs-lens${lens === l.key ? " is-on" : ""}`}
          onClick={() => setLens(l.key)}
          title={l.description}
        >
          {l.name}
        </button>
      ))}
    </div>
  );

  const queryBox = (label) => (
    <label className="fs-field">
      <span>{label}</span>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={300}
        rows={3}
        required
        minLength={3}
        placeholder="e.g. Canadian fintech scale-ups with 100 to 500 employees"
      />
    </label>
  );

  const showResults = Boolean(search?.results?.length) && phase !== "running";

  return (
    <div className="fs">

      {phase === "form" ? (
        <form className="fs-panel" onSubmit={start}>
          <p className="eyebrow">Strategy lens</p>
          {lensPicker}
          {queryBox("Describe the companies you want to find")}
          <button className="btn btn-primary" type="submit" disabled={busy || !lens || query.trim().length < 3}>
            {busy ? "Starting…" : "Run my free search"}
          </button>
          <p className="fs-note">Your first search is free. No sign-up needed.</p>
        </form>
      ) : null}

      {phase === "running" ? (
        <div className="fs-panel fs-running" aria-live="polite">
          <span className="fs-spinner" aria-hidden="true" />
          <div>
            <b>Finding and scoring companies…</b>
            <p>{search?.step_message || "Starting your search..."}</p>
            <p className="fs-note">This usually takes two to three minutes.</p>
          </div>
        </div>
      ) : null}

      {showResults ? (
        <section className="fs-results" aria-label="Search results">
          <p className="eyebrow">Top {search.results.length} matches</p>
          <p className="fs-results-head">{search.query}</p>
          <ol className="fs-list">
            {search.results.map((item, i) => (
              <ResultCard key={`${item.name}-${i}`} item={item} />
            ))}
          </ol>
        </section>
      ) : null}

      {phase === "results" && search?.next === "email" ? (
        <div className="fs-panel fs-next">
          <b>Want one more free search?</b>
          <button className="btn btn-ghost" type="button" onClick={() => { setQuery(""); setError(""); setPhase("email"); }}>
            Run one more search
          </button>
        </div>
      ) : null}

      {phase === "email" ? (
        <form className="fs-panel" onSubmit={sendCode}>
          <p className="eyebrow">One more free search</p>
          {lensPicker}
          {queryBox("What should the next search find?")}
          <label className="fs-field">
            <span>Your work email (we'll send a one-time code)</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <p className="fs-note">
            We'll email you this code, and Nucla may follow up about your search.{" "}
            <a href="https://app.nucla.com/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a>
          </p>
          <button className="btn btn-primary" type="submit" disabled={busy || !lens || !email || query.trim().length < 3}>
            {busy ? "Sending…" : "Email me a code"}
          </button>
        </form>
      ) : null}

      {phase === "code" ? (
        <form className="fs-panel" onSubmit={verify}>
          <p className="eyebrow">Check your inbox</p>
          <p className="fs-note">We sent a 6-digit code to {email}. It expires in 10 minutes.</p>
          <label className="fs-field">
            <span>Code</span>
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoComplete="one-time-code"
            />
          </label>
          <div className="fs-actions">
            <button className="btn btn-primary" type="submit" disabled={busy || code.length !== 6}>
              {busy ? "Checking…" : "Run my search"}
            </button>
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => { setError(""); setPhase("email"); }}>
              Change email or resend
            </button>
          </div>
        </form>
      ) : null}

      {(phase === "results" && search?.next === "book") || phase === "book" ? (
        <div className="demo-box fs-book">
          <p className="eyebrow">Free searches used</p>
          <h2>See the full picture for your team</h2>
          <p>Book a 30-minute walkthrough and we'll run Nucla against your own strategy and data.</p>
          <div className="actions">{bookAction}</div>
        </div>
      ) : null}

      {phase === "busy" ? (
        <div className="demo-box fs-book">
          <p className="eyebrow">Busy today</p>
          <h2>Free searches are full for today</h2>
          <p>Come back tomorrow, or book a 30-minute walkthrough and we'll run Nucla against your own strategy.</p>
          <div className="actions">{bookAction}</div>
        </div>
      ) : null}

      {/* Shown here, under the active form, if Cloudflare asks the visitor to interact. */}
      <div ref={holder} className="fs-turnstile" />
      {error && phase !== "busy" ? <p className="fs-error" role="alert">{error}</p> : null}
    </div>
  );
}
