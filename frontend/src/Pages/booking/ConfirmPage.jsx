import axios from "axios";
import { useBooking } from "../../state/BookingState";
import { useAppState } from "../../state/AppState";
import { useNavigate } from "react-router-dom";

export default function ConfirmPage() {
  const { service, firearm, dateTime } = useBooking();
  const { token } = useAppState();
  const navigate = useNavigate();
  const [bookingError, setBookingError] = useState(null);

async function submit() {
  setBooking(true);
  setBookingError(null);

  try {
    await axios.post("/api/appointments", {
      serviceId: service._id,
      firearmId: firearm._id,
      date: dateTime.date,
      time: dateTime.time
    });

    navigate("/booking/success");
  } catch {
    setBookingError("Failed to book appointment");
  }

  setBooking(false);
}
{bookingError && <p className="error-text">{bookingError}</p>}

  const [booking, setBooking] = useState(false);

async function submit() {
  setBooking(true);

  await axios.post("/api/appointments", {
    serviceId: service._id,
    firearmId: firearm._id,
    date: dateTime.date,
    time: dateTime.time
  });

  setBooking(false);
  navigate("/booking/success");
}

<button disabled={booking}>
  {booking ? "Booking..." : "Book Appointment"}
</button>


  async function submit() {
    try {
      await axios.post(
        "http://localhost:5000/api/appointments",
        {
          serviceId: service._id,
          firearmId: firearm._id,
          date: dateTime.date,
          time: dateTime.time
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/booking/success");
    } catch (err) {
      console.error("Error creating appointment:", err);
    }
  }

  return (
    <div>
      <h2>Confirm Appointment</h2>

      <p>Service: {service.name}</p>
      <p>Firearm: {firearm.make} {firearm.model}</p>
      <p>Date: {dateTime.date}</p>
      <p>Time: {dateTime.time}</p>

      <button
        onClick={() => navigate(`/analyzer?firearm=${firearm._id}&service=${service._id}`)}
      >
        Run AI Analyzer
      </button>


      <button onClick={submit}>Book Appointment</button>
    </div>
  );
}
