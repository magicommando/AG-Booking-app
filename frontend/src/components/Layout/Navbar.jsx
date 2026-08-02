import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../../state/AppState";
import sunfaceBanner from "../../assets/sunface-banner.png";
import "./Navbar.css";

export default function Navbar() {
  const { role, token } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const hideBackButton = ["/", "/dashboard", "/admin/dashboard"].includes(location.pathname);

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (!token) {
      navigate("/");
      return;
    }

    navigate(role === "gunsmith" ? "/admin/dashboard" : "/dashboard");
  }

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
        {!hideBackButton && (
          <button className="nav-back" onClick={goBack}>
            &lt; BACK
          </button>
        )}
      </div>

      <div className="nav-center">
        <Link to="/">
          <img src={sunfaceBanner} alt="AG Gunsmithing Sunface Banner" className="nav-banner" />
        </Link>
      </div>

      <div className="nav-right">
        {!token && (
          <div className="nav-auth-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </div>
        )}

        {token && role === "client" && (
          <div className="nav-role-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/booking/service" className="nav-link">Book</Link>
            <Link to="/appointments" className="nav-link">Appointments</Link>
            <Link to="/firearms" className="nav-link">Firearms</Link>
            <Link to="/messages" className="nav-link">Messages</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
          </div>
        )}

        {token && role === "gunsmith" && (
          <div className="nav-role-links">
            <Link to="/admin/dashboard" className="nav-link">Admin</Link>
            <Link to="/admin/appointments" className="nav-link">Appointments</Link>
            <Link to="/admin/workorders" className="nav-link">Work Orders</Link>
            <Link to="/admin/inventory" className="nav-link">Inventory</Link>
            <Link to="/messages" className="nav-link">Messages</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
          </div>
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
