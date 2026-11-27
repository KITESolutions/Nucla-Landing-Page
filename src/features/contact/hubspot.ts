/** Contact form submissions go to Nucla's HubSpot "Book a Demo" form, the one the previous site embedded, through
 * HubSpot's public form submission API. The account is in HubSpot's na3 region, which has its own API host. */
const PORTAL_ID = "343189980";
const FORM_ID = "c9bdb0ca-cfd6-44a6-b517-34025a1df8ab";
export const SUBMIT_URL = `https://api-na3.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;
const TIMEOUT_MS = 20_000;

export interface ContactRequest {
  firstName: string;
  email: string;
}

/** Why HubSpot refused a submission: the email itself, or anything else. */
export class ContactError extends Error {
  readonly field: "email" | null;

  constructor(message: string, field: "email" | null = null) {
    super(message);
    this.name = "ContactError";
    this.field = field;
  }
}

/** The redesign asks for a first name and a work email, the two contact fields HubSpot needs to follow up. */
export function hubSpotFields(request: ContactRequest) {
  return [
    { objectTypeId: "0-1", name: "firstname", value: request.firstName.trim() },
    { objectTypeId: "0-1", name: "email", value: request.email.trim() },
  ];
}

export async function sendContactRequest(request: ContactRequest): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(SUBMIT_URL, {
      method: "POST",
      credentials: "omit",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fields: hubSpotFields(request),
        context: { pageUri: window.location.href, pageName: document.title },
      }),
      signal: controller.signal,
    });
  } catch {
    throw new ContactError("We couldn't reach our form service.");
  } finally {
    clearTimeout(timer);
  }
  if (response.ok) return;
  const body = (await response.json().catch(() => ({}))) as { errors?: { errorType?: string }[] };
  const types = (body.errors ?? []).map((error) => error.errorType);
  if (types.includes("INVALID_EMAIL")) throw new ContactError("Enter a valid email address.", "email");
  if (types.includes("BLOCKED_FREE_EMAIL")) throw new ContactError("Please use your work email.", "email");
  throw new ContactError("We couldn't send your message.");
}
