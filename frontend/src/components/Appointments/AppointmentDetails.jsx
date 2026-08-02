import FirearmCard from "../Firearms/FirearmCard";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import ClientSideTimeSelect from "../Booking/ClientSideTimeSelect";
import { SERVICE_CATALOG } from "../../utils/serviceCatalog";
import "./AppointmentDetails.css";

function resolveEntityId(entity) {
  if (!entity) return null;
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || null;
}

export default function AppointmentDetails() {
  const { token, role } = useAppState();
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editService, setEditService] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/appointments/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointment(res.data);
        setEditService(res.data.serviceType || res.data.serviceId?.name || res.data.service || "");
      }
       catch (err) {
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [id, token]);

  useEffect(() => {
    if (!appointment?.date) return;

    const appointmentDate = new Date(appointment.date);
    if (!Number.isNaN(appointmentDate.getTime())) {
      const year = appointmentDate.getFullYear();
      const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
      const day = String(appointmentDate.getDate()).padStart(2, "0");
      setEditTime(appointmentDate.toTimeString().slice(0, 5));
      setEditDate(`${year}-${month}-${day}`);
    }
  }, [appointment]);

  async function saveChanges() {
    if (!editDate || !editTime) return;

    setSaving(true);
    setError("");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/appointments/${id}`,
        {
          firearmId: appointment.firearmId?._id || appointment.firearmId,
          service: editService,
          serviceType: editService,
          date: editDate,
          time: editTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointment(res.data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to update appointment");
    } finally {
      setSaving(false);
    }
  }

  async function updateAdminAppointment(status, { reschedule = false } = {}) {
    setSaving(true);
    setError("");

    try {
      const payload = { status };

      if (reschedule) {
        if (!editDate || !editTime) {
          setError("Pick a new date and time before rescheduling.");
          setSaving(false);
          return;
        }

        payload.date = editDate;
        payload.time = editTime;
      }

      const res = await axios.put(
        `http://localhost:5000/api/appointments/${id}/admin`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointment(res.data.appointment);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to update appointment");
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment() {
    if (!window.confirm("Cancel this appointment?")) return;

    setSaving(true);
    setError("");

    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/appointments");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to cancel appointment");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="appt-container">Loading...</div>;
  if (!appointment) return <div className="appt-container">Appointment not found.</div>;

  const service = appointment.service || appointment.serviceType || appointment.serviceId?.name || "Service";
  const firearm = appointment.firearm || appointment.firearmId;
  const gunsmith = appointment.gunsmithId || appointment.gunsmith;
  const gunsmithId = resolveEntityId(gunsmith);
  const gunsmithName = gunsmith
    ? `${gunsmith.firstName || ""} ${gunsmith.lastName || ""}`.trim() || gunsmith.fullName || gunsmith.name || gunsmith.email
    : "Assigned Gunsmith";
  const parsedDate = appointment.date ? new Date(appointment.date) : null;
  const date = parsedDate ? parsedDate.toLocaleDateString() : "-";
  const time = appointment.time || (parsedDate ? parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-");
  const status = appointment.status;
  const aiDiagnostics = appointment.aiDiagnostics;
  const workOrder = appointment.workOrder;
  const workOrderStatus = workOrder?.status || workOrder?.progress || (workOrder ? "Created" : "Not started");
  const isClientOwner = role === "client";
  const isAdminSide = role === "gunsmith" || role === "admin";
  const canModify = isClientOwner && status !== "completed" && status !== "cancelled";
  const counterpartId = role === "client"
    ? resolveEntityId(appointment.gunsmithId || appointment.gunsmith)
    : resolveEntityId(appointment.clientId || appointment.client);
  const messageHref = counterpartId
    ? `/messages/${counterpartId}?appointmentId=${encodeURIComponent(id)}`
    : `/messages?appointmentId=${encodeURIComponent(id)}`;

  return (
    <div className="appt-container">
      <h2>Appointment Details</h2>

      <div className="appt-hero-card">
        <div className="appt-hero-copy">
          <p className="appt-hero-kicker">Client Appointment</p>
          <h3>{service}</h3>
          <p>Review the appointment, reschedule if needed, and keep the service aligned with your booked availability.</p>
        </div>
        <div className={`appt-status-badge status-${status}`}>{status}</div>
      </div>

      <FirearmCard
        firearm={firearm}
        showActions={false}
      />

      <div className="appt-card">
        <h3>Service</h3>
        <p>{service}</p>
        <p className="appt-muted">This follows the same service catalog used during booking.</p>
      </div>

      <div className="appt-card">
        <h3>Firearm</h3>
        <p>{firearm?.make || firearm?.manufacturer} {firearm?.model}</p>
        <p>Serial: {firearm?.serial}</p>
      </div>

      <div className="appt-card">
        <h3>Date & Time</h3>
        <p>{date}</p>
        <p>{time}</p>
      </div>

      <div className="appt-card">
        <h3>Status</h3>
        <p>{status}</p>
      </div>

      {isAdminSide && (
        <div className="appt-card">
          <h3>Admin Actions</h3>
          <div className="appt-actions">
            <button className="appt-btn" onClick={() => updateAdminAppointment("approved")} disabled={saving}>
              Confirm
            </button>
            <button className="appt-btn" onClick={() => updateAdminAppointment("denied")} disabled={saving}>
              Reject
            </button>
          </div>

          <div className="appt-admin-reschedule">
            <h4>Reschedule</h4>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            />
            <button
              className="appt-btn"
              onClick={() => updateAdminAppointment(status || "approved", { reschedule: true })}
              disabled={saving}
            >
              Reschedule Appointment
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="appt-card">
          <p>{error}</p>
        </div>
      )}

      {canModify && (
        <div className="appt-card">
          <h3>Update Appointment</h3>
          <p className="appt-muted">Available times are pulled from {gunsmithName}'s schedule for the selected day.</p>

          <label className="appt-field-label" htmlFor="appointment-service-select">Service</label>
          <select
            id="appointment-service-select"
            className="appt-input"
            value={editService}
            onChange={(e) => setEditService(e.target.value)}
          >
            <option value="">Select Service</option>
            {SERVICE_CATALOG.map((serviceOption) => (
              <option key={serviceOption.name} value={serviceOption.name}>
                {serviceOption.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="appt-input"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          <ClientSideTimeSelect
            gunsmithId={gunsmithId}
            day={editDate}
            selectedTime={editTime}
            onSelect={setEditTime}
          />

          <div className="appt-actions">
            <button className="appt-btn" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="appt-btn" onClick={cancelAppointment} disabled={saving}>
              Cancel Appointment
            </button>
          </div>
        </div>
      )}

      {/* AI Diagnostics */}
      <div className="appt-card">
        <h3>AI Diagnostics</h3>
        {aiDiagnostics ? (
          <pre>{JSON.stringify(aiDiagnostics, null, 2)}</pre>
        ) : (
          <p>No AI diagnostics yet.</p>
        )}

        <Link to="/ai/analyze" className="appt-btn">
          Run AI Diagnostic
        </Link>
      </div>

      {/* Work Order */}
      {role === "gunsmith" ? (
        <div className="appt-card">
          <h3>Work Order</h3>
          {workOrder ? (
            <pre>{JSON.stringify(workOrder, null, 2)}</pre>
          ) : (
            <p>No work order created yet.</p>
          )}

          <Link to="/admin/workorders" className="appt-btn">
            Manage Work Order
          </Link>
        </div>
      ) : (
        <div className="appt-card">
          <h3>Work Order Status</h3>
          <p>{workOrderStatus}</p>
        </div>
      )}

      {/* Messaging */}
      <div className="appt-card">
        <h3>Messages</h3>
        <Link to={messageHref} className="appt-btn">
          Open Conversation
        </Link>
      </div>
    </div>
  );
}
