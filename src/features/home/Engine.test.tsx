import { act, fireEvent, render, screen } from "@testing-library/react";

import { Engine } from "./Engine";

const openStep = () => screen.getByRole("region").getAttribute("aria-label");

describe("the engine cards", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("advance on their own until a visitor picks one, then stay on it", () => {
    render(<Engine />);
    expect(openStep()).toBe("Discover");
    act(() => vi.advanceTimersByTime(6000));
    expect(openStep()).toBe("Assess");

    fireEvent.click(screen.getByRole("button", { name: "Show Report" }));
    expect(openStep()).toBe("Report");
    act(() => vi.advanceTimersByTime(18000));
    expect(openStep()).toBe("Report");
  });

  it("stop once keyboard focus is in them, so the focused card never closes", () => {
    render(<Engine />);
    const assess = screen.getByRole("button", { name: "Show Assess" });
    act(() => assess.focus());
    act(() => vi.advanceTimersByTime(18000));
    expect(openStep()).toBe("Discover");
    expect(document.activeElement).toBe(assess);
  });
});
