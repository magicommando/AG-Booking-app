import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../state/AppState";
import api from "../../services/api";
import "./Auth.css";

const loginUrl = "/auth/login";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api.post(loginUrl, form);
      const { token, user } = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ROLE', payload: user.role });

      navigate(user.role === "gunsmith" || user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api.post('/auth/reset-password', {
        token: resetToken.trim(),
        password: newPassword
      });
      setSuccess(res.data?.message || 'Password reset successful');
      setResetMode(false);
      setResetToken("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not reset password');
    }
  }

  return (
    <div className="auth-container">
      <h2>{resetMode ? 'Reset Password' : 'Login'}</h2>

      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}

      {!resetMode ? (
        <>
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
            <button type="button" className="auth-link-btn" onClick={() => setResetMode(true)}>
              Forgot password?
            </button>
          </p>
        </>
      ) : (
        <form onSubmit={handleResetPassword} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Reset token"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">Reset Password</button>
        </form>
      )}

      <p className="auth-switch">
        {resetMode ? (
          <button type="button" className="auth-link-btn" onClick={() => setResetMode(false)}>
            Back to login
          </button>
        ) : (
          <>Don’t have an account? <a href="/register">Register</a></>
        )}
      </p>
    </div>
  );
}
