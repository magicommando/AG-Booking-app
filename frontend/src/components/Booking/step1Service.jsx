import { useAppDispatch } from "../../state/AppState";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../Services/ServiceCard";

export default function Step1Service() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const services = [
  { name: "General Inspection", description: "Full firearm checkup" },
  { name: "Cleaning & Maintenance", description: "Deep clean + lubrication" },
  { name: "Trigger Work", description: "Trigger smoothing & tuning" },
  { name: "Barrel Work", description: "Threading, crowning, polishing" },
  { name: "Sight Installation", description: "Install & zero sights" },
  { name: "Custom Work", description: "Custom modifications" }
];

  function selectService(service) {
    dispatch({ type: "SET_BOOKING_SERVICE", payload: service });
    navigate("/booking/firearm");
  }

  return (
  <div className="booking-container">
    <h2>Select a Service</h2>

    {services.map((s, i) => (
      <ServiceCard key={i} service={s} onSelect={selectService} />
    ))}
  </div>
);
}
