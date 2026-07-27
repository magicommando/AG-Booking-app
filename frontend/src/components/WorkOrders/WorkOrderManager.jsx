import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import { Link } from "react-router-dom";
import axios from "axios";
import "./WorkOrderManager.css";

export default function WorkOrderManager() {
  const { token } = useAppState();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadWorkOrders() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/workorders",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkOrders(res.data);
      } catch (err) {
        console.error("Error loading work orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkOrders();
  }, [token]);

  function filteredOrders() {
    if (filter === "all") return workOrders;
    return workOrders.filter((wo) => wo.status === filter);
  }

  if (loading) return <div className="wo-container">Loading...</div>;

  return (
    <div className="wo-container">
      <h2>Work Order Manager</h2>

      {/* Filters */}
      <div className="wo-filters">
        <button
          className={filter === "all" ? "wo-filter-active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "pending" ? "wo-filter-active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>

        <button
          className={filter === "in-progress" ? "wo-filter-active" : ""}
          onClick={() => setFilter("in-progress")}
        >
          In Progress
        </button>

        <button
          className={filter === "completed" ? "wo-filter-active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      {/* Work Order Grid */}
      <div className="wo-grid">
        {filteredOrders().map((wo) => (
          <div key={wo._id} className="wo-card">
            <h3>Work Order #{wo._id.slice(-6)}</h3>

            <p>
              <strong>Service:</strong> {wo.appointment?.service}
            </p>

            <p>
              <strong>Firearm:</strong> {wo.firearm?.make} {wo.firearm?.model}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`wo-status wo-${wo.status}`}>
                {wo.status}
              </span>
            </p>

            <p>
              <strong>Labor Hours:</strong> {wo.laborHours || 0}
            </p>

            <p>
              <strong>Parts Used:</strong>{" "}
              {wo.partsUsed?.length ? wo.partsUsed.join(", ") : "None"}
            </p>

            <Link to={`/admin/workorders/${wo._id}`} className="wo-btn">
              Open Work Order
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
