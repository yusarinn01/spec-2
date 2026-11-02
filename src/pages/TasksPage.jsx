import { useMemo, useState } from "react";
import { StatusChips, TaskList, countByStatus } from "../components/TaskList";

export default function TasksPage({
  tasks, today, onAdd, onEdit, onDelete, onDeleteMany, onToggle,
}) {
  const [status, setStatus] = useState("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const counts = countByStatus(tasks);
  const visible = status === "all" ? tasks : tasks.filter((t) => t.status === status);
  const selectedIds = useMemo(
    () => new Set(tasks.filter((t) => selected.has(t.id)).map((t) => t.id)),
    [tasks, selected]
  );
  const allVisibleSelected = visible.length > 0 && visible.every((t) => selectedIds.has(t.id));

  function toggleOne(id) {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  function toggleAllVisible() {
    setSelected(allVisibleSelected ? new Set() : new Set(visible.map((t) => t.id)));
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function deleteSelected() {
    if (onDeleteMany([...selectedIds])) exitSelectMode();
  }

  function deleteAll() {
    onDeleteMany(tasks.map((t) => t.id), true);
  }

  return (
    <div className="page-tasks">
      <div className="stats" aria-label="Task summary">
        <div className="stat all"><strong>{counts.all}</strong><span>Total tasks</span></div>
        <div className="stat pending"><strong>{counts.pending}</strong><span>Pending</span></div>
        <div className="stat overdue"><strong>{counts.overdue}</strong><span>Overdue</span></div>
        <div className="stat done"><strong>{counts.done}</strong><span>Completed</span></div>
      </div>

      <div className="toolbar">
        {selectMode ? (
          <>
            <button className="btn small" onClick={toggleAllVisible} disabled={visible.length === 0}>
              {allVisibleSelected ? "Clear selection" : "Select all"}
            </button>
            <button
              className="btn small danger-solid"
              onClick={deleteSelected}
              disabled={selectedIds.size === 0}
            >
              Delete selected ({selectedIds.size})
            </button>
            <button className="btn small" onClick={exitSelectMode}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn small" onClick={() => setSelectMode(true)} disabled={tasks.length === 0}>
              Select
            </button>
            <button className="btn small danger-outline" onClick={deleteAll} disabled={tasks.length === 0}>
              Delete all ({tasks.length})
            </button>
            <button className="btn primary small add-desktop" onClick={() => onAdd(today)}>
              + New task
            </button>
          </>
        )}
      </div>

      <StatusChips value={status} onChange={setStatus} counts={counts} />

      <TaskList
        tasks={visible}
        showDate
        selectMode={selectMode}
        selectedIds={selectedIds}
        onSelect={toggleOne}
        emptyText={
          tasks.length === 0
            ? "No tasks yet. Tap + to add your first one."
            : "No tasks match this filter."
        }
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />

      {!selectMode && (
        <button className="fab" onClick={() => onAdd(today)} aria-label="Add task">+</button>
      )}
    </div>
  );
}
