import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import AppointmentCard from "./AppointmentCard";
import "./AppointmentList.css";

export default function ClientAppointmentList() {
  const { token, role } = useAppState();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/appointments/my",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Error loading client appointments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [token]);

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
