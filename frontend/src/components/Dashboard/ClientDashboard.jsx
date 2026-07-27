import { useAppState } from "../../state/AppState";
import { Link } from "react-router-dom";
import "./ClientDashboard.css";

export default function ClientDashboard() {
  const { user } = useAppState();

  return (
    <div className="clientdash-container">

      <header className="clientdash-header">
        <h2>Welcome, {user?.name}</h2>
        <p className="clientdash-subtitle">Your firearms, appointments, and AI tools — all in one place.</p>
      </header>

      <section className="clientdash-grid">

        {/* Firearms */}
        <div className="clientdash-card">
          <h3>Your Firearms</h3>
          <p>View, manage, and update your registered firearms.</p>
          <Link to="/firearms" className="clientdash-btn">View Firearms</Link>
        </div>

        {/* Appointments */}
        <div className="clientdash-card">
          <h3>Appointments</h3>
          <p>Book new appointments or check your upcoming visits.</p>
          <Link to="/appointments" className="clientdash-btn">Manage Appointments</Link>
        </div>

        {/* AI Diagnostic */}
        <div className="clientdash-card">
          <h3>AI Firearm Diagnostics</h3>
          <p>Describe an issue or upload a photo for instant AI analysis.</p>
          <Link to="/ai/diagnostic" className="clientdash-btn">Run Diagnostic</Link>
        </div>

        {/* AI Photo Upload */}
        <div className="clientdash-card">
          <h3>AI Photo Upload</h3>
          <p>Upload firearm photos for enhanced AI inspection.</p>
          <Link to="/ai/photo" className="clientdash-btn">Upload Photo</Link>
        </div>

        {/* Messages */}
        <div className="clientdash-card">
          <h3>Messages</h3>
          <p>Chat with your gunsmith or check repair updates.</p>
          <Link to="/messages" className="clientdash-btn">Open Messages</Link>
        </div>

      </section>
    </div>
  );
}
