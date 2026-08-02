import { useAppDispatch } from "../../state/AppState";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../Services/ServiceCard";
import BookingProgress from "./BookingProgress";
import { SERVICE_CATALOG } from "../../utils/serviceCatalog";
import "./Booking.css";
export default function Step1Service() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function selectService(service) {
    dispatch({ type: "SET_BOOKING_SERVICE", payload: service });
    navigate("/booking/firearm");
  }

  return (
    <div className="booking-container">
      <h2>Select a Service</h2>
      <BookingProgress currentStep={1} />

      <div className="booking-panel">
        {SERVICE_CATALOG.map((s, i) => (
          <ServiceCard key={i} service={s} onSelect={selectService} />
        ))}
      </div>
    </div>
  );
}
