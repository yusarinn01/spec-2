import { describe, expect, it } from "vitest";
import { buildMonthGrid, formatLong, toKey } from "./dates";

describe("dates", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("builds a month grid padded to whole weeks", () => {
    const grid = buildMonthGrid(2026, 9); 
    expect(grid.length % 7).toBe(0);
    expect(grid.slice(0, 4)).toEqual([null, null, null, null]);
    expect(grid[4]).toBe("2026-10-01");
    expect(grid.filter(Boolean)).toHaveLength(31);
  });

  it("handles leap-year February", () => {
    expect(buildMonthGrid(2028, 1).filter(Boolean)).toHaveLength(29);
  });

  it("formats long dates", () => {
    expect(formatLong("2026-10-30")).toContain("October 30, 2026");
  });
});
