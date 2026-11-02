import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TasksPage from "./TasksPage";
import { getStatus } from "../utils/tasks";

const today = "2026-10-30";
const raw = [
  { id: "1", title: "Spray pesticide", type: "pest", dueDate: "2026-10-27", notes: "", done: false },
  { id: "2", title: "Water Palayan A", type: "watering", dueDate: "2026-10-30", notes: "", done: false },
  { id: "3", title: "Inspect canal", type: "other", dueDate: "2026-10-30", notes: "", done: true },
  { id: "4", title: "Harvest Palayan A", type: "harvest", dueDate: "2026-11-12", notes: "", done: false },
];
const tasks = raw.map((t) => ({ ...t, status: getStatus(t, today) }));

const setup = (props = {}) => {
  const onDeleteMany = vi.fn(() => true);
  render(
    <TasksPage
      tasks={tasks}
      today={today}
      onAdd={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onToggle={vi.fn()}
      onDeleteMany={onDeleteMany}
      {...props}
    />
  );
  return { onDeleteMany };
};

afterEach(cleanup);

describe("TasksPage select and delete", () => {
  it("deletes only the tasks that were selected", () => {
    const { onDeleteMany } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Spray pesticide" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Inspect canal" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected (2)" }));
    expect(onDeleteMany).toHaveBeenCalledWith(["1", "3"]);
  });

  it("selects a task when its whole card is pressed", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(screen.getByText("Water Palayan A"));
    expect(screen.getByRole("button", { name: "Delete selected (1)" })).toBeTruthy();
  });

  it("disables 'Delete selected' until something is picked", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    expect(screen.getByRole("button", { name: "Delete selected (0)" }).disabled).toBe(true);
  });

  it("'Select all' picks every task, and 'Clear selection' undoes it", () => {
    const { onDeleteMany } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByRole("button", { name: "Delete selected (4)" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("button", { name: "Delete selected (0)" })).toBeTruthy();
    expect(onDeleteMany).not.toHaveBeenCalled();
  });

  it("'Select all' only picks tasks shown by the current status filter", () => {
    const { onDeleteMany } = setup();
    fireEvent.click(screen.getByRole("button", { name: /^Done/ }));
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected (1)" }));
    expect(onDeleteMany).toHaveBeenCalledWith(["3"]);
  });

  it("'Delete all' passes every task id and flags it as delete-all", () => {
    const { onDeleteMany } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Delete all (4)" }));
    expect(onDeleteMany).toHaveBeenCalledWith(["1", "2", "3", "4"], true);
  });

  it("'Delete all' ignores the status filter", () => {
    const { onDeleteMany } = setup();
    fireEvent.click(screen.getByRole("button", { name: /^Done/ }));
    fireEvent.click(screen.getByRole("button", { name: "Delete all (4)" }));
    expect(onDeleteMany).toHaveBeenCalledWith(["1", "2", "3", "4"], true);
  });

  it("stays in select mode when the confirmation is cancelled", () => {
    const { onDeleteMany } = setup({ onDeleteMany: vi.fn(() => false) });
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected (4)" }));
    expect(screen.getByRole("button", { name: "Delete selected (4)" })).toBeTruthy();
  });

  it("leaves select mode after Cancel and hides the add button while selecting", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    expect(screen.queryByRole("button", { name: "Add task" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Add task" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Delete selected/ })).toBeNull();
  });

  it("disables Select and Delete all when there are no tasks", () => {
    setup({ tasks: [] });
    expect(screen.getByRole("button", { name: "Select" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Delete all (0)" }).disabled).toBe(true);
  });
});
