const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);

export default function BottomNav({ view, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <button className={view === "calendar" ? "on" : ""} onClick={() => onChange("calendar")}>
        <CalendarIcon /> Calendar
      </button>
      <button className={view === "tasks" ? "on" : ""} onClick={() => onChange("tasks")}>
        <ListIcon /> Tasks
      </button>
    </nav>
  );
}
