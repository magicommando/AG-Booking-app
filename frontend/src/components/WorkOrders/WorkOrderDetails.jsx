import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import {
  completeWorkOrder,
  fetchWorkOrderById,
  updateWorkOrder
} from "../../services/workOrderService";
import "./WorkOrderDetails.css";

export default function WorkOrderDetails() {
  const { token } = useAppState();
  const { id } = useParams();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [laborHours, setLaborHours] = useState(0);
  const [partsNeeded, setPartsNeeded] = useState([]);
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState("not started");
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySms, setNotifySms] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  const [newPart, setNewPart] = useState("");

  useEffect(() => {
    async function loadWorkOrder() {
      try {
        setError("");
        const data = await fetchWorkOrderById(id, token);

        setWorkOrder(data);

        setLaborHours(data.invoice?.laborTime ?? data.estimatedTime ?? 0);
        setPartsNeeded(data.partsNeeded || []);
        setNotes(data.notes || "");
        setProgress(data.progress || "not started");
        setNotifyEmail(Boolean(data.completionNotification?.email));
        setNotifySms(Boolean(data.completionNotification?.sms));
        setCompletionMessage(
          data.completionNotification?.message || generateCompletionMessage(data)
        );
      } catch (err) {
        console.error("Error loading work order:", err);
        setError("Could not load this work order.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkOrder();
  }, [id, token]);

  function generateCompletionMessage(workOrderData) {
    const appointment = workOrderData?.appointmentId;
    const firearm = appointment?.firearmId;
    const service = appointment?.serviceId;
    const client = workOrderData?.clientName
      || `${appointment?.clientId?.firstName || ""} ${appointment?.clientId?.lastName || ""}`.trim()
      || appointment?.clientId?.fullName
      || appointment?.clientId?.name
      || appointment?.clientId?.email
      || "Client";
    const firearmName = `${firearm?.manufacturer || firearm?.make || "Firearm"} ${firearm?.model || ""}`.trim();
    const serviceName = service?.name || appointment?.serviceType || "your service";
    const appointmentDate = appointment?.date ? new Date(appointment.date).toLocaleDateString() : "your appointment date";

    return `Hello ${client}, your ${firearmName} service (${serviceName}) from ${appointmentDate} has been completed. If you selected email or SMS updates, this is your completion notice. Reply with any follow-up questions.`;
  }

  async function saveWorkOrder() {
    try {
      const payload = {
        partsNeeded,
        estimatedTime: laborHours,
        progress,
        notes,
        invoice: {
          ...(workOrder?.invoice || {}),
          laborTime: laborHours
        },
        completionNotification: {
          email: notifyEmail,
          sms: notifySms,
          message: completionMessage
        }
      };

      const response = await updateWorkOrder(id, payload, token);
      if (response?.workOrder) {
        setWorkOrder(response.workOrder);
      }

      alert("Work order updated");
    } catch (err) {
      console.error("Error saving work order:", err);
    }
  }

  function addPart() {
    if (!newPart.trim()) return;
    setPartsNeeded([...partsNeeded, newPart.trim()]);
    setNewPart("");
  }

  function removePart(index) {
    setPartsNeeded(partsNeeded.filter((_, i) => i !== index));
  }

  async function finalizeWorkOrder() {
    if (!window.confirm("Mark this work order as completed?")) return;

    try {
      const response = await completeWorkOrder(id, token, {
        completionNotification: {
          email: notifyEmail,
          sms: notifySms,
          message: completionMessage
        }
      });
      if (response?.workOrder) {
        setWorkOrder(response.workOrder);
        setNotifyEmail(Boolean(response.workOrder.completionNotification?.email));
        setNotifySms(Boolean(response.workOrder.completionNotification?.sms));
        setCompletionMessage(response.workOrder.completionNotification?.message || completionMessage);
      }

      setProgress("completed");
      alert("Work order marked as completed");
    } catch (err) {
      console.error("Error finalizing work order:", err);
    }
  }

  if (loading) return <div className="wo-details-container">Loading...</div>;
  if (!workOrder) return <div className="wo-details-container">{error || "Work order not found."}</div>;

  const appointment = workOrder.appointmentId;
  const firearm = appointment?.firearmId;
  const service = appointment?.serviceId;
  const date = appointment?.date ? new Date(appointment.date) : null;
  const clientName = workOrder.clientName
    || `${appointment?.clientId?.firstName || ""} ${appointment?.clientId?.lastName || ""}`.trim()
    || appointment?.clientId?.fullName
    || appointment?.clientId?.name
    || appointment?.clientId?.email
    || "N/A";
  const acceptedDate = workOrder.acceptedAt ? new Date(workOrder.acceptedAt) : null;

  return (
    <div className="wo-details-container">
      <h2>Work Order #{id.slice(-6)}</h2>

      {/* Appointment Info */}
      <div className="wo-details-card">
        <h3>Appointment</h3>
        <p><strong>Client:</strong> {clientName}</p>
        <p><strong>Date Accepted:</strong> {acceptedDate ? acceptedDate.toLocaleString() : "N/A"}</p>
        <p><strong>Service:</strong> {service?.name || appointment?.serviceType || "N/A"}</p>
        <p><strong>Date:</strong> {date ? date.toLocaleDateString() : "N/A"}</p>
        <p><strong>Time:</strong> {date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</p>
      </div>

      {/* Firearm Info */}
      <div className="wo-details-card">
        <h3>Firearm</h3>
        <p>{firearm?.manufacturer} {firearm?.model}</p>
        <p><strong>Serial:</strong> {firearm?.serial}</p>
      </div>

      {/* Labor */}
      <div className="wo-details-card">
        <h3>Labor Hours</h3>
        <input
          type="number"
          value={laborHours}
          onChange={(e) => setLaborHours(Number(e.target.value))}
          className="wo-input"
        />
      </div>

      {/* Parts Used */}
      <div className="wo-details-card">
        <h3>Parts Used</h3>

        <ul className="wo-parts-list">
          {partsNeeded.map((p, i) => (
            <li key={i}>
              {p}
              <button className="wo-remove-btn" onClick={() => removePart(i)}>
                ✖
              </button>
            </li>
          ))}
        </ul>

        <div className="wo-add-part">
          <input
            type="text"
            placeholder="Add part..."
            value={newPart}
            onChange={(e) => setNewPart(e.target.value)}
            className="wo-input"
          />
          <button className="wo-btn" onClick={addPart}>Add</button>
        </div>
      </div>

      {/* Notes */}
      <div className="wo-details-card">
        <h3>Notes</h3>
        <textarea
          className="wo-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="wo-details-card">
        <h3>Status</h3>
        <select
          className="wo-input"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        >
          <option value="not started">Not Started</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="wo-details-card">
        <h3>Completion Notification</h3>
        <div className="wo-notify-options">
          <label className="wo-checkbox-row">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
            />
            Send Email Notification
          </label>
          <label className="wo-checkbox-row">
            <input
              type="checkbox"
              checked={notifySms}
              onChange={(e) => setNotifySms(e.target.checked)}
            />
            Send SMS Notification
          </label>
        </div>

        <p className="wo-notify-helper">Auto-generated message based on the approved firearm appointment.</p>
        <textarea
          className="wo-textarea"
          value={completionMessage}
          onChange={(e) => setCompletionMessage(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="wo-actions">
        <button className="wo-btn" onClick={saveWorkOrder}>
          Save Changes
        </button>

        <button className="wo-finalize-btn" onClick={finalizeWorkOrder}>
          Finalize Work Order
        </button>
      </div>
    </div>
  );
}
