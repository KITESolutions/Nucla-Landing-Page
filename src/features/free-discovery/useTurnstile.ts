import { useCallback, useEffect, useRef } from "react";

import { config } from "@/lib/config";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (container: HTMLElement | string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 15_000;
const SOLVE_TIMEOUT_MS = 90_000;

/** Cloudflare's check didn't load or wasn't passed. */
export class VerificationError extends Error {
  constructor() {
    super("This browser couldn't be verified.");
    this.name = "VerificationError";
  }
}

let loading: Promise<NonNullable<Window["turnstile"]>> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    const fail = () => {
      loading = null; // the next search tries loading it again
      reject(new VerificationError());
    };
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : fail());
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loading;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new VerificationError()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * One invisible Cloudflare Turnstile widget per page, asked for a fresh token per search.
 * It only shows itself if Cloudflare wants the visitor to interact.
 */
export function useTurnstile() {
  const holder = useRef<HTMLDivElement | null>(null);
  const widget = useRef<string | null>(null);
  const waiting = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);

  useEffect(
    () => () => {
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      holder.current?.remove();
      widget.current = null;
      holder.current = null;
    },
    [],
  );

  return useCallback(async (): Promise<string> => {
    const turnstile = await withTimeout(loadTurnstile(), LOAD_TIMEOUT_MS);
    if (!holder.current) {
      // Outside the React tree, so re-renders never touch Cloudflare's iframe.
      holder.current = document.createElement("div");
      holder.current.className = "turnstile-holder";
      document.body.appendChild(holder.current);
    }
    const settle = (ok: boolean) => (value?: string) => {
      const pending = waiting.current;
      waiting.current = null;
      if (!pending) return;
      if (ok && value) pending.resolve(value);
      else pending.reject(new VerificationError());
    };
    if (widget.current === null) {
      widget.current = turnstile.render(holder.current, {
        sitekey: config.turnstileSiteKey,
        execution: "execute",
        appearance: "interaction-only",
        callback: settle(true),
        "error-callback": settle(false),
        "expired-callback": settle(false),
        "timeout-callback": settle(false),
        "unsupported-callback": settle(false),
      });
    }
    const token = new Promise<string>((resolve, reject) => {
      waiting.current = { resolve, reject };
    });
    turnstile.reset(widget.current);
    turnstile.execute(holder.current);
    return withTimeout(token, SOLVE_TIMEOUT_MS);
  }, []);
}
