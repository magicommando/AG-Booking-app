import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAppState } from "../../state/AppState";
import AdminCalendar from "./AdminCalendar";
import "./AdminSchedule.css";

export default function AdminSchedule() {
  const { token, user } = useAppState();
  const loggedInGunsmithId = user?.id || user?._id || "";
  const loggedInGunsmithName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Logged in gunsmith";
  const isGunsmith = user?.role === "gunsmith";

  const [selectedDay, setSelectedDay] = useState("");
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSlots = useCallback(async (gunsmithId, day) => {
    if (!gunsmithId || !day || !token || !isGunsmith) return;

    try {
      setError("");
      const res = await axios.get(
        `http://localhost:5000/api/schedule/${gunsmithId}/${day}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading schedule slots:", err);
      setError("Unable to load schedule slots.");
      setSlots([]);
    }
  }, [isGunsmith, token]);

  useEffect(() => {
    setMessage("");
    setError("");
    setSelectedDay("");
    setSlots([]);
  }, [loggedInGunsmithId]);

  useEffect(() => {
    if (loggedInGunsmithId && selectedDay && isGunsmith) {
      loadSlots(loggedInGunsmithId, selectedDay);
    }
  }, [isGunsmith, loadSlots, loggedInGunsmithId, selectedDay]);

  const toggleSlot = (index) => {
    const updated = [...slots];
    if (updated[index]?.booked) return;
    updated[index].available = !updated[index].available;
    updated[index].blocked = !updated[index].available;
    setSlots(updated);
  };

  const saveSchedule = async () => {
    if (!loggedInGunsmithId || !selectedDay || !token || !isGunsmith) return;

    try {
      await axios.put(
        `http://localhost:5000/api/schedule/${loggedInGunsmithId}/${selectedDay}`,
        slots,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setMessage("Schedule updated.");
      setError("");
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to save schedule.");
      setMessage("");
    }
  };

  return (
    <div className="admin-schedule-container">
      <h2>Gunsmith Schedule Availability</h2>

      <p className="admin-selected-day">Viewing schedule for: {loggedInGunsmithName}</p>

      {!isGunsmith ? (
        <p className="admin-schedule-error">Only the logged-in gunsmith can manage schedule availability.</p>
      ) : null}

      <AdminCalendar onSelectDay={(day) => setSelectedDay(day)} />

      {selectedDay ? <p className="admin-selected-day">Selected Day: {selectedDay}</p> : null}
      {message ? <p className="admin-schedule-message">{message}</p> : null}
      {error ? <p className="admin-schedule-error">{error}</p> : null}

      <div className="admin-slot-grid">
        {slots.map((slot, i) => (
          <button
            key={i}
            className={`admin-slot-btn ${slot.booked ? "booked" : slot.available ? "available" : "unavailable"}`}
            onClick={() => toggleSlot(i)}
            disabled={slot.booked || !isGunsmith}
          >
            {slot.time}{slot.booked ? " (Booked)" : ""}
          </button>
        ))}
      </div>

      <button className="admin-save-btn" onClick={saveSchedule} disabled={!isGunsmith}>
        Save Schedule
      </button>
    </div>
  );
}