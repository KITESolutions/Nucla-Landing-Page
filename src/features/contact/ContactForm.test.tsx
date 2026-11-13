import { act, fireEvent, render, screen } from "@testing-library/react";

import { ContactForm } from "./ContactForm";
import { SUBMIT_URL } from "./hubspot";

const ok = () => new Response(JSON.stringify({ inlineMessage: "Thanks" }), { status: 200 });
const refused = (errorType: string) =>
  new Response(JSON.stringify({ status: "error", errors: [{ errorType, message: "no" }] }), { status: 400 });

const field = (name: string) => screen.getByLabelText(name) as HTMLInputElement;
const type = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const send = () => fireEvent.click(screen.getByRole("button", { name: "Send message →" }));

function fillIn() {
  type("Full name", "Ana María Ruiz");
  type("Work email", "ana@acme.com");
  type("Company", "Acme");
  type("Role", "Head of Corporate Ventures");
}

describe("the contact form", () => {
  it("asks for each required field and sends nothing until they're filled in", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(<ContactForm />);
    send();

    expect(screen.getByText("Enter your name.")).toBeTruthy();
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    expect(screen.getByText("Enter your company.")).toBeTruthy();
    expect(screen.getByText("Enter your role.")).toBeTruthy();
    expect(field("Full name").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field("Full name"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks for a work email", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(<ContactForm />);
    fillIn();
    type("Work email", "ana@Gmail.com");
    send();

    expect(screen.getByText("Use your work email.")).toBeTruthy();
    expect(document.activeElement).toBe(field("Work email"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the message to HubSpot with the topic, company and role in it, then thanks the visitor", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(ok());
    render(<ContactForm />);
    fireEvent.click(screen.getByLabelText("Partnership"));
    fillIn();
    type("Message (optional)", "We review 400 companies a year.");
    send();

    expect(await screen.findByText("Thanks, we've got your message.")).toBeTruthy();
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
      { objectTypeId: "0-1", name: "lastname", value: "María Ruiz" },
      { objectTypeId: "0-1", name: "email", value: "ana@acme.com" },
      {
        objectTypeId: "0-1",
        name: "message",
        value:
          "What can we help with: Partnership\nCompany: Acme\nRole: Head of Corporate Ventures\n\nWe review 400 companies a year.",
      },
    ]);
    expect(body.context).toEqual({ pageUri: window.location.href, pageName: document.title });
  });

  it("starts on Book a demo and says when there was no message", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(ok());
    render(<ContactForm />);
    expect((screen.getByLabelText("Book a demo") as HTMLInputElement).checked).toBe(true);
    fillIn();
    send();

    await screen.findByText("Thanks, we've got your message.");
    const message = JSON.parse(String(fetch.mock.calls[0][1]?.body)).fields[3].value;
    expect(message).toBe("What can we help with: Book a demo\nCompany: Acme\nRole: Head of Corporate Ventures\n\n(No message)");
  });

  it("shows HubSpot's email refusal on the email field and keeps what was typed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(refused("BLOCKED_FREE_EMAIL"));
    render(<ContactForm />);
    fillIn();
    send();

    expect(await screen.findByText("Use your work email.")).toBeTruthy();
    expect(field("Company").value).toBe("Acme");
    expect(screen.getByRole("button", { name: "Send message →" })).toBeTruthy();
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
    expect(field("Full name").value).toBe("Ana María Ruiz");
    expect((screen.getByRole("button", { name: "Send message →" }) as HTMLButtonElement).disabled).toBe(false);
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
    expect(await screen.findByText("Thanks, we've got your message.")).toBeTruthy();
  });
});
