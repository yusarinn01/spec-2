import { useEffect, useState } from "react";
import { TASK_TYPES } from "../utils/tasks";
export default function TaskModal({ modal, onSave, onClose }) {
  const editing = Boolean(modal.task);
  const NOTES_MAX = 200;
  const [form, setForm] = useState({
    title: modal.task?.title ?? "",
    type: modal.task?.type ?? "watering",
    dueDate: modal.task?.dueDate ?? modal.date,
    notes: modal.task?.notes ?? "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Enter a task title.");
    if (!form.dueDate) return setError("Pick a due date.");
    onSave({
      title: form.title.trim(),
      type: form.type,
      dueDate: form.dueDate,
      notes: form.notes.trim(),
    });
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit task" : "New task"}
      >
        <div className="sheet-head">
          <h2>{editing ? "Edit task" : "New task"}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <label>
          Title
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Water Palayan A"
          />
        </label>

        <fieldset>
          <legend>Type</legend>
          <div className="chips">
            {TASK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`chip ${form.type === t.value ? "on" : ""}`}
                aria-pressed={form.type === t.value}
                onClick={() => setForm({ ...form, type: t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          Due date
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </label>

        <label>
          Notes (optional)
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            maxLength={NOTES_MAX}
            placeholder="e.g. Use 2 liters of water"
          />
          <span className="char-count">
            {form.notes.length}/{NOTES_MAX}
          </span>
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn primary">
          {editing ? "Save changes" : "Add task"}
        </button>
      </form>
    </div>
  );
}
