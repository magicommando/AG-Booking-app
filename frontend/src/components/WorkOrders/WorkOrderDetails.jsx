import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import "./WorkOrderDetails.css";

export default function WorkOrderDetails() {
  const { token } = useAppState();
  const { id } = useParams();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [laborHours, setLaborHours] = useState(0);
  const [partsUsed, setPartsUsed] = useState([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  const [newPart, setNewPart] = useState("");

  useEffect(() => {
    async function loadWorkOrder() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/workorders/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setWorkOrder(res.data);

        setLaborHours(res.data.laborHours || 0);
        setPartsUsed(res.data.partsUsed || []);
        setNotes(res.data.notes || "");
        setStatus(res.data.status || "pending");
      } catch (err) {
        console.error("Error loading work order:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkOrder();
  }, [id, token]);

  async function saveWorkOrder() {
    try {
      await axios.put(
        `http://localhost:5000/api/workorders/${id}`,
        {
          laborHours,
          partsUsed,
          notes,
          status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Work order updated");
    } catch (err) {
      console.error("Error saving work order:", err);
    }
  }

  function addPart() {
    if (!newPart.trim()) return;
    setPartsUsed([...partsUsed, newPart]);
    setNewPart("");
  }

  function removePart(index) {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  }

  async function finalizeWorkOrder() {
    if (!window.confirm("Mark this work order as completed?")) return;

    try {
      await axios.put(
        `http://localhost:5000/api/workorders/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("completed");
      alert("Work order marked as completed");
    } catch (err) {
      console.error("Error finalizing work order:", err);
    }
  }

  if (loading) return <div className="wo-details-container">Loading...</div>;
  if (!workOrder) return <div className="wo-details-container">Work order not found.</div>;

  const { appointment, firearm, aiDiagnostics } = workOrder;

  return (
    <div className="wo-details-container">
      <h2>Work Order #{id.slice(-6)}</h2>

      {/* Appointment Info */}
      <div className="wo-details-card">
        <h3>Appointment</h3>
        <p><strong>Service:</strong> {appointment?.service}</p>
        <p><strong>Date:</strong> {appointment?.date}</p>
        <p><strong>Time:</strong> {appointment?.time}</p>
      </div>

      {/* Firearm Info */}
      <div className="wo-details-card">
        <h3>Firearm</h3>
        <p>{firearm?.make} {firearm?.model}</p>
        <p><strong>Serial:</strong> {firearm?.serial}</p>
      </div>

      {/* AI Diagnostics */}
      <div className="wo-details-card">
        <h3>AI Diagnostics</h3>
        {aiDiagnostics ? (
          <pre>{JSON.stringify(aiDiagnostics, null, 2)}</pre>
        ) : (
          <p>No AI diagnostics available.</p>
        )}
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
          {partsUsed.map((p, i) => (
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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
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
