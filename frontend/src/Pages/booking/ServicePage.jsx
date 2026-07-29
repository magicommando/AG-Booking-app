import { useEffect, useState } from "react";
import axios from "axios";
import { useBooking } from "../../state/BookingState";
import { useNavigate } from "react-router-dom";

export default function ServicePage() {
  const [services, setServices] = useState([]);
  const { setService } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/services")
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  function chooseService(s) {
    setService(s);
    navigate("/booking/firearm");
  }

  return (
    <div>
      <h2>Select Service</h2>
      {services.map(s => (
        <div key={s._id} onClick={() => chooseService(s)}>
          {s.name}
        </div>
      ))}
    </div>
  );
}
