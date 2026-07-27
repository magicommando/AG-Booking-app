import { useAppDispatch } from "../../state/AppState";
import { useNavigate } from "react-router-dom";

export default function Step1Service() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const services = [
    "General Inspection",
    "Cleaning & Maintenance",
    "Trigger Work",
    "Barrel Work",
    "Sight Installation",
    "Custom Work"
  ];

  function selectService(service) {
    dispatch({ type: "SET_BOOKING_SERVICE", payload: service });
    navigate("/booking/firearm");
  }

  return (
    <div className="booking-container">
      <h2>Select a Service</h2>

      <div className="booking-list">
        {services.map((s, i) => (
          <button key={i} className="booking-btn" onClick={() => selectService(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
