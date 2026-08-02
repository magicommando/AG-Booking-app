import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import "./AdminBooking.css";

export default function AdminBookingList() {
  const navigate = useNavigate();
  const { token, user } = useAppState();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      try {
        if (!token || !user?.id) {
          setAppointments([]);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/appointments/gunsmith/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAppointments(res.data || []);
      } catch (err) {
        console.error("Error loading admin appointments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [token, user?.id]);

  const orderedAppointments = useMemo(() => {
    const rank = { pending: 0, approved: 1, denied: 2, cancelled: 3, completed: 4 };
    return [...appointments].sort((a, b) => {
      const ra = rank[a.status] ?? 99;
      const rb = rank[b.status] ?? 99;
      if (ra !== rb) return ra - rb;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [appointments]);

  if (loading) {
    return (
      <div className="admin-booking-container">
        <h2>Appointment Requests</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-booking-container">
      <h2>Appointment Requests</h2>

      <div className="admin-booking-list">
        {orderedAppointments.length === 0 && (
          <p>No appointment requests assigned.</p>
        )}

        {orderedAppointments.map((app) => {
          const client = app.clientId;
          const service = app.serviceType || app.serviceId?.name || "Service";
          const statusClass = `status-${app.status}`;
          const dateLabel = new Date(app.date).toLocaleString();
          const clientName = client ? `${client.firstName || ""} ${client.lastName || ""}`.trim() : "Client";

          return (
          <div
            key={app._id}
            className="admin-booking-item"
            onClick={() => navigate(`/admin/appointments/${app._id}`)}
          >
            <div className="admin-booking-item-top">
              <div className="admin-booking-client">
                <strong>{clientName}</strong>
                <span className="admin-booking-meta">{client?.email || "No email on file"}</span>
              </div>

              <span className={`admin-booking-status ${statusClass}`}>{app.status}</span>
            </div>

            <div className="admin-booking-details-snippet">
              <p><strong>Service:</strong> {service}</p>
              <p><strong>Date:</strong> {dateLabel}</p>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
