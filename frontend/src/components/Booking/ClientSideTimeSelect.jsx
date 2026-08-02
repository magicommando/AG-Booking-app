import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppState } from "../../state/AppState";

export default function ClientSideTimeSelect({ gunsmithId, day, selectedTime, onSelect }) {
  const { token } = useAppState();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSlots() {
      if (!gunsmithId || !day || !token) {
        setSlots([]);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `http://localhost:5000/api/schedule/${gunsmithId}/${day}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSlots(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error loading available time slots:", err);
        setError("Unable to load available times.");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
  }, [day, gunsmithId, token]);

  if (!day) {
    return <p className="booking-step-label">Select a date to see available time slots.</p>;
  }

  if (!gunsmithId) {
    return <p className="booking-step-label">Select an available gunsmith to see open times.</p>;
  }

  return (
    <div className="client-slot-grid">
      {loading ? <p>Loading available times...</p> : null}
      {error ? <p>{error}</p> : null}
      {!loading && !error && slots.length > 0 && !slots.some((slot) => slot.available) ? (
        <p className="booking-step-label">No open times for this gunsmith on the selected day.</p>
      ) : null}
      {slots.map((slot, i) => (
        <button
          key={i}
          disabled={!slot.available}
          className={`client-slot-btn ${slot.available ? "open" : "closed"} ${selectedTime === slot.time ? "selected" : ""}`}
          onClick={() => slot.available && onSelect(slot.time)}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
