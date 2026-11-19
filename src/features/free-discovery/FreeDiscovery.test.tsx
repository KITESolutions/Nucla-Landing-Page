import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";

import { FreeDiscoveryError, freeDiscoveryApi } from "./api";
import { FreeDiscovery } from "./FreeDiscovery";
import type { Lens, Match, SearchStatus } from "./types";
import { MESSAGES } from "./state";
import { LENS_RETRY_MS, POLL_MS, SLOW_MS, UNREACHABLE_AFTER } from "./useFreeDiscovery";
import { VerificationError } from "./useTurnstile";

vi.mock("@/lib/config", () => ({
  config: { apiUrl: "https://api.nucla.test", turnstileSiteKey: "site-key" },
  freeDiscoveryEnabled: true,
}));
const getToken = vi.fn(async () => "turnstile-token");
vi.mock("./useTurnstile", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useTurnstile")>()),
  useTurnstile: () => getToken,
}));
vi.mock("./api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api")>()),
  freeDiscoveryApi: { lenses: vi.fn(), start: vi.fn(), status: vi.fn(), step: vi.fn() },
}));

const api = vi.mocked(freeDiscoveryApi);
const SEARCH_ID = "6f1c2a7e-0b8a-4a53-9c1e-2d6f7a8b9c0d";
const SEARCH_KEY = "nucla_free_discovery_search";
const UNAVAILABLE = "Free discovery isn't available right now. Please try again later.";
const LENSES: Lens[] = [
  { key: "acquisition_generic", name: "General Acquisition", description: "Buy outright" },
  { key: "partnership_strategic", name: "Strategic Partnership", description: "Work together" },
];
const MATCHES: Match[] = [
  { name: "Tessel Robotics", url: "https://tessel.example", meta: "Munich · 51-200 employees", score: "9.1/10", reason: "Picking robots for food plants." },
  { name: "Kinfold", url: null, meta: "Osaka", score: "8.4/10", reason: "" },
];

const running: SearchStatus = {
  search_id: SEARCH_ID,
  query: "Robotics for food manufacturing",
  lens: "partnership_strategic",
  company: null,
  status: "running",
  step_message: "Scoring companies against your strategy...",
  matches: [],
  remaining: 1,
  next: null,
  error: null,
};
const finished: SearchStatus = { ...running, status: "completed", matches: MATCHES, next: "search" };

// StrictMode runs every effect twice, as development builds do.
function renderDiscovery() {
  return render(
    <StrictMode>
      <MemoryRouter>
        <FreeDiscovery variant="card" />
      </MemoryRouter>
    </StrictMode>,
  );
}

const emailField = () => screen.getByRole("textbox", { name: "Your email" });
const promptField = () => screen.getByRole("textbox", { name: "Describe the companies you are looking for" });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "See my matches →" }));
/** The one status region a screen reader listens to. */
const status = () => screen.getByRole("status");
/** What the page shows, leaving out the status region that repeats it for screen readers. */
const VISIBLE = { ignore: "script, style, [role=status]" };
const shown = (text: string | RegExp) => screen.findByText(text, VISIBLE);
/** What a screen reader reads after a field's name: the elements its aria-describedby names. */
const description = (field: HTMLElement) =>
  (field.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent)
    .join(" ");

/** The error shows under the form and is announced. */
async function expectError(message: string) {
  expect(await shown(message)).toBeTruthy();
  expect(status().textContent).toBe(message);
}

async function startSearch(email = "ana@acme.com") {
  const page = renderDiscovery();
  fireEvent.click(await screen.findByRole("button", { name: "Strategic Partnership" }));
  fireEvent.change(emailField(), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Robotics for food manufacturing" }));
  submit();
  return page;
}

/** A search started on the page, then the tab reloaded while it ran. */
async function startThenReload() {
  const page = await startSearch();
  await shown("Scoring companies against your strategy...");
  page.unmount();
  api.status.mockClear();
}

beforeEach(() => {
  getToken.mockClear();
  api.step.mockClear();
  api.step.mockResolvedValue(undefined);
  api.lenses.mockResolvedValue(LENSES);
  api.start.mockResolvedValue({ search_id: SEARCH_ID });
  api.status.mockResolvedValue(running);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("FreeDiscovery", () => {
  it("won't search, or spend a verification, without a valid email", async () => {
    renderDiscovery();
    await screen.findByRole("button", { name: "General Acquisition" });
    fireEvent.change(promptField(), { target: { value: "Robotics for food manufacturing" } });
    submit();
    await expectError("Enter a valid email address.");
    fireEvent.change(emailField(), { target: { value: "ana@" } });
    submit();
    await expectError("Enter a valid email address.");
    expect(getToken).not.toHaveBeenCalled();
    expect(api.start).not.toHaveBeenCalled();
  });

  it("starts with the strategy, email and description, tailored to the visitor's company", async () => {
    api.status.mockResolvedValue({ ...running, company: "Acme Robotics" });
    await startSearch();

    expect(await screen.findByText("Searching live market data")).toBeTruthy();
    expect(api.start).toHaveBeenCalledWith({
      query: "Robotics for food manufacturing",
      lens: "partnership_strategic",
      email: "ana@acme.com",
      submission_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      visitor_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      turnstile_token: "turnstile-token",
    });
    expect(getToken).toHaveBeenCalledTimes(1);
    expect((await screen.findByText(/Tailoring the results to/)).textContent).toBe("Tailoring the results to Acme Robotics.");
    expect(screen.queryByText("Tessel Robotics")).toBeNull();
    expect(sessionStorage.getItem("nucla_free_discovery_email")).toBe("ana@acme.com");
    expect(localStorage.getItem("nucla_free_discovery_email")).toBeNull();
  });

  it("shows the top matches on the page when the search finishes, then Book a demo", async () => {
    api.status.mockResolvedValue({ ...finished, company: "Acme Robotics" });
    await startSearch();

    expect(await screen.findByText("Top 2 matches")).toBeTruthy();
    expect(screen.getByText(/Scored for Strategic Partnership/).textContent).toBe(
      "Scored for Strategic Partnership, tailored to Acme Robotics.",
    );
    expect(screen.getByRole("link", { name: /Tessel Robotics/ }).getAttribute("href")).toBe("https://tessel.example");
    expect(screen.getByText("9.1/10")).toBeTruthy();
    expect(screen.getByText("Picking robots for food plants.")).toBeTruthy();
    expect(screen.getByText("Kinfold")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book a demo →" }).getAttribute("href")).toBe("/contact#contact-form");
    expect(screen.getByRole("button", { name: "Run another discovery" })).toBeTruthy();
  });

  it("reports each step once for the drop-off funnel, under an id that isn't the search's", async () => {
    api.status.mockResolvedValue(finished);
    await startSearch();
    await shown("Top 2 matches");
    fireEvent.click(screen.getByRole("link", { name: "Book a demo →" }));

    const funnel = localStorage.getItem("nucla_free_discovery_funnel");
    expect(funnel).toMatch(/^[0-9a-f-]{36}$/);
    expect(funnel).not.toBe(localStorage.getItem("nucla_free_discovery_visitor"));
    expect(api.start.mock.calls[0][0].visitor_id).not.toBe(funnel);
    // The email is counted by the API when the search starts, not reported by the page.
    expect(api.step.mock.calls).toEqual([
      [funnel, "form_viewed"],
      [funnel, "results_viewed"],
      [funnel, "demo_clicked"],
    ]);
  });

  it("counts the form as seen only once a third of it is on screen", async () => {
    let onChange: IntersectionObserverCallback = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          onChange = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    renderDiscovery();
    await screen.findByRole("button", { name: "General Acquisition" });
    const visible = (ratio: number) =>
      act(() => onChange([{ intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver));

    visible(0.1);
    expect(api.step).not.toHaveBeenCalled();
    const disconnects = disconnect.mock.calls.length; // StrictMode's remount already disconnected one
    visible(0.5);
    expect(api.step.mock.calls.map(([, step]) => step)).toEqual(["form_viewed"]);
    expect(disconnect.mock.calls.length).toBe(disconnects + 1); // it stops watching once counted
  });

  it("says when Nucla can't be reached while a search runs, and carries on once it can", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"], shouldAdvanceTime: true });
    await startSearch();
    await shown("Scoring companies against your strategy...");
    api.status.mockRejectedValue(new FreeDiscoveryError("Bad gateway", "http_502", 502));
    for (let i = 0; i < UNREACHABLE_AFTER; i++) await act(() => vi.advanceTimersByTimeAsync(POLL_MS * 8));
    expect(await shown(MESSAGES.unreachable)).toBeTruthy();

    api.status.mockResolvedValue(running);
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS * 8));
    expect(await shown("Scoring companies against your strategy...")).toBeTruthy();
    expect(screen.queryByText(MESSAGES.unreachable, VISIBLE)).toBeNull();
  });

  it("shows no empty quote for a search picked up after a reload while Nucla can't be reached", async () => {
    await startThenReload();
    api.status.mockRejectedValue(new FreeDiscoveryError("Bad gateway", "http_502", 502));
    renderDiscovery();
    expect(await screen.findByText("Searching live market data")).toBeTruthy();
    expect(screen.queryByText("“”")).toBeNull();
  });

  it("says so when the search handed back is another one already running in this browser", async () => {
    api.start.mockResolvedValue({ search_id: SEARCH_ID, resumed: true });
    api.status.mockResolvedValue({ ...running, query: "Payments in Europe" });
    await startSearch();

    expect(await shown(MESSAGES.alreadyRunning)).toBeTruthy();
    expect(screen.getByText("“Payments in Europe”")).toBeTruthy();
  });

  it("says nothing more when the search handed back is the one just asked for", async () => {
    api.start.mockResolvedValue({ search_id: SEARCH_ID, resumed: true });
    await startSearch();

    await shown("Scoring companies against your strategy...");
    expect(screen.queryByText(MESSAGES.alreadyRunning, VISIBLE)).toBeNull();
  });

  it("says nothing more when the search handed back differs only in its spacing", async () => {
    api.start.mockResolvedValue({ search_id: SEARCH_ID, resumed: true });
    renderDiscovery();
    fireEvent.click(await screen.findByRole("button", { name: "Strategic Partnership" }));
    fireEvent.change(emailField(), { target: { value: "ana@acme.com" } });
    fireEvent.change(promptField(), { target: { value: "Robotics  for food\tmanufacturing" } });
    submit();

    await shown("Scoring companies against your strategy...");
    expect(screen.queryByText(MESSAGES.alreadyRunning, VISIBLE)).toBeNull();
  });

  it("announces a retry that fails the same way again", async () => {
    const offline = "We couldn't reach Nucla. Try again in a moment.";
    let fail: (error: Error) => void = () => {};
    api.start.mockRejectedValueOnce(new FreeDiscoveryError(offline, "network", null));
    await startSearch();
    await expectError(offline);
    const submission = api.start.mock.calls.at(-1)?.[0].submission_id;
    expect(submission).toBeTruthy();

    api.start.mockReturnValueOnce(new Promise((_, reject) => (fail = reject)));
    submit();
    await waitFor(() => expect(status().textContent).toBe("Starting…"));
    await act(async () => fail(new FreeDiscoveryError(offline, "network", null)));
    await expectError(offline);
    expect(api.start.mock.calls.at(-1)?.[0].submission_id).toBe(submission);
  });

  it("stops polling once the matches show", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"], shouldAdvanceTime: true });
    await startSearch();
    await shown("Scoring companies against your strategy...");
    api.status.mockResolvedValue(finished);
    await act(() => vi.advanceTimersByTimeAsync(POLL_MS));
    await shown("Top 2 matches");

    const polls = api.status.mock.calls.length;
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(api.status).toHaveBeenCalledTimes(polls);
  });

  it("starts another discovery from a clean form, keeping the email", async () => {
    api.status.mockResolvedValue(finished);
    await startSearch();
    fireEvent.click(await screen.findByRole("button", { name: "Run another discovery" }));

    expect((emailField() as HTMLInputElement).value).toBe("ana@acme.com");
    expect((promptField() as HTMLInputElement).value).toBe("");
    await waitFor(() => expect(document.activeElement).toBe(promptField()));
    expect(sessionStorage.getItem(SEARCH_KEY)).toBeNull();
  });

  it("offers only a demo after the last free discovery", async () => {
    api.status.mockResolvedValue({ ...finished, remaining: 0, next: "book" });
    await startSearch();

    expect(await screen.findByText("You've used your free discoveries.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Run another discovery" })).toBeNull();
  });

  it("offers a demo once the free discoveries are used up", async () => {
    api.start.mockRejectedValue(new FreeDiscoveryError("No free discoveries left.", "tripwire_limit_reached", 403));
    await startSearch();

    expect(await shown("You've used your free discoveries")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book a demo →" }).getAttribute("href")).toBe("/contact#contact-form");
    fireEvent.click(screen.getByRole("link", { name: "Book a demo →" }));
    expect(api.step.mock.calls.map(([, step]) => step)).toEqual(["form_viewed", "demo_clicked"]);
  });

  it("offers a demo when free discovery is full for today", async () => {
    api.start.mockRejectedValue(new FreeDiscoveryError("Free discovery is busy.", "tripwire_busy", 403));
    await startSearch();

    expect(await shown("Free discovery is full for today")).toBeTruthy();
    expect(status().textContent).toBe("Free discovery is full for today");
    await waitFor(() => expect(document.activeElement?.textContent).toBe("Free discovery is full for today"));
    expect(screen.getByRole("link", { name: "Book a demo →" }).getAttribute("href")).toBe("/contact#contact-form");
    expect(api.status).not.toHaveBeenCalled();
  });

  it("keeps the form as it was when Nucla can't be reached", async () => {
    api.start.mockRejectedValue(new FreeDiscoveryError("We couldn't reach Nucla. Try again in a moment.", "network", null));
    await startSearch();

    await expectError("We couldn't reach Nucla. Try again in a moment.");
    expect((emailField() as HTMLInputElement).value).toBe("ana@acme.com");
    expect((promptField() as HTMLInputElement).value).toBe("Robotics for food manufacturing");
    expect(api.status).not.toHaveBeenCalled();
  });

  it("goes back to the form with the reason when the search fails", async () => {
    const reason = "This discovery didn't finish. Try describing it differently.";
    api.status.mockResolvedValue({ ...running, status: "failed", next: "retry", error: reason });
    await startSearch();

    await expectError(reason);
    expect((promptField() as HTMLInputElement).value).toBe("Robotics for food manufacturing");
    await waitFor(() => expect(document.activeElement).toBe(promptField()));
    expect(description(promptField())).toBe(reason);
    expect(sessionStorage.getItem(SEARCH_KEY)).toBeNull();
  });

  it("asks for a longer description before spending a search", async () => {
    renderDiscovery();
    await screen.findByRole("button", { name: "General Acquisition" });
    fireEvent.change(emailField(), { target: { value: "ana@acme.com" } });
    fireEvent.change(promptField(), { target: { value: "ai" } });
    submit();

    await expectError("Describe the companies you want in a few words.");
    expect(api.start).not.toHaveBeenCalled();
  });

  it("picks a running search back up after a reload in the same tab, and shows its matches when done", async () => {
    await startThenReload();
    const visitor = localStorage.getItem("nucla_free_discovery_visitor");

    // Each reload polls the same search again: the step it's on comes from the API, not the page.
    for (let reload = 0; reload < 2; reload++) {
      const { unmount } = renderDiscovery();
      expect(await shown("Scoring companies against your strategy...")).toBeTruthy();
      expect(await shown("“Robotics for food manufacturing”")).toBeTruthy();
      expect(api.status).toHaveBeenCalledWith(SEARCH_ID, visitor);
      unmount();
      api.status.mockClear();
    }
    api.status.mockResolvedValue(finished);
    renderDiscovery();

    expect(await screen.findByText("Top 2 matches")).toBeTruthy();
    expect(api.status).toHaveBeenCalledWith(SEARCH_ID, visitor);
    expect(sessionStorage.getItem(SEARCH_KEY)).toBe(SEARCH_ID);
    // Picked up on its own, so it leaves focus where the page has it.
    await waitFor(() => expect(document.activeElement).toBe(document.body));
  });

  it("keeps the search to this tab, so a new tab or the next person on the computer starts at the form", async () => {
    await startThenReload();
    expect(localStorage.getItem(SEARCH_KEY)).toBeNull();
    sessionStorage.clear(); // a new tab, or the browser closed and opened again
    renderDiscovery();

    expect(await screen.findByRole("button", { name: "See my matches →" })).toBeTruthy();
    expect(screen.queryByText("Searching live market data")).toBeNull();
    expect(api.status).not.toHaveBeenCalled();
  });

  it("goes back to the form quietly when a search picked up after a reload has expired", async () => {
    await startThenReload();
    api.status.mockRejectedValue(new FreeDiscoveryError("Not found", "not_found", 404));
    renderDiscovery();

    expect(await screen.findByRole("button", { name: "See my matches →" })).toBeTruthy();
    expect(api.status).toHaveBeenCalledWith(SEARCH_ID, expect.any(String));
    expect(screen.queryByText("That search has expired. Run it again.", VISIBLE)).toBeNull();
    expect(status().textContent).toBe("");
    expect(sessionStorage.getItem(SEARCH_KEY)).toBeNull();
  });

  it("says so when a search followed on this page has expired", async () => {
    api.status.mockRejectedValue(new FreeDiscoveryError("Not found", "not_found", 404));
    await startSearch();

    await expectError("That search has expired. Run it again.");
  });

  it("says a search is slow from when it started, not from the reload", async () => {
    await startThenReload();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + SLOW_MS + 1_000);
    renderDiscovery();

    expect(await shown(/This is taking longer than usual/)).toBeTruthy();
  });

  it("doesn't spend a verification when the strategies didn't load, and loads them again", async () => {
    api.lenses.mockRejectedValue(new FreeDiscoveryError("Down", "network", null));
    renderDiscovery();
    await expectError(UNAVAILABLE);
    api.lenses.mockResolvedValue(LENSES);
    fireEvent.change(emailField(), { target: { value: "ana@acme.com" } });
    fireEvent.change(promptField(), { target: { value: "Robotics for food manufacturing" } });
    submit();

    expect(getToken).not.toHaveBeenCalled();
    expect(api.start).not.toHaveBeenCalled();
    // The strategies arrive, and the alert that they were missing goes with them.
    expect(await screen.findByRole("button", { name: "General Acquisition" })).toBeTruthy();
    expect(screen.queryByText(UNAVAILABLE, VISIBLE)).toBeNull();
    expect(status().textContent).toBe("");
  });

  it("tries the strategies once more on its own, without a verification", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"], shouldAdvanceTime: true });
    api.lenses.mockRejectedValue(new FreeDiscoveryError("Down", "network", null));
    renderDiscovery();
    await expectError(UNAVAILABLE);
    const loads = api.lenses.mock.calls.length;

    await act(() => vi.advanceTimersByTimeAsync(LENS_RETRY_MS));
    expect(api.lenses).toHaveBeenCalledTimes(loads + 1);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(api.lenses).toHaveBeenCalledTimes(loads + 1);
    expect(getToken).not.toHaveBeenCalled();
  });

  it("asks to refresh when the browser can't be verified", async () => {
    getToken.mockRejectedValueOnce(new VerificationError());
    await startSearch();

    await expectError("We couldn't verify this browser. Refresh the page and try again.");
    expect(api.start).not.toHaveBeenCalled();
  });
});

describe("FreeDiscovery for screen readers and keyboards", () => {
  it("labels the email, and links the hint and each error to the field it's about", async () => {
    renderDiscovery();
    await screen.findByRole("button", { name: "General Acquisition" });
    const email = emailField();
    expect(email.getAttribute("placeholder")).toBe("Your work email");
    expect(email.getAttribute("maxlength")).toBe("320");
    expect(description(email)).toBe("Using your work email helps us tailor the results to your company.");

    submit();
    await expectError("Enter a valid email address.");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(description(email)).toBe(
      "Enter a valid email address. Using your work email helps us tailor the results to your company.",
    );
    await waitFor(() => expect(document.activeElement).toBe(email));
    expect(promptField().getAttribute("aria-invalid")).toBeNull();

    fireEvent.change(email, { target: { value: "ana@acme.com" } });
    fireEvent.change(promptField(), { target: { value: "ai" } });
    submit();
    await expectError("Describe the companies you want in a few words.");
    expect(promptField().getAttribute("aria-invalid")).toBe("true");
    expect(description(promptField())).toBe("Describe the companies you want in a few words.");
    await waitFor(() => expect(document.activeElement).toBe(promptField()));
    expect(email.getAttribute("aria-invalid")).toBeNull();
    expect(description(email)).toBe("Using your work email helps us tailor the results to your company.");
  });

  it("moves focus to the search, then to the matches, announcing each in one region that stays", async () => {
    api.status.mockResolvedValue(running);
    const page = await startSearch();
    const region = status();
    await shown("Scoring companies against your strategy...");
    await waitFor(() => expect(document.activeElement?.textContent).toBe("Searching live market data"));
    expect(region.textContent).toBe("Searching…");
    page.unmount();
    sessionStorage.clear();

    api.status.mockResolvedValue(finished);
    await startSearch();
    const results = status();
    await shown("Top 2 matches");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { name: "“Robotics for food manufacturing”" })));
    expect(status()).toBe(results);
    expect(results.textContent).toBe("2 matches ready");
    // Only the short message is announced, never the whole list.
    expect(screen.getByRole("list").closest("[aria-live], [role=status]")).toBeNull();
  });
});
