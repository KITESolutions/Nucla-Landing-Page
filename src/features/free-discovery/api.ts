import { config } from "@/lib/config";

import type { FunnelStep, Lens, SearchStarted, SearchStatus } from "./types";

const TIMEOUT_MS = 30_000;

/** A refused or failed call. `code` is the API's error code, or "network". */
export class FreeDiscoveryError extends Error {
  readonly code: string;
  readonly status: number | null;

  constructor(message: string, code: string, status: number | null) {
    super(message);
    this.name = "FreeDiscoveryError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}/api/v1/tripwire${path}`, {
      method: body === undefined ? "GET" : "POST",
      // Never send cookies: these routes are public and the API refuses credentials on them.
      credentials: "omit",
      // Only requests with a body declare one, so the poll stays a simple request.
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new FreeDiscoveryError("We couldn't reach Nucla. Try again in a moment.", "network", null);
  } finally {
    clearTimeout(timer);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = (data as { error?: { code?: string; message?: string } }).error;
    throw new FreeDiscoveryError(
      error?.message ?? "Something went wrong. Try again.",
      error?.code ?? `http_${response.status}`,
      response.status,
    );
  }
  return data as T;
}

export const freeDiscoveryApi = {
  lenses: () => request<Lens[]>("/lenses"),
  /** The email comes with the search: nothing runs without it. */
  start: (body: { query: string; lens: string; email: string; visitor_id: string; turnstile_token: string }) =>
    request<SearchStarted>("/searches", body),
  status: (searchId: string, visitorId: string) =>
    request<SearchStatus>(`/searches/${encodeURIComponent(searchId)}?visitor_id=${encodeURIComponent(visitorId)}`),
  /** Best effort: a lost report changes nothing on the page, so it never throws. */
  step: (visitorId: string, step: FunnelStep) =>
    request<unknown>("/steps", { visitor_id: visitorId, step }).then(
      () => undefined,
      () => undefined,
    ),
};
