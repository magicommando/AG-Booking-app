import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import api from "../../services/api";
import AppointmentCard from "./AppointmentCard";
import "./AppointmentList.css";

export default function ClientAppointmentList() {
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

        const res = await api.get(`/appointments/client/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const normalized = (res.data || []).map((appt) => {
          const timestamp = appt.date ? new Date(appt.date) : null;
          const firearm = appt.firearm || appt.firearmId;

          return {
            ...appt,
            service: appt.service || appt.serviceType || appt.serviceId?.name || "Service",
            date: timestamp ? timestamp.toLocaleDateString() : "-",
            time: appt.time || (timestamp ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"),
            firearm
          };
        });

        setAppointments(normalized);
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
        />
      ))}
    </div>
  );
}
