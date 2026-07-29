import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function Register() {
  const { loginUser } = useAppState();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister() {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      loginUser(res.data);

      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed");
    }
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      {error && <p className="auth-error">{error}</p>}

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
