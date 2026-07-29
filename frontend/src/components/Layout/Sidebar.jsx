import { Link } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import "./Sidebar.css";

export default function Sidebar() {
  const { role } = useAppState();

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Menu</div>

      {/* CLIENT MENU */}
      {role === "client" && (
        <nav className="sidebar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/booking/service">Book Appointment</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/firearms">Firearms</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      )}

      {/* ADMIN MENU */}
      {role === "gunsmith" && (
        <nav className="sidebar-links">
          <Link to="/admin/dashboard">Admin Dashboard</Link>
          <Link to="/admin/appointments">Appointments</Link>
          <Link to="/admin/workorders">Work Orders</Link>
          <Link to="/admin/inventory">Inventory</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      )}
    </aside>
  );
}
