import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../state/AppState";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { getConversations, sendConversationMessage } from "../../services/messageService";
import "./MessageCenter.css";

export default function MessageCenter() {
  const { token, role, user } = useAppState();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [draftText, setDraftText] = useState("");
  const [sending, setSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const currentUserId = user?.id || user?._id;

  const startUserId = searchParams.get("userId");
  const startAppointmentId = searchParams.get("appointmentId");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadConversations() {
      try {
        const data = await getConversations(token);
        setConversations(data || []);
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [token]);

  useEffect(() => {
    if ((role !== "gunsmith" && role !== "client") || !token || !currentUserId) {
      setContacts([]);
      return;
    }

    async function loadRoleContacts() {
      try {
        setLoadingContacts(true);
        const endpoint = role === "gunsmith"
          ? `/appointments/gunsmith/${currentUserId}`
          : `/appointments/client/${currentUserId}`;

        const res = await api.get(
          endpoint,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const byContact = new Map();
        (res.data || []).forEach((appointment) => {
          const participant = role === "gunsmith" ? appointment?.clientId : appointment?.gunsmithId;
          const participantId = participant?._id || participant?.id;
          if (!participantId) return;

          if (!byContact.has(participantId)) {
            byContact.set(participantId, {
              id: participantId,
              name:
                `${participant?.firstName || ""} ${participant?.lastName || ""}`.trim() ||
                participant?.fullName ||
                participant?.name ||
                participant?.email ||
                (role === "gunsmith" ? "Client" : "Gunsmith"),
              email: participant?.email || "",
              appointments: []
            });
          }

          byContact.get(participantId).appointments.push({
            id: appointment._id,
            label: `${appointment.serviceType || appointment.serviceId?.name || "Service"} • ${new Date(appointment.date).toLocaleString()}`
          });
        });

        setContacts(Array.from(byContact.values()));
      } catch (err) {
        console.error("Error loading messaging contact targets:", err);
      } finally {
        setLoadingContacts(false);
      }
    }

    loadRoleContacts();
  }, [currentUserId, role, token]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === recipientId),
    [contacts, recipientId]
  );

  useEffect(() => {
    if (!selectedContact?.appointments?.length) {
      setAppointmentId("");
      return;
    }

    const hasSelected = selectedContact.appointments.some((a) => a.id === appointmentId);
    if (!hasSelected) {
      setAppointmentId(selectedContact.appointments[0].id);
    }
  }, [appointmentId, selectedContact]);

  useEffect(() => {
    if (!startUserId) return;

    const target = startAppointmentId
      ? `/messages/${startUserId}?appointmentId=${encodeURIComponent(startAppointmentId)}`
      : `/messages/${startUserId}`;

    navigate(target, { replace: true });
  }, [navigate, startAppointmentId, startUserId]);

  useEffect(() => {
    if (startUserId) return;
    if (!startAppointmentId) return;
    if (!conversations.length) return;

    const newest = conversations[0];
    if (!newest?._id) return;

    navigate(`/messages/${newest._id}?appointmentId=${encodeURIComponent(startAppointmentId)}`, {
      replace: true
    });
  }, [conversations, navigate, startAppointmentId, startUserId]);

  useEffect(() => {
    if (startUserId || startAppointmentId) return;
    if (!conversations.length) return;

    const firstConversationId = conversations[0]?._id;
    if (!firstConversationId) return;

    navigate(`/messages/${firstConversationId}`, { replace: true });
  }, [conversations, navigate, startAppointmentId, startUserId]);

  if (loading) return <div className="msg-container">Loading...</div>;

  async function startConversation() {
    if (!token || !currentUserId) return;
    if (!recipientId.trim() || !draftText.trim()) {
      setComposeError("Recipient and message are required.");
      return;
    }

    try {
      setComposeError("");
      setSending(true);

      await sendConversationMessage(token, {
        senderId: currentUserId,
        receiverId: recipientId.trim(),
        appointmentId: appointmentId || undefined,
        text: draftText.trim()
      });

      const target = appointmentId
        ? `/messages/${recipientId.trim()}?appointmentId=${encodeURIComponent(appointmentId)}`
        : `/messages/${recipientId.trim()}`;

      navigate(target);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setComposeError(err.response?.data?.message || err.response?.data?.error || "Unable to start conversation.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="msg-container">
      <h2>Message Center</h2>

      {(role === "gunsmith" || role === "client") && (
        <div className="msg-compose-card">
          <h3>Start New Conversation</h3>

          {loadingContacts ? <p>Loading client targets...</p> : null}
          {composeError ? <p className="msg-compose-error">{composeError}</p> : null}

          <div className="msg-compose-grid">
            <label htmlFor="msg-recipient-select">{role === "gunsmith" ? "Select Client" : "Select Gunsmith"}</label>
            <select
              id="msg-recipient-select"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            >
              <option value="">{role === "gunsmith" ? "Choose a client" : "Choose a gunsmith"}</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}{contact.email ? ` (${contact.email})` : ""}
                </option>
              ))}
            </select>

            <label htmlFor="msg-appointment-select">Link Appointment (optional)</label>
            <select
              id="msg-appointment-select"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              disabled={!selectedContact?.appointments?.length}
            >
              <option value="">No appointment linked</option>
              {(selectedContact?.appointments || []).map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.label}
                </option>
              ))}
            </select>

            <label htmlFor="msg-compose-input">Message</label>
            <textarea
              id="msg-compose-input"
              placeholder="Type your first message..."
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="msg-compose-btn"
            disabled={sending}
            onClick={startConversation}
          >
            {sending ? "Starting..." : "Start Conversation"}
          </button>
        </div>
      )}

      <div className="msg-list">
        {conversations.length === 0 && <p>No conversations yet.</p>}

        {conversations.map((c) => (
          <div
            key={c._id}
            className="msg-card"
            onClick={() => navigate(`/messages/${c._id}`)}
          >
            <h3>
              {c.participant
                ? `${c.participant.firstName || ""} ${c.participant.lastName || ""}`.trim()
                : "Conversation"}
            </h3>

            <p className="msg-preview">
              {c.lastMessage?.text || "No messages yet"}
            </p>

            {c.lastMessage?.createdAt && (
              <p className="msg-timestamp">
                {new Date(c.lastMessage.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
