import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppState } from "../../state/AppState";
import {
  createWorkOrder,
  fetchGunsmithAppointments,
  fetchWorkOrders
} from "../../services/workOrderService";
import "./WorkOrderManager.css";

export default function WorkOrderManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user, workOrderDraft } = useAppState();
  const [workOrders, setWorkOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [creatingAppointmentId, setCreatingAppointmentId] = useState("");
  const [filter, setFilter] = useState("all");
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false);

  useEffect(() => {
    async function loadWorkOrders() {
      try {
        const gunsmithId = user?.id || user?._id;
        if (!gunsmithId) {
          setWorkOrders([]);
          setAppointments([]);
          return;
        }

        setError("");
        const [ordersData, appointmentsData] = await Promise.all([
          fetchWorkOrders(token),
          fetchGunsmithAppointments(gunsmithId, token)
        ]);

        setWorkOrders(Array.isArray(ordersData) ? ordersData : []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (err) {
        console.error("Error loading work orders:", err);
        setError("Could not load work orders and approved appointments.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkOrders();
  }, [token, user?.id, user?._id]);

  const acceptedAppointmentsWithoutWorkOrders = useMemo(() => {
    const linkedAppointmentIds = new Set(
      workOrders
        .map((wo) => (typeof wo.appointmentId === "string" ? wo.appointmentId : wo.appointmentId?._id))
        .filter(Boolean)
    );

    return appointments.filter((appointment) => (
      appointment.status === "approved" && !linkedAppointmentIds.has(appointment._id)
    ));
  }, [appointments, workOrders]);

  const notStartedCount = useMemo(() => (
    workOrders.filter((wo) => (wo.progress || "not started") === "not started").length
  ), [workOrders]);

  const pickDraftAppointment = useCallback((candidates) => {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return null;
    }

    const preferredFirearmId = workOrderDraft?.preferredFirearmId;
    const preferredClientId = workOrderDraft?.preferredClientId;

    const byFirearm = preferredFirearmId
      ? candidates.find((a) => String(a.firearmId?._id || a.firearmId) === String(preferredFirearmId))
      : null;
    if (byFirearm) return byFirearm;

    const byClient = preferredClientId
      ? candidates.find((a) => String(a.clientId?._id || a.clientId) === String(preferredClientId))
      : null;
    if (byClient) return byClient;

    return candidates[0];
  }, [workOrderDraft?.preferredClientId, workOrderDraft?.preferredFirearmId]);

  async function handleCreateFromAppointment(appointmentId) {
    try {
      setCreateMessage("");
      setCreateError("");
      setCreatingAppointmentId(appointmentId);

      const response = await createWorkOrder({ appointmentId }, token);
      const created = response?.workOrder;

      if (created?._id) {
        setWorkOrders((prev) => [created, ...prev]);
        navigate(`/admin/workorders/${created._id}`);
        return;
      }

      setCreateError("Work order was created, but details could not be opened automatically.");
    } catch (err) {
      console.error("Error creating work order:", err);
      const existingId = err.response?.data?.workOrder?._id;
      if (err.response?.status === 409 && existingId) {
        navigate(`/admin/workorders/${existingId}`);
        return;
      }

      const message = err.response?.data?.message || err.response?.data?.error || "Unable to create work order.";
      setCreateError(message);
    } finally {
      setCreatingAppointmentId("");
    }
  }

  const handleCreateFromDraftAppointment = useCallback(async (appointmentId) => {
    if (!workOrderDraft) {
      setCreateError("No AI draft found. Generate a draft in AI Analyzer first.");
      return;
    }

    try {
      setCreateMessage("");
      setCreateError("");
      setCreatingAppointmentId(appointmentId);

      const payload = {
        appointmentId,
        partsNeeded: Array.isArray(workOrderDraft.partsNeeded) ? workOrderDraft.partsNeeded : [],
        estimatedTime: Number(workOrderDraft.estimatedTime ?? workOrderDraft.invoice?.laborTime ?? 0),
        notes: typeof workOrderDraft.notes === "string"
          ? workOrderDraft.notes.slice(0, 500)
          : "",
        progress: workOrderDraft.progress || "not started",
        invoice: workOrderDraft.invoice || undefined
      };

      const response = await createWorkOrder(payload, token);
      const created = response?.workOrder;

      if (created?._id) {
        setWorkOrders((prev) => [created, ...prev]);
        dispatch({ type: "SET_WORKORDER_DRAFT", payload: null });
        setCreateMessage("Work order created from AI draft.");
        navigate(`/admin/workorders/${created._id}`);
        return;
      }

      setCreateError("Draft work order was created, but details could not be opened automatically.");
    } catch (err) {
      console.error("Error creating work order from draft:", err);
      const existingId = err.response?.data?.workOrder?._id;
      if (err.response?.status === 409 && existingId) {
        navigate(`/admin/workorders/${existingId}`);
        return;
      }

      const message = err.response?.data?.message || err.response?.data?.error || "Unable to create draft work order.";
      setCreateError(message);
    } finally {
      setCreatingAppointmentId("");
    }
  }, [dispatch, navigate, token, workOrderDraft]);

  useEffect(() => {
    if (autoCreateAttempted) return;
    if (!location.state?.autoCreateFromDraft) return;
    if (loading) return;

    setAutoCreateAttempted(true);

    if (!workOrderDraft) {
      setCreateError("No AI draft found. Generate a draft in AI Analyzer first.");
      return;
    }

    if (!acceptedAppointmentsWithoutWorkOrders.length) {
      setCreateError("No approved appointments available to create a work order from draft.");
      return;
    }

    const selectedAppointment = pickDraftAppointment(acceptedAppointmentsWithoutWorkOrders);
    if (!selectedAppointment?._id) {
      setCreateError("Could not resolve an appointment for draft generation.");
      return;
    }

    handleCreateFromDraftAppointment(selectedAppointment._id);
  }, [
    autoCreateAttempted,
    location.state,
    loading,
    workOrderDraft,
    acceptedAppointmentsWithoutWorkOrders,
    handleCreateFromDraftAppointment,
    pickDraftAppointment
  ]);

  function filteredOrders() {
    if (filter === "all") return workOrders;
    return workOrders.filter((wo) => (wo.progress || "not started") === filter);
  }

  if (loading) return <div className="wo-container">Loading...</div>;

  return (
    <div className="wo-container">
      <h2>Work Order Manager</h2>

      <div className="wo-create-section">
        <h3>Accepted Appointments Ready for Work Order</h3>
        <p>
          Current not started work orders: <strong>{notStartedCount}</strong>
        </p>
        {location.state?.createFromDraft && workOrderDraft ? (
          <p className="wo-draft-tip">
            AI draft detected. Work order generation will auto-start from the best matching approved appointment.
          </p>
        ) : null}
        {createMessage ? <p className="wo-success">{createMessage}</p> : null}
        {createError ? <p className="wo-error">{createError}</p> : null}

        {acceptedAppointmentsWithoutWorkOrders.length === 0 ? (
          <p>Finish work orders in a timely fasion to ensure Client satisfaction.</p>
        ) : (
          <div className="wo-ready-grid">
            {acceptedAppointmentsWithoutWorkOrders.map((appointment) => {
              const serviceName = appointment.serviceType || appointment.serviceId?.name || "Service";
              const firearmMake = appointment.firearmId?.manufacturer || appointment.firearmId?.make || "Firearm";
              const firearmModel = appointment.firearmId?.model || "";
              const client = appointment.clientId;
              const clientName = client
                ? `${client.firstName || ""} ${client.lastName || ""}`.trim() || client.fullName || client.name || client.email
                : "Client";

              return (
                <div key={appointment._id} className="wo-ready-card">
                  <p><strong>Client:</strong> {clientName}</p>
                  <p><strong>Service:</strong> {serviceName}</p>
                  <p><strong>Firearm:</strong> {`${firearmMake} ${firearmModel}`.trim()}</p>
                  <p><strong>Date:</strong> {appointment.date ? new Date(appointment.date).toLocaleString() : "N/A"}</p>
                  <button
                    type="button"
                    className="wo-btn"
                    disabled={creatingAppointmentId === appointment._id}
                    onClick={() => handleCreateFromAppointment(appointment._id)}
                  >
                    {creatingAppointmentId === appointment._id ? "Creating..." : "Create Work Order"}
                  </button>
                  {workOrderDraft ? (
                    <button
                      type="button"
                      className="wo-btn wo-btn-secondary"
                      disabled={creatingAppointmentId === appointment._id}
                      onClick={() => handleCreateFromDraftAppointment(appointment._id)}
                    >
                      {creatingAppointmentId === appointment._id ? "Creating..." : "Create Work Order From Draft"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="wo-filters">
        <button
          className={filter === "all" ? "wo-filter-active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "not started" ? "wo-filter-active" : ""}
          onClick={() => setFilter("not started")}
        >
          Not Started
        </button>

        <button
          className={filter === "in progress" ? "wo-filter-active" : ""}
          onClick={() => setFilter("in progress")}
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

      {error ? <p>{error}</p> : null}

      {/* Work Order Grid */}
      <div className="wo-grid">
        {filteredOrders().map((wo) => (
          <div key={wo._id} className="wo-card">
            <h3>Work Order #{wo._id.slice(-6)}</h3>

            {(() => {
              const serviceName = wo.appointmentId?.serviceId?.name || wo.appointmentId?.serviceType || "N/A";
              const firearmMake = wo.appointmentId?.firearmId?.manufacturer || "Unknown";
              const firearmModel = wo.appointmentId?.firearmId?.model || "Model";
              const progress = wo.progress || "not started";
              const progressClass = progress.replace(/\s+/g, "-");
              const laborHours = wo.invoice?.laborTime ?? wo.estimatedTime ?? 0;
              const partsNeeded = Array.isArray(wo.partsNeeded) && wo.partsNeeded.length
                ? wo.partsNeeded.join(", ")
                : "None";
              const client = wo.clientName
                || `${wo.appointmentId?.clientId?.firstName || ""} ${wo.appointmentId?.clientId?.lastName || ""}`.trim()
                || wo.appointmentId?.clientId?.fullName
                || wo.appointmentId?.clientId?.name
                || wo.appointmentId?.clientId?.email
                || "Client";
              const acceptedAt = wo.acceptedAt ? new Date(wo.acceptedAt).toLocaleString() : "N/A";

              return (
                <>
                  <p>
                    <strong>Client:</strong> {client}
                  </p>

                  <p>
                    <strong>Date Accepted:</strong> {acceptedAt}
                  </p>

                  <p>
                    <strong>Service:</strong> {serviceName}
                  </p>

                  <p>
                    <strong>Firearm:</strong> {firearmMake} {firearmModel}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`wo-status wo-${progressClass}`}>
                      {progress}
                    </span>
                  </p>

                  <p>
                    <strong>Labor Hours:</strong> {laborHours}
                  </p>

                  <p>
                    <strong>Parts Used:</strong> {partsNeeded}
                  </p>
                </>
              );
            })()}


            <Link to={`/admin/workorders/${wo._id}`} className="wo-btn">
              Open Work Order
            </Link>
          </div>
        ))}
      </div>

      {!error && filteredOrders().length === 0 ? <p>No work orders found for this filter.</p> : null}
    </div>
  );
}
