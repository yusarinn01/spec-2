import { STATUS_LABEL, typeLabel } from "../utils/tasks";
import { formatShort } from "../utils/dates";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "done", label: "Done" },
];

export function StatusChips({ value, onChange, counts }) {
  return (
    <div className="chips" role="group" aria-label="Filter by status">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={`chip ${f.value} ${value === f.value ? "on" : ""}`}
          aria-pressed={value === f.value}
          onClick={() => onChange(f.value)}
        >
          {f.label} <span className="count">{counts[f.value]}</span>
        </button>
      ))}
    </div>
  );
}

function TaskCard({ task, showDate, selectMode, selected, onSelect, onToggle, onEdit, onDelete }) {
  return (
    <li
      className={`task ${task.status} ${selectMode ? "selectable" : ""} ${selected ? "selected" : ""}`}
      onClick={selectMode ? () => onSelect(task.id) : undefined}
    >
      {selectMode ? (
        <button
          className={`select-box ${selected ? "on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(task.id);
          }}
          aria-pressed={selected}
          aria-label={`Select ${task.title}`}
        >
          {selected ? "✓" : ""}
        </button>
      ) : (
        <button
          className="check"
          onClick={() => onToggle(task)}
          aria-pressed={task.done}
          aria-label={task.done ? `Mark ${task.title} as pending` : `Mark ${task.title} as done`}
        >
          {task.done ? "✓" : ""}
        </button>
      )}

      <div className="task-body">
        <p className="task-title">{task.title}</p>
        <p className="task-meta">
          <span>{typeLabel(task.type)}</span>
          {showDate && <span>Due {formatShort(task.dueDate)}</span>}
        </p>
        {task.notes && <p className="task-notes">{task.notes}</p>}
      </div>

      <div className="task-side">
        <span className={`badge ${task.status}`}>{STATUS_LABEL[task.status]}</span>
        {!selectMode && (
          <div className="task-actions">
            <button className="mini" onClick={() => onEdit(task)}>Edit</button>
            <button className="mini danger" onClick={() => onDelete(task)}>Delete</button>
          </div>
        )}
      </div>
    </li>
  );
}

export function TaskList({ tasks, showDate, emptyText, selectedIds, ...handlers }) {
  if (tasks.length === 0) return <p className="empty">{emptyText}</p>;
  return (
    <ul className="tasks">
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          showDate={showDate}
          selected={selectedIds?.has(t.id) ?? false}
          {...handlers}
        />
      ))}
    </ul>
  );
}

export function countByStatus(tasks) {
  return {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
}
