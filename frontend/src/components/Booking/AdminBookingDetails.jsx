import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import api from "../../services/api";
import { createWorkOrder } from "../../services/workOrderService";
import AdminCalendar from "./AdminCalendar";
import ClientSideTimeSelect from "./ClientSideTimeSelect";
import "./AdminBooking.css";

export default function AdminBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAppState();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    async function loadAppointment() {
      try {
        const res = await api.get(`/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAppointment(res.data);

        if (res.data?.date) {
          const dateObj = new Date(res.data.date);
          if (!Number.isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            setEditDate(`${year}-${month}-${day}`);
            setEditTime(dateObj.toTimeString().slice(0, 5));
          }
        }
      } catch (err) {
        console.error("Error loading appointment details:", err);
        setError("Unable to load appointment details");
      } finally {
        setLoading(false);
      }
    }

    if (token && id) {
      loadAppointment();
    }
  }, [id, token]);

  async function updateAppointment(payload) {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await api.put(`/appointments/${id}/admin`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointment(res.data.appointment);
      setMessage("Appointment updated.");
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to update appointment");
    } finally {
      setSaving(false);
    }
  }

  function confirmAppointment() {
    updateAppointment({ status: "approved" });
  }

  function rejectAppointment() {
    updateAppointment({ status: "denied" });
  }

  function rescheduleAppointment() {
    if (!editDate || !editTime) {
      setError("Select a new date and time before rescheduling.");
      return;
    }

    updateAppointment({ date: editDate, time: editTime });
  }

  async function quickCreateWorkOrder() {
    if (!appointment?._id) return;

    setCreatingWorkOrder(true);
    setError("");
    setMessage("");

    try {
      const response = await createWorkOrder({ appointmentId: appointment._id }, token);
      const workOrderId = response?.workOrder?._id;

      if (workOrderId) {
        navigate(`/admin/workorders/${workOrderId}`);
        return;
      }

      setError("Work order was created, but could not open details automatically.");
    } catch (err) {
      const duplicateWorkOrderId = err.response?.data?.workOrder?._id;
      if (err.response?.status === 409 && duplicateWorkOrderId) {
        navigate(`/admin/workorders/${duplicateWorkOrderId}`);
        return;
      }

      const msg = err.response?.data?.message || err.response?.data?.error || "Unable to create work order.";
      setError(msg);
    } finally {
      setCreatingWorkOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-booking-container">
        <h2>Appointment Details</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="admin-booking-container">
        <h2>Appointment Details</h2>
        <p>Appointment not found.</p>
      </div>
    );
  }

  const clientName = appointment.clientId
    ? `${appointment.clientId.firstName || ""} ${appointment.clientId.lastName || ""}`.trim()
    : "Client";
  const clientEmail = appointment.clientId?.email || "-";
  const serviceName = appointment.serviceType || appointment.serviceId?.name || "Service";
  const firearmName = `${appointment.firearmId?.manufacturer || appointment.firearmId?.make || "Firearm"} ${appointment.firearmId?.model || ""}`.trim();
  const gunsmithId = appointment.gunsmithId?._id || appointment.gunsmithId || "";
  const gunsmithName = appointment.gunsmithId
    ? `${appointment.gunsmithId.firstName || ""} ${appointment.gunsmithId.lastName || ""}`.trim() || appointment.gunsmithId.email || "Assigned Gunsmith"
    : "Assigned Gunsmith";

  return (
    <div className="admin-booking-container">
      <button className="admin-booking-back" onClick={() => navigate("/admin/appointments")}>Back to List</button>

      <div className="admin-booking-details">
        <h3>Appointment Details</h3>

        {message && <p className="admin-booking-success">{message}</p>}
        {error && <p className="admin-booking-error">{error}</p>}

        <div className="admin-booking-summary-grid">
          <div className="admin-booking-summary-card">
            <span>Client</span>
            <strong>{clientName}</strong>
            <small>{clientEmail}</small>
          </div>
          <div className="admin-booking-summary-card">
            <span>Service</span>
            <strong>{serviceName}</strong>
            <small>{firearmName}</small>
          </div>
          <div className="admin-booking-summary-card">
            <span>Status</span>
            <strong className={`admin-booking-status status-${appointment.status}`}>{appointment.status}</strong>
            <small>{new Date(appointment.date).toLocaleString()}</small>
          </div>
        </div>

        {appointment.notes && (
          <p><strong>Notes:</strong> {appointment.notes}</p>
        )}

        <div className="admin-booking-actions">
          <button
            className="admin-approve-btn"
            disabled={saving}
            onClick={confirmAppointment}
          >
            Confirm
          </button>

          <button
            className="admin-decline-btn"
            disabled={saving}
            onClick={rejectAppointment}
          >
            Reject
          </button>
        </div>

        <div className="admin-booking-workorder">
          <h4>Work Order</h4>
          {appointment.status === "approved" ? (
            <button
              className="admin-create-workorder-btn"
              type="button"
              disabled={saving || creatingWorkOrder}
              onClick={quickCreateWorkOrder}
            >
              {creatingWorkOrder ? "Creating Work Order..." : "Quick Create Work Order"}
            </button>
          ) : (
            <p className="admin-booking-muted">Approve this appointment first to create a work order.</p>
          )}
        </div>

        <div className="admin-booking-reschedule">
          <h4>Reschedule</h4>
          <p className="admin-booking-muted">Available times are pulled from {gunsmithName}'s schedule for the selected day.</p>
          <AdminCalendar onSelectDay={(selectedDay) => setEditDate(selectedDay)} />
          <ClientSideTimeSelect
            gunsmithId={gunsmithId}
            day={editDate}
            selectedTime={editTime}
            onSelect={setEditTime}
          />
          <button
            className="admin-approve-btn"
            disabled={saving}
            onClick={rescheduleAppointment}
          >
            Reschedule Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
