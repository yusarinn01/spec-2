import { useEffect, useState } from "react";
import {
  onValue, orderByChild, push, query, ref, remove, serverTimestamp, set, update,
} from "firebase/database";
import { db } from "../firebase/config";
import { todayKey } from "../utils/dates";

export function useTasks(uid) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      return;
    }
    setLoading(true);
    const q = query(ref(db, `tasks/${uid}`), orderByChild("dueDate"));
    return onValue(
      q,
      (snap) => {
        const list = [];
        snap.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
        setTasks(list);
        setError("");
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [uid]);

  const taskRef = (id) => ref(db, `tasks/${uid}/${id}`);

  const addTask = (data) =>
    set(push(ref(db, `tasks/${uid}`)), {
      ...data,
      done: false,
      completedAt: null,
      createdAt: serverTimestamp(),
    });

  const updateTask = (id, data) => update(taskRef(id), data);

  const removeTask = (id) => remove(taskRef(id));

  const removeMany = async (ids) => {
    for (let i = 0; i < ids.length; i += 400) {
      const updates = {};
      ids.slice(i, i + 400).forEach((id) => {
        updates[`tasks/${uid}/${id}`] = null;
      });
      await update(ref(db), updates);
    }
  };

  const toggleDone = (task) =>
    update(taskRef(task.id), {
      done: !task.done,
      completedAt: task.done ? null : todayKey(),
    });

  return { tasks, loading, error, addTask, updateTask, removeTask, removeMany, toggleDone };
}
