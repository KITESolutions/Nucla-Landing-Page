import { act, fireEvent, render, screen } from "@testing-library/react";

import { ContactForm } from "./ContactForm";
import { SUBMIT_URL } from "./hubspot";

const ok = () => new Response(JSON.stringify({ inlineMessage: "Thanks" }), { status: 200 });
const refused = (errorType: string) =>
  new Response(JSON.stringify({ status: "error", errors: [{ errorType, message: "no" }] }), { status: 400 });

const field = (name: string) => screen.getByLabelText(name) as HTMLInputElement;
const type = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const send = () => fireEvent.click(screen.getByRole("button", { name: "Request a demo" }));

function fillIn() {
  type("First name", " Ana ");
  type("Work email", "ana@acme.com");
}

describe("the contact form", () => {
  it("asks for a first name, then a valid email, and sends nothing until both are there", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(<ContactForm />);
    send();
    expect(screen.getByRole("alert").textContent).toBe("Please add your first name.");
    expect(field("First name").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field("First name"));

    type("First name", "Ana");
    type("Work email", "ana@acme");
    send();
    expect(screen.getByRole("alert").textContent).toBe("Enter a valid email address.");
    expect(document.activeElement).toBe(field("Work email"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks for a work email, but takes one from a company that also sells mail", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(ok());
    render(<ContactForm />);
    type("First name", "Ana");
    type("Work email", "ana@Gmail.com");
    send();
    expect(screen.getByRole("alert").textContent).toBe("Please use your work email.");
    expect(document.activeElement).toBe(field("Work email"));
    expect(fetch).not.toHaveBeenCalled();

    type("Work email", "ana@verizon.com");
    send();
    expect(await screen.findByRole("status")).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("sends the first name and email to HubSpot, then thanks the visitor by name", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(ok());
    render(<ContactForm />);
    fillIn();
    send();

    expect((await screen.findByRole("status")).textContent).toBe("✓Thanks, Ana.We'll reply to ana@acme.com.");
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(SUBMIT_URL);
    expect(SUBMIT_URL).toBe(
      "https://api-na3.hsforms.com/submissions/v3/integration/submit/343189980/c9bdb0ca-cfd6-44a6-b517-34025a1df8ab",
    );
    expect(init).toMatchObject({ method: "POST", credentials: "omit", headers: { "content-type": "application/json" } });
    const body = JSON.parse(String(init?.body));
    expect(body.fields).toEqual([
      { objectTypeId: "0-1", name: "firstname", value: "Ana" },
      { objectTypeId: "0-1", name: "email", value: "ana@acme.com" },
    ]);
    expect(body.context).toEqual({ pageUri: window.location.href, pageName: document.title });
  });

  it("shows HubSpot's email refusal and keeps what was typed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(refused("BLOCKED_FREE_EMAIL"));
    render(<ContactForm />);
    fillIn();
    send();

    expect((await screen.findByRole("alert")).textContent).toBe("Please use your work email.");
    expect(document.activeElement).toBe(field("Work email"));
    expect(field("First name").value).toBe(" Ana ");
  });

  it("keeps the form and offers email when the message can't be sent", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    render(<ContactForm />);
    fillIn();
    send();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "We couldn't send your message. Try again in a moment. You can also write to sales@nucla.com.",
    );
    expect(field("Work email").value).toBe("ana@acme.com");
    expect((screen.getByRole("button", { name: "Request a demo" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("sends once however often Send is pressed while it's sending", async () => {
    let resolve: (response: Response) => void = () => {};
    const fetch = vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise((done) => (resolve = done)));
    render(<ContactForm />);
    fillIn();
    send();
    fireEvent.click(screen.getByRole("button", { name: "Sending…" }));
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => resolve(ok()));
    expect(await screen.findByRole("status")).toBeTruthy();
  });
});
