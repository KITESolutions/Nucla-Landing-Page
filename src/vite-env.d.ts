/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_FORM_ONLY?: string;
  /** Nucla API origin, e.g. https://api.nucla.com. Empty turns free discovery off. */
  readonly VITE_NUCLA_API_URL?: string;
  /** Cloudflare Turnstile site key (public). Empty turns free discovery off. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
