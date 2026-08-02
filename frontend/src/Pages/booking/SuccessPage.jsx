import { Link } from "react-router-dom";
import "../../components/Booking/Booking.css";

export default function SuccessPage() {
  return (
    <div className="booking-container">
      <h2>Appointment Booked</h2>
      <div className="booking-panel">
        <p>Your appointment has been successfully created.</p>
        <div className="booking-actions">
          <Link to="/appointments" className="booking-btn booking-btn-link">View Appointments</Link>
          <Link to="/dashboard" className="booking-btn booking-btn-link">Back To Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
