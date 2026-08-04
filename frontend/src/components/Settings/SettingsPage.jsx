import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import api from "../../services/api";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user, token } = useAppState();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    billingAddress: user?.billingAddress || "",
    preferredContactMethod: user?.preferredContactMethod || "email",
    laborRate: user?.laborRate || "",
    notifications: true
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function updateProfile() {
    try {
      const res = await api.put("/users/profile",
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          billingAddress: form.billingAddress,
          preferredContactMethod: form.preferredContactMethod,
          laborRate: form.laborRate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_USER", payload: res.data.user });
  localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Error updating profile");
      console.error(err);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      await api.delete("/users/delete",
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
      <p className="settings-user-name">
        {user?.firstName || user?.lastName
          ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
          : ""}
      </p>

      {message && <p className="settings-message">{message}</p>}

      {/* Profile Section */}
      <div className="settings-card">
        <h3>Profile Information</h3>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <textarea
          name="billingAddress"
          placeholder="Billing Address"
          value={form.billingAddress}
          onChange={handleChange}
        />

        <select
          name="preferredContactMethod"
          value={form.preferredContactMethod}
          onChange={handleChange}
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="sms">SMS</option>
        </select>

        {user?.role === "gunsmith" ? (
          <input
            type="number"
            name="laborRate"
            placeholder="Labor Rate ($/hr)"
            value={form.laborRate}
            onChange={handleChange}
            min="0"
          />
        ) : null}

        <button className="settings-btn" onClick={updateProfile}>
          Save Profile
        </button>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <h3>Preferences</h3>

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
