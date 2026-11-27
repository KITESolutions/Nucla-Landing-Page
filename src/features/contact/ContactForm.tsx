import { type FormEvent, useId, useRef, useState } from "react";

import { config } from "@/lib/config";
import { salesEmail } from "@/lib/routes";

import styles from "./ContactForm.module.css";
import { type ContactRequest, ContactError, sendContactRequest } from "./hubspot";

const EMAIL = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
/** The redesign's free mail providers. Personal-only brands match any ending (gmail.com, yahoo.co.uk). Names that are
 * also companies or common subdomains (Verizon, AT&T, Comcast, mail.acme.com) match only the mail domain itself. */
const PERSONAL_BRANDS =
  /^(gmail|googlemail|yahoo|ymail|outlook|hotmail|live|msn|icloud|aol|proton|protonmail|gmx|yandex|zoho|qq|163|126|fastmail|tutanota)\./i;
const PERSONAL_DOMAINS = new Set(["me.com", "mac.com", "pm.me", "mail.com", "hey.com", "web.de", "comcast.net", "att.net", "verizon.net"]);

type Field = "firstName" | "email";
interface Problem {
  field: Field | null;
  message: string;
}

function check(request: ContactRequest): Problem | null {
  if (!request.firstName.trim()) return { field: "firstName", message: "Please add your first name." };
  const domain = request.email.trim().toLowerCase().match(EMAIL)?.[1];
  if (!domain) return { field: "email", message: "Enter a valid email address." };
  if (PERSONAL_BRANDS.test(domain) || PERSONAL_DOMAINS.has(domain)) return { field: "email", message: "Please use your work email." };
  return null;
}

/** The contact form from the redesign. Each message goes to Nucla's HubSpot, where sales picks it up. */
export function ContactForm() {
  const id = useId();
  const [request, setRequest] = useState<ContactRequest>({ firstName: "", email: "" });
  const [problem, setProblem] = useState<Problem | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const fields = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const thanks = useRef<HTMLDivElement>(null);

  const set = (field: Field) => (value: string) => {
    setRequest((now) => ({ ...now, [field]: value }));
    setProblem(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    const found = check(request);
    setProblem(found);
    if (found?.field) return fields.current[found.field]?.focus();
    setStatus("sending");
    try {
      if (!config.demoFormOnly) await sendContactRequest(request);
      setStatus("sent");
      requestAnimationFrame(() => thanks.current?.focus());
    } catch (error) {
      setStatus("idle");
      if (error instanceof ContactError && error.field === "email") {
        setProblem({ field: "email", message: error.message });
        fields.current.email?.focus();
      } else {
        setProblem({ field: null, message: "We couldn't send your message. Try again in a moment." });
      }
    }
  };

  if (status === "sent") {
    return (
      <div ref={thanks} tabIndex={-1} role="status" className={styles.thanks}>
        <span className={styles.tick} aria-hidden="true">
          ✓
        </span>
        <div className={styles.thanksBody}>
          <div className={styles.thanksTitle}>Thanks, {request.firstName.trim()}.</div>
          <p className={styles.thanksText}>
            {config.demoFormOnly ? "This form is for demo only. It won't send emails or create meetings." : (
              <>We'll reply to <span className={styles.address}>{request.email.trim()}</span>.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  const errorId = `${id}-error`;
  const input = (field: Field, label: string, placeholder: string, extra: { type?: string; autoComplete: string }) => (
    <label className={styles.label}>
      {label}
      <input
        ref={(node) => {
          fields.current[field] = node;
        }}
        type={extra.type ?? "text"}
        name={field === "firstName" ? "firstname" : "email"}
        autoComplete={extra.autoComplete}
        value={request[field]}
        onChange={(event) => set(field)(event.target.value)}
        placeholder={placeholder}
        maxLength={field === "email" ? 320 : 200}
        aria-invalid={problem?.field === field || undefined}
        aria-describedby={problem?.field === field ? errorId : undefined}
        className={styles.input}
      />
    </label>
  );

  return (
    // The form checks the fields itself, so the browser's own messages don't replace ours.
    <form onSubmit={submit} noValidate className={styles.form}>
      {config.demoFormOnly && <p>This form is for demo only. It won't send emails or create meetings.</p>}
      <div className={styles.grid}>
        {input("firstName", "First name", "Jane", { autoComplete: "given-name" })}
        {input("email", "Work email", "you@company.com", { type: "email", autoComplete: "email" })}
      </div>
      {problem && (
        <div id={errorId} role="alert" className={styles.error}>
          {problem.message}
          {!problem.field && (
            <>
              {" "}
              You can also write to <a href={`mailto:${salesEmail}`}>{salesEmail}</a>.
            </>
          )}
        </div>
      )}
      <button type="submit" disabled={status === "sending"} className={styles.send}>
        {status === "sending" ? "Sending…" : "Request a demo"}
      </button>
    </form>
  );
}
