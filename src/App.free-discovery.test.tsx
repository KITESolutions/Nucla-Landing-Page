import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("with the free discovery settings", () => {
  it.each(["/free-discovery", "/free-discovery.html"])("has its own page at %s", async (path) => {
    renderAt(path);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Discover new companies scored against your thesis.",
    );
    expect(await screen.findByRole("button", { name: "Acquisition" })).toBeTruthy();
  });

  it("is on the home page and in the footer", async () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "Try a free discovery →" }).getAttribute("href")).toBe("#discover");
    expect(screen.getByRole("heading", { name: /try a discovery now/i })).toBeTruthy();
    expect(within(screen.getByRole("navigation", { name: "Footer" })).getByText("Free discovery")).toBeTruthy();
    await screen.findByRole("button", { name: "Acquisition" });
  });
});
