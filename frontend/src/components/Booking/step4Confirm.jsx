import { useAppState } from "../../state/AppState";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Step4Confirm() {
  const { bookingService, bookingFirearm, bookingDateTime, token } = useAppState();
  const navigate = useNavigate();

  async function confirmBooking() {
    const res = await axios.post(
      "http://localhost:5000/api/appointments",
      {
        service: bookingService,
        firearmId: bookingFirearm._id,
        date: bookingDateTime.date,
        time: bookingDateTime.time
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert("Appointment booked!");
    navigate("/dashboard");
  }

  return (
    <div className="booking-container">
      <h2>Confirm Appointment</h2>

      <div className="booking-summary">
        <p><strong>Service:</strong> {bookingService}</p>
        <p><strong>Firearm:</strong> {bookingFirearm.make} {bookingFirearm.model}</p>
        <p><strong>Date:</strong> {bookingDateTime.date}</p>
        <p><strong>Time:</strong> {bookingDateTime.time}</p>
      </div>

      <button className="booking-btn" onClick={confirmBooking}>
        Confirm Appointment
      </button>
    </div>
  );
}
