import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { App } from "./App";

// Built without the free discovery settings, as the site deploys before the API is live.
vi.mock("@/lib/config", () => ({ config: { apiUrl: "", turnstileSiteKey: "" }, freeDiscoveryEnabled: false }));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

const heading = () => screen.getByRole("heading", { level: 1 }).textContent;

describe("the site", () => {
  it.each([
    ["/", "Find your next best investment. Assess every opportunity faster."],
    ["/how-it-works", "Other AI tools know the market. Nucla knows your relationship context."],
    ["/roi-calculator", "What your team gets back in a year."],
    ["/contact", "Let's talk about your deal flow."],
    ["/no-such-page", "This page isn't here."],
  ])("renders %s", (path, title) => {
    renderAt(path);
    expect(heading()).toBe(title);
  });

  it.each([
    ["/contact.html", "Let's talk about your deal flow."],
    ["/how-it-works.html", "Other AI tools know the market. Nucla knows your relationship context."],
    ["/index.html", "Find your next best investment. Assess every opportunity faster."],
  ])("answers the old site's and the redesign's link %s", (path, title) => {
    renderAt(path);
    expect(heading()).toBe(title);
  });

  it("opens the contact page for the old site's demo link", () => {
    renderAt("/#book");
    expect(heading()).toBe("Let's talk about your deal flow.");
  });

  it("names each page in the tab title", () => {
    renderAt("/how-it-works");
    expect(document.title).toBe("How it works · Nucla");
  });

  it("sends every Book a demo to the contact form", () => {
    renderAt("/how-it-works");
    for (const link of screen.getAllByRole("link", { name: /book a demo/i })) {
      expect(link.getAttribute("href")).toBe("/contact#contact-form");
    }
  });
});

describe("without the free discovery settings", () => {
  it("leaves free discovery out of the home page and the footer", () => {
    renderAt("/");
    expect(screen.queryByRole("link", { name: "Try a free discovery →" })).toBeNull();
    expect(screen.queryByRole("heading", { name: /try a discovery now/i })).toBeNull();
    expect(within(screen.getByRole("navigation", { name: "Footer" })).queryByText("Free discovery")).toBeNull();
  });

  it.each(["/free-discovery", "/free-discovery.html"])("sends %s to the home page", (path) => {
    renderAt(path);
    expect(heading()).toBe("Find your next best investment. Assess every opportunity faster.");
  });
});

describe("the ROI calculator", () => {
  it("recomputes as the numbers change and resets to 1,000 a year", () => {
    renderAt("/roi-calculator");
    const total = () => screen.getByText("Hours back per year").nextElementSibling?.textContent;
    expect(total()).toBe("333");

    fireEvent.change(screen.getByRole("slider", { name: "Minutes per first pass" }), { target: { value: "50" } });
    expect(total()).toBe("617");

    fireEvent.click(screen.getByRole("button", { name: "Per month" }));
    const companies = screen.getByRole("slider", { name: "Companies reviewed per month" }) as HTMLInputElement;
    expect(companies.value).toBe("83");

    fireEvent.click(screen.getByRole("button", { name: "Reset to 1,000 a year" }));
    expect(total()).toBe("333");
  });
});

describe("the home ROI sentence", () => {
  it("updates the hours from the visitor's numbers", () => {
    renderAt("/");
    fireEvent.change(screen.getByRole("textbox", { name: "Companies per month" }), { target: { value: "1a00" } });
    expect((screen.getByRole("textbox", { name: "Companies per month" }) as HTMLInputElement).value).toBe("100");
    expect(screen.getByRole("status").textContent).toBe("340");
  });
});
