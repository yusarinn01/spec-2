import { useMemo, useState } from "react";
import { MONTHS, buildMonthGrid, formatLong } from "../utils/dates";
import { StatusChips, TaskList, countByStatus } from "../components/TaskList";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage({ tasks, today, onAdd, onEdit, onDelete, onToggle }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(today); // null = every date
  const [status, setStatus] = useState("all");

  const grid = useMemo(() => buildMonthGrid(cursor.y, cursor.m), [cursor]);

  const statusesByDate = useMemo(() => {
    const map = {};
    for (const t of tasks) (map[t.dueDate] ??= new Set()).add(t.status);
    return map;
  }, [tasks]);

  const scoped = selected ? tasks.filter((t) => t.dueDate === selected) : tasks;
  const counts = countByStatus(scoped);
  const visible = status === "all" ? scoped : scoped.filter((t) => t.status === status);

  function moveMonth(delta) {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  }

  function goToday() {
    const d = new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(today);
  }

  return (
    <div className="cal-layout">
      <section className="card calendar" aria-label="Calendar">
        <div className="cal-head">
          <button className="icon-btn" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button>
          <h2>{MONTHS[cursor.m]} {cursor.y}</h2>
          <button className="icon-btn" onClick={() => moveMonth(1)} aria-label="Next month">›</button>
        </div>

        <div className="cal-grid">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal-dow">{w[0]}</span>
          ))}
          {grid.map((key, i) => {
            if (!key) return <span key={i} />;
            const statuses = statusesByDate[key];
            const cls = [
              "cal-day",
              key === today ? "today" : "",
              key === selected ? "selected" : "",
            ].join(" ");
            return (
              <button
                key={key}
                className={cls}
                onClick={() => setSelected(key === selected ? null : key)}
                aria-pressed={key === selected}
                aria-label={formatLong(key)}
              >
                {Number(key.slice(8))}
                <span className="dots">
                  {["overdue", "pending", "done"].map(
                    (s) => statuses?.has(s) && <i key={s} className={`dot ${s}`} />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="cal-foot">
          <div className="legend">
            <span><i className="dot pending" /> Pending</span>
            <span><i className="dot overdue" /> Overdue</span>
            <span><i className="dot done" /> Done</span>
          </div>
          <button className="btn small" onClick={goToday}>Today</button>
        </div>
      </section>

      <div className="cal-side">
      <div className="list-head">
        <h3>{selected ? formatLong(selected) : "All dates"}</h3>
        <div className="list-actions">
          {selected && (
            <button className="btn link small" onClick={() => setSelected(null)}>
              Show all dates
            </button>
          )}
          <button className="btn primary small add-desktop" onClick={() => onAdd(selected ?? today)}>
            + New task
          </button>
        </div>
      </div>

      <StatusChips value={status} onChange={setStatus} counts={counts} />

      <TaskList
        tasks={visible}
        showDate={!selected}
        emptyText={
          selected
            ? "Nothing scheduled for this day. Tap + to add a task."
            : "No tasks match this filter."
        }
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
      </div>

      <button className="fab" onClick={() => onAdd(selected ?? today)} aria-label="Add task">+</button>
    </div>
  );
}
