import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import api from "../../services/api";
import AppointmentCard from "./AppointmentCard";
import "./AppointmentList.css";

export default function AdminAppointmentList() {
  const { token, role, user } = useAppState();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      try {
        if (!user?.id) {
          setAppointments([]);
          return;
        }

        const res = await api.get(`/appointments/gunsmith/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("Error loading client appointments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [token, user?.id]);

  if (loading) return <div className="apptlist-container">Loading...</div>;

  return (
    <div className="apptlist-container">
      <h2>Your Appointments</h2>

      {appointments.length === 0 && (
        <p className="apptlist-empty">You have no appointments yet.</p>
      )}

      {appointments.map((appt) => (
        <AppointmentCard
          key={appt._id}
          appointment={appt}
          role={role}
          detailsPathBase="/admin/appointments"
        />
      ))}
    </div>
  );
}
