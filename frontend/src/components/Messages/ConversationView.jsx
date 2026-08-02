import ChatBubble from "./ChatBubble";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import { getConversation, getConversations, sendConversationMessage } from "../../services/messageService";
import "./MessageCenter.css";

export default function ConversationView() {
  const { token, user } = useAppState();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUserId = user?.id || user?._id;

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [errorThread, setErrorThread] = useState(null);

  useEffect(() => {
    if (!token || !currentUserId || !conversationId) {
      setLoading(false);
      return;
    }

    async function loadConversation() {
      try {
        setErrorThread(null);
        const data = await getConversation(token, currentUserId, conversationId);
        setMessages(data || []);
      } catch (err) {
        console.error("Error loading conversation:", err);
        setErrorThread("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    }

    loadConversation();
  }, [conversationId, currentUserId, token]);

  useEffect(() => {
    if (!token) return;

    async function loadConversations() {
      try {
        const data = await getConversations(token);
        setConversations(data || []);
      } catch (err) {
        console.error("Error loading conversation list:", err);
      }
    }

    loadConversations();
  }, [token]);

  if (errorThread) return <p>{errorThread}</p>;

  async function sendMessage() {
    if (!text.trim() || !token || !currentUserId || !conversationId) return;

    try {
      const appointmentId = searchParams.get("appointmentId") || undefined;
      const res = await sendConversationMessage(token, {
        senderId: currentUserId,
        receiverId: conversationId,
        appointmentId,
        text
      });

      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
      }
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  if (loading) return <div className="msg-container">Loading...</div>;

  return (
    <div className="msg-container">
      <h2>Conversation</h2>

      <div className="msg-thread-toolbar">
        <button type="button" onClick={() => navigate("/messages")}>All Conversations</button>
        <select
          value={conversationId || ""}
          onChange={(e) => {
            if (!e.target.value) return;
            navigate(`/messages/${e.target.value}`);
          }}
        >
          <option value="" disabled>Select conversation</option>
          {conversations.map((c) => {
            const name = c.participant
              ? `${c.participant.firstName || ""} ${c.participant.lastName || ""}`.trim() || "Conversation"
              : "Conversation";
            return (
              <option key={c._id} value={c._id}>{name}</option>
            );
          })}
        </select>
      </div>

      <div className="msg-thread">
        {messages.map((m) => (
          <ChatBubble
            key={m._id}
            message={m}
            isSender={String(m.sender?._id || m.sender) === String(currentUserId)}
          />
        ))}
        {messages.length === 0 && <p>No messages yet. Start the conversation.</p>}
      </div>

      <div className="msg-input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
