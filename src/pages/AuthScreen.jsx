import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, serverTimestamp, set as dbSet } from "firebase/database";
import { auth, db } from "../firebase/config";
import { authMessage } from "../utils/authErrors";
import logo from "../assets/logo.svg";

const EMPTY = {
  fullName: "",
  location: "",
  email: "",
  password: "",
  confirm: "",
};

function fieldForCode(code) {
  switch (code) {
    case "auth/invalid-email":
    case "auth/email-already-in-use":
      return "email";
    case "auth/weak-password":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "password";
    default:
      return "form";
  }
}

function Field({ label, error, children }) {
  return (
    <label className={error ? "field has-error" : "field"}>
      {label}
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

export default function AuthScreen({ registering }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const [notice, setNotice] = useState("");

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: "" });
  };

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setErrors({});
    setNotice("");
    setForm(EMPTY);
  }

  function validate() {
    const next = {};
    if (isRegister && !form.fullName.trim())
      next.fullName = "What's your full name?";
    if (!form.email.trim()) next.email = "Enter your email address.";
    if (!form.password) next.password = "Enter your password.";
    else if (isRegister && form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (isRegister && form.confirm !== form.password)
      next.confirm = "Passwords do not match.";
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    setNotice("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    if (isRegister) registering.current = true;
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password,
        );
        await updateProfile(cred.user, { displayName: form.fullName.trim() });
        await dbSet(ref(db, `profiles/${cred.user.uid}`), {
          fullName: form.fullName.trim(),
          location: form.location.trim(),
          farmSize: "",
          mainCrop: "",
          email: cred.user.email,
          createdAt: serverTimestamp(),
        });

        await signOut(auth); // log them out again
        setMode("login"); // show the login form
        setForm({ ...EMPTY, email: form.email.trim() }); // keep their email filled in
        setNotice("Account created! Please log in.");
      } else {
        await signInWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password,
        );
      }
    } catch (err) {
      if (isRegister) signOut(auth).catch(() => {});
      setErrors({ [fieldForCode(err.code)]: authMessage(err.code) });
    } finally {
      registering.current = false;
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
          {notice && (
            <p className="form-success" role="status">
              {notice}
            </p>
          )}

          {isRegister && (
            <>
              <Field label="Full name" error={errors.fullName}>
                <input
                  value={form.fullName}
                  onChange={set("fullName")}
                  autoComplete="name"
                />
              </Field>
              <Field label="Farm location">
                <input
                  value={form.location}
                  onChange={set("location")}
                  placeholder="e.g. Plaridel, Bulacan"
                />
              </Field>
            </>
          )}

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </Field>

          {isRegister && (
            <Field label="Confirm password" error={errors.confirm}>
              <input
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                autoComplete="new-password"
              />
            </Field>
          )}

          {errors.form && (
            <p className="form-error" role="alert">
              {errors.form}
            </p>
          )}

          <button className="btn primary" disabled={busy}>
            {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>

          <button type="button" className="btn link" onClick={switchMode}>
            {isRegister
              ? "Already have an account? Log in"
              : "New here? Create an account"}
          </button>
        </form>
      </main>
    </div>
  );
}
