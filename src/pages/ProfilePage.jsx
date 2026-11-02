import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function ProfilePage({ user, profile, onSaved, onError }) {
  const [form, setForm] = useState({ fullName: "", location: "", farmSize: "", mainCrop: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      fullName: profile?.fullName ?? user.displayName ?? "",
      location: profile?.location ?? "",
      farmSize: profile?.farmSize ?? "",
      mainCrop: profile?.mainCrop ?? "",
    });
  }, [profile, user]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function save(e) {
    e.preventDefault();
    if (!form.fullName.trim()) return onError("Enter your full name.");
    setBusy(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: form.fullName.trim(),
          location: form.location.trim(),
          farmSize: form.farmSize.trim(),
          mainCrop: form.mainCrop.trim(),
          email: user.email,
        },
        { merge: true }
      );
      await updateProfile(auth.currentUser, { displayName: form.fullName.trim() });
      onSaved("Profile saved.");
    } catch {
      onError("Couldn't save your profile. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={save} noValidate>
      <label>
        Full name
        <input value={form.fullName} onChange={set("fullName")} />
      </label>
      <label>
        Email
        <input value={user.email ?? ""} readOnly />
      </label>
      <label>
        Farm location
        <input value={form.location} onChange={set("location")} placeholder="e.g. Plaridel, Bulacan" />
      </label>
      <label>
        Farm size (hectares)
        <input value={form.farmSize} onChange={set("farmSize")} inputMode="decimal" />
      </label>
      <label>
        Main crop
        <input value={form.mainCrop} onChange={set("mainCrop")} placeholder="e.g. Rice" />
      </label>
      <button className="btn primary" disabled={busy}>{busy ? "Saving..." : "Save profile"}</button>
    </form>
  );
}
