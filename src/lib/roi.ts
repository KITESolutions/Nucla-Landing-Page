/**
 * The ROI model from the redesign. Companies split 20% clear non-fits, 60% maybes and
 * 20% likely fits; first-pass time drops 5→1, 30→8 and 30→15 minutes, a 68% cut on
 * average, and Nucla's report halves partner-call prep for each likely fit.
 */
export const FIRST_PASS_CUT = 0.68;
const LIKELY_FIT_SHARE = 0.2;
const PREP_CUT = 0.5;
const HOURS_PER_WEEK = 40;

export interface RoiInput {
  companiesPerYear: number;
  minutesPerPass: number;
  /** Partner-call prep minutes per likely fit. */
  prepMinutes: number;
}

export interface RoiResult {
  review: number;
  calls: number;
  total: number;
  weeks: number;
}

export function hoursBack({ companiesPerYear, minutesPerPass, prepMinutes }: RoiInput): RoiResult {
  const review = (companiesPerYear * minutesPerPass * FIRST_PASS_CUT) / 60;
  const calls = (companiesPerYear * LIKELY_FIT_SHARE * prepMinutes * PREP_CUT) / 60;
  const total = review + calls;
  return { review, calls, total, weeks: total / HOURS_PER_WEEK };
}

export const formatCount = (value: number) => Math.round(value).toLocaleString("en-US");
