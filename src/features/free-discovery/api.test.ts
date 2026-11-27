import { FreeDiscoveryError, freeDiscoveryApi } from "./api";

vi.mock("@/lib/config", () => ({
  config: { apiUrl: "https://api.nucla.test", turnstileSiteKey: "site-key" },
  freeDiscoveryEnabled: true,
}));

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("freeDiscoveryApi", () => {
  it("polls with a simple GET: no cookies, no body, no content type", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { search_id: "s 1" }));
    await freeDiscoveryApi.status("s 1", "v/1");
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://api.nucla.test/api/v1/tripwire/searches/s%201?visitor_id=v%2F1");
    expect(init).toMatchObject({ method: "GET", credentials: "omit", headers: undefined, body: undefined });
  });

  it("posts the search, email included, as JSON without cookies", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(202, { search_id: "s1" }));
    const body = { submission_id: "submission-1", query: "robots", lens: "acquisition_generic", email: "ana@acme.com", visitor_id: "v1", turnstile_token: "t" };
    expect(await freeDiscoveryApi.start(body)).toEqual({ search_id: "s1" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://api.nucla.test/api/v1/tripwire/searches");
    expect(init).toMatchObject({
      method: "POST",
      credentials: "omit",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  it("reports a funnel step without cookies, and never throws when the report is lost", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(freeDiscoveryApi.step("v1", "form_viewed")).resolves.toBeUndefined();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://api.nucla.test/api/v1/tripwire/steps");
    expect(init).toMatchObject({
      method: "POST",
      credentials: "omit",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitor_id: "v1", step: "form_viewed" }),
    });

    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(freeDiscoveryApi.step("v1", "demo_clicked")).resolves.toBeUndefined();
    fetch.mockResolvedValue(json(503, { error: { code: "tripwire_busy", message: "Busy" } }));
    await expect(freeDiscoveryApi.step("v1", "demo_clicked")).resolves.toBeUndefined();
  });

  it("turns the API's error envelope into an error with its code, message and status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      json(403, { error: { code: "tripwire_limit_reached", message: "No free discoveries left.", request_id: "r1" } }),
    );
    const error = await freeDiscoveryApi.lenses().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(FreeDiscoveryError);
    expect(error).toMatchObject({ code: "tripwire_limit_reached", message: "No free discoveries left.", status: 403 });
  });

  it("still fails cleanly when an error response isn't JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(freeDiscoveryApi.lenses()).rejects.toMatchObject({ code: "http_502", status: 502 });
  });

  it("reports an unreachable API as a network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(freeDiscoveryApi.lenses()).rejects.toMatchObject({ code: "network", status: null });
  });
});
