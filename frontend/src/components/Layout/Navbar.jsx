import { Link, useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../../state/AppState";
import "./Navbar.css";

export default function Navbar() {
  const { user, role, token } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    dispatch({ type: "SET_TOKEN", payload: null });
    dispatch({ type: "SET_USER", payload: null });
    dispatch({ type: "SET_ROLE", payload: null });
    navigate("/");
  }

  return (
    <nav className="nav-container">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          AG Gunsmithing
        </Link>
      </div>

      <div className="nav-right">
        {!token && (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}

        {token && role === "client" && (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/booking/service" className="nav-link">Book</Link>
            <Link to="/appointments" className="nav-link">Appointments</Link>
            <Link to="/firearms" className="nav-link">Firearms</Link>
            <Link to="/messages" className="nav-link">Messages</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
          </>
        )}

        {token && role === "gunsmith" && (
          <>
            <Link to="/admin/dashboard" className="nav-link">Admin</Link>
            <Link to="/admin/appointments" className="nav-link">Appointments</Link>
            <Link to="/admin/workorders" className="nav-link">Work Orders</Link>
            <Link to="/admin/inventory" className="nav-link">Inventory</Link>
            <Link to="/messages" className="nav-link">Messages</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
          </>
        )}

        {token && (
          <button className="nav-logout" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
