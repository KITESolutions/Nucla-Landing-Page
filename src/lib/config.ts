/** Build-time settings (repository variables in the deploy workflow). */
export const config = {
  apiUrl: (import.meta.env.VITE_NUCLA_API_URL ?? "").replace(/\/$/, ""),
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "",
};

export const freeDiscoveryEnabled = Boolean(config.apiUrl && config.turnstileSiteKey);
