import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MessageCenter.css";

export default function MessageCenter() {
  const { token, user } = useAppState();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/messages/conversations",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(res.data);
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [token]);

  if (loading) return <div className="msg-container">Loading...</div>;

  return (
    <div className="msg-container">
      <h2>Message Center</h2>

      <div className="msg-list">
        {conversations.map((c) => (
          <div
            key={c._id}
            className="msg-card"
            onClick={() => navigate(`/messages/${c._id}`)}
          >
            <h3>{c.title || "Conversation"}</h3>

            <p>
              <strong>Appointment:</strong> {c.appointment?.service}
            </p>

            <p className="msg-preview">
              {c.lastMessage?.text || "No messages yet"}
            </p>

            <p className="msg-timestamp">
              {new Date(c.lastMessage?.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
