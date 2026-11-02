import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TaskModal from "./TaskModal";

afterEach(cleanup);

describe("TaskModal", () => {
  it("rejects an empty title", () => {
    const onSave = vi.fn();
    render(<TaskModal modal={{ date: "2026-10-30" }} onSave={onSave} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByRole("alert").textContent).toMatch(/title/i);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves a new task with the chosen type and the preset date", () => {
    const onSave = vi.fn();
    render(<TaskModal modal={{ date: "2026-10-30" }} onSave={onSave} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "  Water field  " } });
    fireEvent.click(screen.getByRole("button", { name: "Fertilizing" }));
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onSave).toHaveBeenCalledWith({
      title: "Water field",
      type: "fertilizing",
      dueDate: "2026-10-30",
      notes: "",
    });
  });

  it("pre-fills when editing", () => {
    const task = { id: "9", title: "Harvest", type: "harvest", dueDate: "2026-11-12", notes: "Bring sacks" };
    render(<TaskModal modal={{ task }} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByLabelText(/Title/).value).toBe("Harvest");
    expect(screen.getByLabelText(/Due date/).value).toBe("2026-11-12");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<TaskModal modal={{ date: "2026-10-30" }} onSave={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
