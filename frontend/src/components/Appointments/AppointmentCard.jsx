import { Link } from "react-router-dom";
import "./AppointmentCard.css";

export default function AppointmentCard({ appointment, role }) {
  const {
    _id,
    service,
    date,
    time,
    status,
    firearm,
  } = appointment;

  return (
    <div className="apptcard">

      <div className="apptcard-header">
        <h3>{service}</h3>
        <span className={`apptcard-status status-${status}`}>
          {status}
        </span>
      </div>

      <div className="apptcard-body">
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>

        {firearm && (
          <p>
            <strong>Firearm:</strong> {firearm.make} {firearm.model}
          </p>
        )}
      </div>

      <div className="apptcard-actions">

        {/* View Details */}
        <Link
          to={`/appointments/${_id}`}
          className="apptcard-btn"
        >
          View Details
        </Link>

        {/* Admin-only WorkOrder button */}
        {role === "gunsmith" && (
          <Link
            to={`/admin/workorders/${_id}`}
            className="apptcard-btn apptcard-admin-btn"
          >
            Work Order
          </Link>
        )}

        {/* Messaging */}
        <Link
          to={`/messages/${_id}`}
          className="apptcard-btn apptcard-msg-btn"
        >
          Message
        </Link>

      </div>
    </div>
  );
}
