import FirearmCard from "../Firearms/FirearmCard";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingProgress from "./BookingProgress";
import "./Booking.css";

export default function Step2Firearm() {
  const { token } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFirearms() {
      try {
        const res = await axios.get("http://localhost:5000/api/firearms", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFirearms(res.data || []);
      } catch (err) {
        console.error("Failed to load firearms for booking:", err);
        setFirearms([]);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadFirearms();
    } else {
      setLoading(false);
      setFirearms([]);
    }
  }, [token]);

  function selectFirearm(firearm) {
    dispatch({ type: "SET_BOOKING_FIREARM", payload: firearm });
    navigate("/booking/datetime");
  }

  return (
    <div className="booking-container">
      <h2>Select a Firearm</h2>
      <BookingProgress currentStep={2} />

      <div className="booking-panel">
        {loading && <p>Loading firearms...</p>}

        {firearms.map((f) => (
          <FirearmCard
            key={f._id}
            firearm={f}
            onSelect={() => selectFirearm(f)}
          />
        ))}

        {firearms.length === 0 && <p>You have no firearms registered.</p>}
      </div>

      <div className="booking-actions">
        <button className="booking-btn booking-btn-secondary" onClick={() => navigate("/booking/service")}>Back</button>
        <button className="booking-btn" onClick={() => navigate("/firearms")}>Manage Firearms</button>
      </div>
    </div>
  );
}
