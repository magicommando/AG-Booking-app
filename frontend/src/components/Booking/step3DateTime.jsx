import { useState } from "react";
import { useEffect } from "react";
import { useAppDispatch } from "../../state/AppState";
import { useAppState } from "../../state/AppState";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import BookingProgress from "./BookingProgress";
import ClientSideTimeSelect from "./ClientSideTimeSelect";
import AdminCalendar from "./AdminCalendar";
import "./Booking.css";

export default function Step3DateTime() {
  const { token } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [gunsmiths, setGunsmiths] = useState([]);
  const [availableGunsmiths, setAvailableGunsmiths] = useState([]);
  const [gunsmithId, setGunsmithId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    async function loadGunsmiths() {
      try {
        const res = await api.get("/users/role/gunsmiths");
        const list = Array.isArray(res.data) ? res.data : [];
        setGunsmiths(list);
        setAvailableGunsmiths(list);
        if (list.length > 0) {
          setGunsmithId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load gunsmiths:", err);
        setGunsmiths([]);
        setAvailableGunsmiths([]);
      }
    }

    if (token) {
      loadGunsmiths();
    }
  }, [token]);

  useEffect(() => {
    async function filterGunsmithsByAvailability() {
      if (!token || gunsmiths.length === 0) {
        setAvailableGunsmiths([]);
        setGunsmithId("");
        return;
      }

      if (!date) {
        setAvailabilityError("");
        setCheckingAvailability(false);
        setAvailableGunsmiths(gunsmiths);
        if (gunsmithId && gunsmiths.some((g) => String(g._id) === String(gunsmithId))) {
          return;
        }
        setGunsmithId(gunsmiths[0]?._id || "");
        return;
      }

      try {
        setCheckingAvailability(true);
        setAvailabilityError("");

        const checks = await Promise.all(
          gunsmiths.map(async (g) => {
            try {
              const res = await api.get(
                `/schedule/${g._id}/${date}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const slots = Array.isArray(res.data) ? res.data : [];
              const hasOpenSlot = slots.some((slot) => slot?.available);
              return hasOpenSlot ? g : null;
            } catch (err) {
              return null;
            }
          })
        );

        const filtered = checks.filter(Boolean);
        setAvailableGunsmiths(filtered);

        const stillValid = filtered.some((g) => String(g._id) === String(gunsmithId));
        if (!stillValid) {
          setGunsmithId(filtered[0]?._id || "");
          setTime("");
        }
      } catch (err) {
        console.error("Failed to load gunsmith availability:", err);
        setAvailabilityError("Unable to load gunsmith availability for this date.");
        setAvailableGunsmiths([]);
        setGunsmithId("");
      } finally {
        setCheckingAvailability(false);
      }
    }

    filterGunsmithsByAvailability();
  }, [date, gunsmithId, gunsmiths, token]);

  useEffect(() => {
    setTime("");
  }, [date, gunsmithId]);

  function handleNext() {
    if (!gunsmithId || !date || !time) return alert("Select gunsmith, date, and time");

    const selectedGunsmith = availableGunsmiths.find((g) => String(g._id) === String(gunsmithId));

    dispatch({
      type: "SET_BOOKING_DATETIME",
      payload: {
        date,
        time,
        gunsmithId,
        gunsmithRate: Number(selectedGunsmith?.laborRate || 0)
      }
    });

    navigate("/booking/confirm");
  }

  return (
    <div className="booking-container">
      <h2>Select Date & Time</h2>
      <BookingProgress currentStep={3} />

      <div className="booking-panel">
        <select
          className="booking-input"
          value={gunsmithId}
          onChange={(e) => setGunsmithId(e.target.value)}
          disabled={checkingAvailability || availableGunsmiths.length === 0}
        >
          <option value="">Select Gunsmith</option>
          {availableGunsmiths.map((g) => {
            const name = `${g.firstName || ""} ${g.lastName || ""}`.trim() || g.email;
            const rate = Number(g.laborRate || 0);
            return (
              <option key={g._id} value={g._id}>
                {`${name}${rate > 0 ? ` — $${rate}/hr` : ""}`}
              </option>
            );
          })}
        </select>

        {date && checkingAvailability ? <p className="booking-step-label">Checking available gunsmiths...</p> : null}
        {date && !checkingAvailability && availableGunsmiths.length === 0 ? (
          <p className="booking-error">No gunsmiths are available for this date. Please choose another date.</p>
        ) : null}
        {availabilityError ? <p className="booking-error">{availabilityError}</p> : null}

        <AdminCalendar onSelectDay={(selectedDay) => setDate(selectedDay)} />

        <input
          type="date"
          className="booking-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <ClientSideTimeSelect
          gunsmithId={gunsmithId}
          day={date}
          selectedTime={time}
          onSelect={(selectedTime) => setTime(selectedTime)}
        />

        {time ? <p className="booking-step-label">Selected time: {time}</p> : null}

        <div className="booking-actions">
          <button className="booking-btn booking-btn-secondary" onClick={() => navigate("/booking/firearm")}>Back</button>
          <button className="booking-btn" onClick={handleNext}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
