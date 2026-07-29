import { useBooking } from "../../state/BookingState";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DateTimePage() {
  const { setDateTime } = useBooking();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

async function next() {
  setSaving(true);
  setDateTime({ date, time });
  setSaving(false);
  navigate("/booking/confirm");
}

<button disabled={saving}>
  {saving ? "Saving..." : "Continue"}
</button>


  function next() {
    setDateTime({ date, time });
    navigate("/booking/confirm");
  }

  return (
    <div>
      <h2>Select Date & Time</h2>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

      <button onClick={next}>Continue</button>
    </div>
  );
}
