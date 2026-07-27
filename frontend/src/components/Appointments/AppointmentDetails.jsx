import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import "./AppointmentDetails.css";

export default function AppointmentDetails() {
  const { token, role } = useAppState();
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/appointments/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointment(res.data);
      } catch (err) {
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [id, token]);

  if (loading) return <div className="appt-container">Loading...</div>;
  if (!appointment) return <div className="appt-container">Appointment not found.</div>;

  const { service, firearm, date, time, status, aiDiagnostics, workOrder } = appointment;

  return (
    <div className="appt-container">
      <h2>Appointment Details</h2>

      <div className="appt-card">
        <h3>Service</h3>
        <p>{service}</p>
      </div>

      <div className="appt-card">
        <h3>Firearm</h3>
        <p>{firearm.make} {firearm.model}</p>
        <p>Serial: {firearm.serial}</p>
      </div>

      <div className="appt-card">
        <h3>Date & Time</h3>
        <p>{date}</p>
        <p>{time}</p>
      </div>

      <div className="appt-card">
        <h3>Status</h3>
        <p>{status}</p>
      </div>

      {/* AI Diagnostics */}
      <div className="appt-card">
        <h3>AI Diagnostics</h3>
        {aiDiagnostics ? (
          <pre>{JSON.stringify(aiDiagnostics, null, 2)}</pre>
        ) : (
          <p>No AI diagnostics yet.</p>
        )}

        <Link to="/ai/diagnostic" className="appt-btn">
          Run AI Diagnostic
        </Link>
      </div>

      {/* Work Order */}
      <div className="appt-card">
        <h3>Work Order</h3>
        {workOrder ? (
          <pre>{JSON.stringify(workOrder, null, 2)}</pre>
        ) : (
          <p>No work order created yet.</p>
        )}

        {role === "gunsmith" && (
          <Link to="/admin/workorders" className="appt-btn">
            Manage Work Order
          </Link>
        )}
      </div>

      {/* Messaging */}
      <div className="appt-card">
        <h3>Messages</h3>
        <Link to={`/messages/${id}`} className="appt-btn">
          Open Conversation
        </Link>
      </div>
    </div>
  );
}
