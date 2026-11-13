import { type FormEvent, useId, useRef, useState } from "react";

import { salesEmail } from "@/lib/routes";

import styles from "./ContactForm.module.css";
import { type ContactRequest, ContactError, sendContactRequest } from "./hubspot";

const TOPICS = ["Book a demo", "Pricing", "Partnership", "Something else"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Free mail providers; the form asks for a work email. */
const PERSONAL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com", "hotmail.com", "outlook.com", "live.com",
  "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "gmx.com", "gmx.de",
  "yandex.com", "mail.com", "zoho.com",
]);

type Field = "name" | "email" | "company" | "role";
type Errors = Partial<Record<Field, string>>;
const ORDER: Field[] = ["name", "email", "company", "role"];

function check(request: ContactRequest): Errors {
  const errors: Errors = {};
  if (!request.name.trim()) errors.name = "Enter your name.";
  const email = request.email.trim().toLowerCase();
  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";
  else if (PERSONAL_DOMAINS.has(email.split("@")[1])) errors.email = "Use your work email.";
  if (!request.company.trim()) errors.company = "Enter your company.";
  if (!request.role.trim()) errors.role = "Enter your role.";
  return errors;
}

/** The contact form from the redesign. Each message goes to Nucla's HubSpot, where sales picks it up. */
export function ContactForm() {
  const id = useId();
  const [request, setRequest] = useState<ContactRequest>({
    topic: TOPICS[0],
    name: "",
    email: "",
    company: "",
    role: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [failure, setFailure] = useState("");
  const fields = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const thanks = useRef<HTMLDivElement>(null);

  const set = (key: keyof ContactRequest) => (value: string) => {
    setRequest((now) => ({ ...now, [key]: value }));
    if (key in errors) setErrors((now) => ({ ...now, [key]: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    const found = check(request);
    setErrors(found);
    setFailure("");
    const first = ORDER.find((field) => found[field]);
    if (first) return fields.current[first]?.focus();
    setStatus("sending");
    try {
      await sendContactRequest(request);
      setStatus("sent");
      requestAnimationFrame(() => thanks.current?.focus());
    } catch (error) {
      setStatus("idle");
      if (error instanceof ContactError && error.field === "email") {
        setErrors({ email: error.message });
        fields.current.email?.focus();
      } else {
        setFailure("We couldn't send your message. Try again in a moment.");
      }
    }
  };

  if (status === "sent") {
    return (
      <div ref={thanks} tabIndex={-1} role="status" className={styles.thanks}>
        <div className={styles.thanksTitle}>Thanks, we've got your message.</div>
        <p className={styles.thanksText}>A real person on our team will read it and get back to you.</p>
      </div>
    );
  }

  const input = (field: Field, label: string, placeholder: string, extra: { type?: string; autoComplete: string }) => (
    <div className={styles.field}>
      <label htmlFor={`${id}-${field}`} className={styles.label}>
        {label}
      </label>
      <input
        ref={(node) => {
          fields.current[field] = node;
        }}
        id={`${id}-${field}`}
        type={extra.type ?? "text"}
        autoComplete={extra.autoComplete}
        value={request[field]}
        onChange={(event) => set(field)(event.target.value)}
        placeholder={placeholder}
        maxLength={field === "email" ? 320 : 200}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? `${id}-${field}-error` : undefined}
        className={styles.input}
      />
      {errors[field] && (
        <p id={`${id}-${field}-error`} className={styles.error}>
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    // The form checks the fields itself, so the browser's own messages don't replace ours.
    <form onSubmit={submit} noValidate className={styles.form}>
      <fieldset className={styles.topics}>
        <legend className={styles.question}>What can we help with?</legend>
        <div className={styles.chips}>
          {TOPICS.map((topic) => (
            <label key={topic} className={topic === request.topic ? `${styles.chip} ${styles.chipOn}` : styles.chip}>
              <input
                type="radio"
                name={`${id}-topic`}
                value={topic}
                checked={topic === request.topic}
                onChange={() => set("topic")(topic)}
                className="visually-hidden"
              />
              {topic}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.grid}>
        {input("name", "Full name", "Jane Smith", { autoComplete: "name" })}
        {input("email", "Work email", "you@company.com", { type: "email", autoComplete: "email" })}
        {input("company", "Company", "Company name", { autoComplete: "organization" })}
        {input("role", "Role", "Head of Corporate Ventures", { autoComplete: "organization-title" })}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-message`} className={styles.label}>
          Message <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id={`${id}-message`}
          value={request.message}
          onChange={(event) => set("message")(event.target.value)}
          placeholder="What are you looking for, and how many companies does your team review a year?"
          rows={4}
          maxLength={2000}
          className={styles.textarea}
        />
      </div>

      {failure && (
        <p role="alert" className={styles.failure}>
          {failure} You can also write to <a href={`mailto:${salesEmail}`}>{salesEmail}</a>.
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" disabled={status === "sending"} className={styles.send}>
          {status === "sending" ? "Sending…" : "Send message →"}
        </button>
        <span className={styles.note}>Work email only. We never share your details.</span>
      </div>
    </form>
  );
}
