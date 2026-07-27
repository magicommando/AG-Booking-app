import { useAppState } from "../../state/AppState";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAppState();

  return (
    <div className="admindash-container">

      <header className="admindash-header">
        <h2>Gunsmith Dashboard</h2>
        <p className="admindash-subtitle">
          Welcome back, {user?.name}. Manage repairs, inventory, and AI diagnostics.
        </p>
      </header>

      <section className="admindash-grid">

        {/* Appointments */}
        <div className="admindash-card">
          <h3>Appointments</h3>
          <p>View today’s appointments, check‑ins, and upcoming work.</p>
          <Link to="/admin/appointments" className="admindash-btn">View Appointments</Link>
        </div>

        {/* Work Orders */}
        <div className="admindash-card">
          <h3>Work Orders</h3>
          <p>Manage active repairs, update progress, and finalize jobs.</p>
          <Link to="/admin/workorders" className="admindash-btn">Manage Work Orders</Link>
        </div>

        {/* Firearms */}
        <div className="admindash-card">
          <h3>Firearms</h3>
          <p>View client firearms, details, and repair history.</p>
          <Link to="/admin/firearms" className="admindash-btn">View Firearms</Link>
        </div>

        {/* Inventory */}
        <div className="admindash-card">
          <h3>Inventory</h3>
          <p>Track parts, tools, supplies, and low‑stock alerts.</p>
          <Link to="/admin/inventory" className="admindash-btn">Manage Inventory</Link>
        </div>

        {/* AI Diagnostic */}
        <div className="admindash-card">
          <h3>AI Diagnostics</h3>
          <p>Run AI analysis on client issues or uploaded photos.</p>
          <Link to="/ai/diagnostic" className="admindash-btn">Run Diagnostic</Link>
        </div>

        {/* AI Inventory Scan */}
        <div className="admindash-card">
          <h3>AI Inventory Scan</h3>
          <p>Use AI to analyze inventory and detect missing parts.</p>
          <Link to="/ai/inventory" className="admindash-btn">AI Inventory Scan</Link>
        </div>

        {/* Messages */}
        <div className="admindash-card">
          <h3>Messages</h3>
          <p>Communicate with clients and send repair updates.</p>
          <Link to="/admin/messages" className="admindash-btn">Open Messages</Link>
        </div>

        {/* System Logs */}
        <div className="admindash-card">
          <h3>System Logs</h3>
          <p>View AI logs, error logs, and backend activity.</p>
          <Link to="/admin/logs" className="admindash-btn">View Logs</Link>
        </div>

      </section>
    </div>
  );
}
