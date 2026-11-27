import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { App } from "./App";
import { freeDiscoveryApi } from "./features/free-discovery/api";

vi.mock("@/lib/config", () => ({
  config: { apiUrl: "https://api.nucla.test", turnstileSiteKey: "site-key" },
  freeDiscoveryEnabled: true,
}));
vi.mock("./features/free-discovery/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./features/free-discovery/api")>()),
  freeDiscoveryApi: { lenses: vi.fn(), start: vi.fn(), status: vi.fn(), step: vi.fn(async () => undefined) },
}));

beforeEach(() => {
  vi.mocked(freeDiscoveryApi.lenses).mockResolvedValue([
    { key: "acquisition_generic", name: "Acquisition", description: "" },
  ]);
});

function CurrentUrl() {
  const { pathname, search, hash } = useLocation();
  return <output aria-label="Current URL">{pathname}{search}{hash}</output>;
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <CurrentUrl />
    </MemoryRouter>,
  );
}

describe("with the free discovery settings", () => {
  it.each(["/free-discovery", "/free-discovery.html"])("redirects %s to the homepage form", async (path) => {
    renderAt(path);
    expect(screen.getByLabelText("Current URL").textContent).toBe("/#discovery");
    expect(screen.getByRole("heading", { name: /try a discovery now/i })).toBeTruthy();
    expect(await screen.findByRole("radio", { name: "Acquisition" })).toBeTruthy();
  });

  it.each(["/#discovery", "/#discover"])("focuses the search input for %s", async (path) => {
    renderAt(path);
    await screen.findByRole("radio", { name: "Acquisition" });
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Describe the companies you are looking for" }));
  });

  it("is on the home page and in the footer", async () => {
    renderAt("/");
    const link = screen.getByRole("link", { name: "Try a free discovery" });
    expect(link.getAttribute("href")).toBe("/#discovery");
    expect(document.activeElement).not.toBe(screen.getByRole("textbox", { name: "Describe the companies you are looking for" }));
    expect(screen.getByRole("heading", { name: /try a discovery now/i })).toBeTruthy();
    expect(within(screen.getByRole("navigation", { name: "Footer" })).getByRole("link", { name: "Free discovery" }).getAttribute("href")).toBe("/#discovery");
    await screen.findByRole("radio", { name: "Acquisition" });
    fireEvent.click(link);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Describe the companies you are looking for" }));
  });
});
