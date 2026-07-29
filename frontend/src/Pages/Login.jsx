import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function Login() {
  const { loginUser } = useAppState();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      loginUser(res.data);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="auth-error">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
