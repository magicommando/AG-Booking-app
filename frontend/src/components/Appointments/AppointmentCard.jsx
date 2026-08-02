import { Link } from "react-router-dom";
import "./AppointmentCard.css";

function resolveEntityId(entity) {
  if (!entity) return null;
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || null;
}

function getAvailabilityState(status) {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return { label: "Scheduled", className: "availability-scheduled" };
    case "pending":
      return { label: "Awaiting", className: "availability-awaiting" };
    case "completed":
      return { label: "Completed", className: "availability-completed" };
    case "cancelled":
    case "denied":
      return { label: "Unavailable", className: "availability-unavailable" };
    default:
      return { label: "Scheduled", className: "availability-scheduled" };
  }
}

export default function AppointmentCard({ appointment, role, detailsPathBase = "/appointments" }) {
  const {
    _id,
    service,
    date,
    time,
    status,
    firearm,
  } = appointment;

  const counterpartId = role === "client"
    ? resolveEntityId(appointment.gunsmithId || appointment.gunsmith)
    : resolveEntityId(appointment.clientId || appointment.client);
  const availability = getAvailabilityState(status);

  const messageHref = counterpartId
    ? `/messages/${counterpartId}?appointmentId=${encodeURIComponent(_id)}`
    : `/messages?appointmentId=${encodeURIComponent(_id)}`;

  return (
    <div className="apptcard">

      <div className="apptcard-header">
        <h3>{service}</h3>
        <span className={`apptcard-status status-${status}`}>
          {status}
        </span>
      </div>

      <div className="apptcard-availability-row">
        <span className={`apptcard-availability ${availability.className}`}>
          Availability: {availability.label}
        </span>
      </div>

      <div className="apptcard-body">
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>

        {firearm && (
          <p>
            <strong>Firearm:</strong> {firearm.make || firearm.manufacturer} {firearm.model}
          </p>
        )}
      </div>

      <div className="apptcard-actions">

        {/* View Details */}
        <Link
          to={`${detailsPathBase}/${_id}`}
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
          to={messageHref}
          className="apptcard-btn apptcard-msg-btn"
        >
          Message
        </Link>

      </div>
    </div>
  );
}
