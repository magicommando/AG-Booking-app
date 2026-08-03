import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Auth.css";

const registerUrl = "/auth/register";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    billingAddress: "",
    preferredContactMethod: "email",
    role: "client",
    adminInviteCode: ""
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post(registerUrl, form);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || "Registration failed"
      );
    }
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <textarea
          name="billingAddress"
          placeholder="Billing Address"
          value={form.billingAddress}
          onChange={handleChange}
          required
        />

        <select
          name="preferredContactMethod"
          value={form.preferredContactMethod}
          onChange={handleChange}
          required
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="sms">SMS</option>
        </select>

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="client">Client</option>
          <option value="gunsmith">Gunsmith</option>
        </select>

        {form.role === "gunsmith" ? (
          <input
            type="password"
            name="adminInviteCode"
            placeholder="Invite Code"
            value={form.adminInviteCode}
            onChange={handleChange}
            required
          />
        ) : null}

        <button type="submit" className="auth-btn">Register</button>
      </form>

      <p className="auth-switch">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
