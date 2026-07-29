import { useEffect, useState } from "react";
import axios from "axios";
import { useBooking } from "../../state/BookingState";
import { useNavigate } from "react-router-dom";

export default function FirearmPage() {
  const [firearms, setFirearms] = useState([]);
  const { setFirearm } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/firearms")
      .then(res => setFirearms(res.data))
      .catch(err => console.error(err));
  }, []);

  function chooseFirearm(f) {
    setFirearm(f);
    navigate("/booking/datetime");
  }

  return (
    <div>
      <h2>Select Firearm</h2>
      {firearms.map(f => (
        <div key={f._id} onClick={() => chooseFirearm(f)}>
          {f.make} {f.model}
        </div>
      ))}
    </div>
  );
}
