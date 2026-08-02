import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../state/AppState";
import axios from "axios";
import "./Auth.css";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      const { token, user } = res.data;

      // Save token globally + persist
      dispatch({ type: "SET_TOKEN", payload: token });
      dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "SET_ROLE", payload: user.role });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(user.role === "gunsmith" || user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
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

        <button type="submit" className="auth-btn">Login</button>
      </form>

      <p className="auth-switch">
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
