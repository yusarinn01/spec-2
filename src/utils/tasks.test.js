import { describe, expect, it } from "vitest";
import { getStatus, typeLabel } from "./tasks";

const today = "2026-10-30";

describe("getStatus", () => {
  it("is done whenever the task is checked off, even if the date has passed", () => {
    expect(getStatus({ done: true, dueDate: "2026-10-01" }, today)).toBe("done");
  });
  it("is overdue when not done and before today", () => {
    expect(getStatus({ done: false, dueDate: "2026-10-29" }, today)).toBe("overdue");
  });
  it("is pending when due today", () => {
    expect(getStatus({ done: false, dueDate: "2026-10-30" }, today)).toBe("pending");
  });
  it("is pending when due in the future", () => {
    expect(getStatus({ done: false, dueDate: "2026-11-02" }, today)).toBe("pending");
  });
});

describe("typeLabel", () => {
  it("maps known types and falls back to Other", () => {
    expect(typeLabel("pest")).toBe("Pest control");
    expect(typeLabel("unknown")).toBe("Other");
  });
});
