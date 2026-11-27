/** Shapes of the Nucla API's /api/v1/tripwire routes (backend models Tripwire*). */
export interface Lens {
  key: string;
  name: string;
  description: string;
}

/** A step of the free discovery the page reports for the drop-off funnel on Nucla's leads page. The API counts the
 * email itself, when a search starts. */
export type FunnelStep = "form_viewed" | "results_viewed" | "demo_clicked";

export interface SearchStarted {
  search_id: string;
  /** True when the API handed back this browser's search already running instead of a new one. */
  resumed?: boolean;
}

/** One match as the page shows it: public fields only, cleaned by the API. */
export interface Match {
  name: string;
  url: string | null;
  meta: string;
  score: string;
  reason: string;
  company_details?: {
    description?: string;
    founded_year?: number;
    sector?: string;
    total_funding_usd?: number;
  };
}

export interface SearchStatus {
  search_id: string;
  query: string;
  lens: string;
  /** Whose company the results were tailored to, from a work email. */
  company: string | null;
  status: "running" | "completed" | "failed";
  step_message: string;
  /** The top matches, once the search has finished. */
  matches: Match[];
  remaining: number;
  /** "retry" only when the search failed or found nothing. */
  next: "search" | "book" | "retry" | null;
  error: string | null;
}
