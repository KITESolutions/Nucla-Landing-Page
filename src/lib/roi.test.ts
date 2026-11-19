import { formatCount, hoursBack } from "./roi";

describe("hoursBack", () => {
  it("matches the calculator's defaults: 1,000 a year, 25 minutes, 30 minutes of prep", () => {
    const result = hoursBack({ companiesPerYear: 1000, minutesPerPass: 25, prepMinutes: 30 });
    expect(formatCount(result.review)).toBe("283");
    expect(formatCount(result.calls)).toBe("50");
    expect(formatCount(result.total)).toBe("333");
    expect(result.weeks.toFixed(1)).toBe("8.3");
  });

  it("gives the home page sentence its 289 hours for 85 a month at 25 minutes", () => {
    const { review } = hoursBack({ companiesPerYear: 85 * 12, minutesPerPass: 25, prepMinutes: 0 });
    expect(formatCount(review)).toBe("289");
  });

  it("is zero with nothing to review", () => {
    expect(hoursBack({ companiesPerYear: 0, minutesPerPass: 25, prepMinutes: 30 }).total).toBe(0);
  });
});

describe("formatCount", () => {
  it("rounds and groups thousands", () => {
    expect(formatCount(12345.6)).toBe("12,346");
  });
});
