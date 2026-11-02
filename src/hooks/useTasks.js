import { useEffect, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc, writeBatch,
} from "firebase/firestore";
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
    const q = query(collection(db, "users", uid, "tasks"), orderBy("dueDate"));
    return onSnapshot(
      q,
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError("");
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [uid]);

  const taskDoc = (id) => doc(db, "users", uid, "tasks", id);

  const addTask = (data) =>
    addDoc(collection(db, "users", uid, "tasks"), {
      ...data,
      done: false,
      completedAt: null,
      createdAt: serverTimestamp(),
    });

  const updateTask = (id, data) => updateDoc(taskDoc(id), data);

  const removeTask = (id) => deleteDoc(taskDoc(id));

  const removeMany = async (ids) => {
    for (let i = 0; i < ids.length; i += 400) {
      const batch = writeBatch(db);
      ids.slice(i, i + 400).forEach((id) => batch.delete(taskDoc(id)));
      await batch.commit();
    }
  };

  const toggleDone = (task) =>
    updateDoc(taskDoc(task.id), {
      done: !task.done,
      completedAt: task.done ? null : todayKey(),
    });

  return { tasks, loading, error, addTask, updateTask, removeTask, removeMany, toggleDone };
}
