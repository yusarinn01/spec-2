export default function TopTabs({ view, onChange }) {
  return (
    <nav className="top-tabs" aria-label="Sections">
      <button className={view === "calendar" ? "on" : ""} onClick={() => onChange("calendar")}>
        Calendar
      </button>
      <button className={view === "tasks" ? "on" : ""} onClick={() => onChange("tasks")}>
        Tasks
      </button>
    </nav>
  );
}
