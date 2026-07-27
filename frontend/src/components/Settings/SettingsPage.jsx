import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import axios from "axios";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user, token } = useAppState();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    notifications: true,
    theme: "dark"
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function updateProfile() {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_USER", payload: res.data.user });
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Error updating profile");
      console.error(err);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      await axios.delete(
        "http://localhost:5000/api/users/delete",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem("token");
      dispatch({ type: "SET_TOKEN", payload: null });
      dispatch({ type: "SET_USER", payload: null });

      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  }

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {message && <p className="settings-message">{message}</p>}

      {/* Profile Section */}
      <div className="settings-card">
        <h3>Profile Information</h3>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <button className="settings-btn" onClick={updateProfile}>
          Save Profile
        </button>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <h3>Preferences</h3>

        <label>Theme</label>
        <select name="theme" value={form.theme} onChange={handleChange}>
          <option value="dark">Dark Mode</option>
          <option value="light">Light Mode</option>
        </select>

        <label>Notifications</label>
        <select
          name="notifications"
          value={form.notifications}
          onChange={(e) =>
            setForm({ ...form, notifications: e.target.value === "true" })
          }
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>

        <button className="settings-btn" onClick={updateProfile}>
          Save Preferences
        </button>
      </div>

      {/* Security */}
      <div className="settings-card">
        <h3>Security</h3>

        <button className="settings-danger-btn" onClick={deleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
