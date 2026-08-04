import { useAppState } from "../../state/AppState";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BookingProgress from "./BookingProgress";
import "./Booking.css";

export default function Step4Confirm() {
  const { bookingService, bookingFirearm, bookingDateTime, token, user } = useAppState();
  const navigate = useNavigate();
  const serviceName = typeof bookingService === "string" ? bookingService : bookingService?.name;
  const selectedGunsmith = user?.role === "gunsmith"
    ? user
    : null;
  const estimatedInvoiceAmount = Number(selectedGunsmith?.laborRate || bookingDateTime?.gunsmithRate || 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!serviceName || !bookingFirearm || !bookingDateTime) {
    return (
      <div className="booking-container">
        <h2>Confirm Appointment</h2>
        <p>Your booking session is incomplete. Please start again from service selection.</p>
        <button className="booking-btn" onClick={() => navigate("/booking/service")}>Go To Booking</button>
      </div>
    );
  }

  async function confirmBooking() {
    setSubmitting(true);
    setError("");

    try {
      await api.post("/appointments",
        {
          service: serviceName,
          firearmId: bookingFirearm._id,
          gunsmithId: bookingDateTime.gunsmithId,
          date: bookingDateTime.date,
          time: bookingDateTime.time
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/booking/success");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-container">
      <h2>Confirm Appointment</h2>
      <BookingProgress currentStep={4} />

      <div className="booking-summary">
        <p><strong>Service:</strong> {serviceName}</p>
        <p><strong>Firearm:</strong> {bookingFirearm?.make || bookingFirearm?.manufacturer} {bookingFirearm?.model}</p>
        <p><strong>Date:</strong> {bookingDateTime.date}</p>
        <p><strong>Time:</strong> {bookingDateTime.time}</p>
        <p><strong>Estimated Invoice:</strong> ${estimatedInvoiceAmount.toFixed(2)}</p>
      </div>

      {error && <p className="booking-error">{error}</p>}

      <div className="booking-actions">
        <button className="booking-btn booking-btn-secondary" onClick={() => navigate("/booking/datetime")} disabled={submitting}>
          Back
        </button>
        <button className="booking-btn" onClick={confirmBooking} disabled={submitting}>
          {submitting ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
}
