import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { authMessage } from "../utils/authErrors";
import logo from "../assets/logo.svg";

const EMPTY = { fullName: "", location: "", email: "", password: "", confirm: "" };

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
    setForm(EMPTY);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (isRegister) {
      if (!form.fullName.trim()) return setError("Enter your full name.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirm) return setError("Passwords do not match.");
    }

    setBusy(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        await updateProfile(cred.user, { displayName: form.fullName.trim() });
        await setDoc(doc(db, "users", cred.user.uid), {
          fullName: form.fullName.trim(),
          location: form.location.trim(),
          farmSize: "",
          mainCrop: "",
          email: cred.user.email,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      }
    } catch (err) {
      setError(authMessage(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-hero">
        <img className="auth-logo" src={logo} alt="" />
        <h1>AgriJuan</h1>
        <p>Plan your farm work, one day at a time.</p>
        <ul className="auth-points">
          <li>See every task on a calendar</li>
          <li>Track what is pending, done or overdue</li>
          <li>Your tasks stay private to your account</li>
        </ul>
      </div>

      <main className="auth-main">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h2>{isRegister ? "Create account" : "Log in"}</h2>

        {isRegister && (
          <>
            <label>
              Full name
              <input value={form.fullName} onChange={set("fullName")} autoComplete="name" />
            </label>
            <label>
              Farm location
              <input
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Plaridel, Bulacan"
              />
            </label>
          </>
        )}

        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>
        {isRegister && (
          <label>
            Confirm password
            <input
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              autoComplete="new-password"
            />
          </label>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="btn primary" disabled={busy}>
          {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
        </button>

        <button type="button" className="btn link" onClick={switchMode}>
          {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </form>
      </main>
    </div>
  );
}
