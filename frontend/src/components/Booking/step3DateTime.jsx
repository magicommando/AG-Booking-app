import { useState } from "react";
import { useAppDispatch } from "../../state/AppState";
import { useNavigate } from "react-router-dom";

export default function Step3DateTime() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  function handleNext() {
    if (!date || !time) return alert("Select both date and time");

    dispatch({
      type: "SET_BOOKING_DATETIME",
      payload: { date, time }
    });

    navigate("/booking/confirm");
  }

  return (
    <div className="booking-container">
      <h2>Select Date & Time</h2>

      <input
        type="date"
        className="booking-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="time"
        className="booking-input"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <button className="booking-btn" onClick={handleNext}>
        Continue
      </button>
    </div>
  );
}
