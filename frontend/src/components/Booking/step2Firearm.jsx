import FirearmCard from "../Firearms/FirearmCard";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { useNavigate } from "react-router-dom";

export default function Step2Firearm() {
  const { user } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const firearms = user?.firearms || [];

  function selectFirearm(firearm) {
    dispatch({ type: "SET_BOOKING_FIREARM", payload: firearm });
    navigate("/booking/datetime");
  }

  return (
    <div className="booking-container">
      <h2>Select a Firearm</h2>

      {firearms.map((f) => (
        <FirearmCard
          key={f._id}
          firearm={f}
          onSelect={() => selectFirearm(f)}
        />
      ))}

      {firearms.length === 0 && <p>You have no firearms registered.</p>}

      <div className="booking-list">
        {firearms.map((f) => (
          <button
            key={f._id}
            className="booking-btn"
            onClick={() => selectFirearm(f)}
          >
            {f.make} {f.model}
          </button>
        ))}
      </div>
    </div>
  );
}
