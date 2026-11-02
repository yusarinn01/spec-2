import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import { getStatus } from "./utils/tasks";
import { formatLong } from "./utils/dates";
import { useToday } from "./hooks/useToday";
import { useTasks } from "./hooks/useTasks";
import AuthScreen from "./pages/AuthScreen.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import TaskModal from "./components/TaskModal.jsx";
import Sidebar from "./components/Sidebar.jsx";
import BottomNav from "./components/BottomNav.jsx";
import TopTabs from "./components/TopTabs.jsx";

const TITLES = { calendar: "Calendar", tasks: "Tasks", profile: "Profile" };

export default function App() {
  const [user, setUser] = useState(undefined); 
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("calendar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const today = useToday();

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (!u) {
          setProfile(null);
          setView("calendar");
          setMenuOpen(false);
          setModal(null);
        }
      }),
    []
  );

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snap) =>
      setProfile(snap.exists() ? snap.data() : null)
    );
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const { tasks: rawTasks, loading, error, addTask, updateTask, removeTask, removeMany, toggleDone } =
    useTasks(user?.uid);

  const tasks = useMemo(
    () => rawTasks.map((t) => ({ ...t, status: getStatus(t, today) })),
    [rawTasks, today]
  );

  if (user === undefined) return <div className="loading-screen">Loading...</div>;
  if (!user) return <AuthScreen />;

  const name = profile?.fullName || user.displayName || user.email;

  async function run(action, successMsg) {
    try {
      await action();
      if (successMsg) setToast(successMsg);
    } catch {
      setToast("Something went wrong. Check your connection and try again.");
    }
  }

  function saveTask(data) {
    const editing = modal.task;
    setModal(null);
    run(
      () => (editing ? updateTask(editing.id, data) : addTask(data)),
      editing ? "Task updated." : "Task added."
    );
  }

  function deleteTask(task) {
    if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
      run(() => removeTask(task.id), "Task deleted.");
    }
  }

  function deleteMany(ids, all = false) {
    if (ids.length === 0) return false;
    const msg = all
      ? `Delete all ${ids.length} task${ids.length === 1 ? "" : "s"}? This can't be undone.`
      : `Delete ${ids.length} selected task${ids.length === 1 ? "" : "s"}? This can't be undone.`;
    if (!window.confirm(msg)) return false;
    run(() => removeMany(ids), `${ids.length} task${ids.length === 1 ? "" : "s"} deleted.`);
    return true;
  }

  const pageProps = {
    tasks,
    today,
    onAdd: (date) => setModal({ date }),
    onEdit: (task) => setModal({ task }),
    onDelete: deleteTask,
    onDeleteMany: deleteMany,
    onToggle: (task) => run(() => toggleDone(task)),
  };

  const go = (v) => {
    setView(v);
    setMenuOpen(false);
  };

  return (
    <div className="app">
      <Sidebar
        open={menuOpen}
        name={name}
        subtitle={profile?.location || user.email}
        view={view}
        onProfile={() => go("profile")}
        onLogout={() => signOut(auth)}
        onClose={() => setMenuOpen(false)}
      />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn light menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <h1>{TITLES[view]}</h1>
          <TopTabs view={view} onChange={go} />
          <span className="top-date">{formatLong(today)}</span>
        </header>

        <main className="content">
          <div className="content-inner">
            {error && (
              <p className="form-error" role="alert">
                Couldn't load your tasks: {error}
              </p>
            )}
            {view === "profile" ? (
              <ProfilePage user={user} profile={profile} onSaved={setToast} onError={setToast} />
            ) : loading ? (
              <p className="empty">Loading your tasks...</p>
            ) : view === "calendar" ? (
              <CalendarPage {...pageProps} />
            ) : (
              <TasksPage {...pageProps} />
            )}
          </div>
        </main>

        <BottomNav view={view} onChange={go} />
      </div>

      {modal && <TaskModal modal={modal} onSave={saveTask} onClose={() => setModal(null)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
