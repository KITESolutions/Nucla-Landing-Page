import { session } from "@/lib/storage";

const KEY = "nucla_free_discovery_submission";
interface Submission { id: string; payload: string }
let memory: Submission | null = null;

function readSubmission(): Submission | null {
  try {
    const value: unknown = JSON.parse(session.get(KEY) ?? "null");
    if (value !== null && typeof value === "object" && "id" in value && "payload" in value
      && typeof value.id === "string" && typeof value.payload === "string") {
      return { id: value.id, payload: value.payload };
    }
  } catch { /* A malformed saved submission can be replaced. */ }
  return memory;
}

export function submissionFor(query: string, lens: string, email: string): string {
  const payload = JSON.stringify([query.trim().replace(/\s+/g, " "), lens, email.trim().toLowerCase()]);
  const saved = readSubmission();
  memory = saved?.payload === payload ? saved : { id: crypto.randomUUID(), payload };
  session.set(KEY, JSON.stringify(memory));
  return memory.id;
}

export function clearSubmission(): void {
  memory = null;
  session.set(KEY, null);
}
