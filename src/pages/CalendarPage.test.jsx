import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import CalendarPage from "./CalendarPage";
import { getStatus } from "../utils/tasks";

const today = "2026-10-30";
const raw = [
  { id: "1", title: "Spray pesticide", type: "pest", dueDate: "2026-10-27", notes: "", done: false },
  { id: "2", title: "Water Palayan A", type: "watering", dueDate: "2026-10-30", notes: "", done: false },
  { id: "3", title: "Inspect canal", type: "other", dueDate: "2026-10-30", notes: "", done: true },
  { id: "4", title: "Harvest Palayan A", type: "harvest", dueDate: "2026-11-12", notes: "", done: false },
];
const tasks = raw.map((t) => ({ ...t, status: getStatus(t, today) }));

const setup = (extra = {}) =>
  render(
    <CalendarPage
      tasks={tasks}
      today={today}
      onAdd={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onToggle={vi.fn()}
      {...extra}
    />
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 30, 10));
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("CalendarPage", () => {
  it("opens on today and lists only today's tasks", () => {
    setup();
    expect(screen.getByText("Water Palayan A")).toBeTruthy();
    expect(screen.getByText("Inspect canal")).toBeTruthy();
    expect(screen.queryByText("Spray pesticide")).toBeNull();
  });

  it("filters the list when another date is pressed", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /October 27, 2026/ }));
    expect(screen.getByText("Spray pesticide")).toBeTruthy();
    expect(screen.queryByText("Water Palayan A")).toBeNull();
  });

  it("shows every task after pressing the selected date again or 'Show all dates'", () => {
    setup();
    fireEvent.click(screen.getByText("Show all dates"));
    expect(screen.getByText("Spray pesticide")).toBeTruthy();
    expect(screen.getByText("Harvest Palayan A")).toBeTruthy();
  });

  it("combines the date filter with the status filter", () => {
    setup();
    const chips = screen.getByRole("group", { name: /filter by status/i });
    fireEvent.click(within(chips).getByText(/^Done/));
    expect(screen.getByText("Inspect canal")).toBeTruthy();
    expect(screen.queryByText("Water Palayan A")).toBeNull();
  });

  it("shows status counts for the selected scope", () => {
    setup();
    const chips = screen.getByRole("group", { name: /filter by status/i });
    expect(within(chips).getByText(/^All/).textContent).toContain("2");
    expect(within(chips).getByText(/^Pending/).textContent).toContain("1");
    expect(within(chips).getByText(/^Done/).textContent).toContain("1");
    expect(within(chips).getByText(/^Overdue/).textContent).toContain("0");
  });

  it("shows an empty message for a day with no tasks", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /October 5, 2026/ }));
    expect(screen.getByText(/Nothing scheduled for this day/)).toBeTruthy();
  });

  it("adds a task on the selected date", () => {
    const onAdd = vi.fn();
    setup({ onAdd });
    fireEvent.click(screen.getByRole("button", { name: /October 27, 2026/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAdd).toHaveBeenCalledWith("2026-10-27");
  });

  it("calls toggle, edit and delete handlers", () => {
    const h = { onToggle: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
    setup(h);
    fireEvent.click(screen.getByRole("button", { name: /Mark Water Palayan A as done/ }));
    expect(h.onToggle).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(h.onEdit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(h.onDelete).toHaveBeenCalledTimes(1);
  });
});
