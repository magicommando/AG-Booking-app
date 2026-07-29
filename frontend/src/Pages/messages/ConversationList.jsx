import { useEffect, useState } from "react";
import axios from "axios";
import { useAppState } from "../../state/AppState";
import { useNavigate } from "react-router-dom";

export default function ConversationList() {
  const { token } = useAppState();
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    setLoadingMessages(true);
    axios
      .get("http://localhost:5000/api/messages", authHeader(token))
      .then(res => setConversations(res.data))
      .finally(() => setLoadingMessages(false))
      .catch(err => console.error(err));
  }, [token]);

  if (loadingMessages) {
    return <p>Loading conversations...</p>;
  }

  return (
    <div className="conversation-list">
      <h2>Your Conversations</h2>

      {conversations.map(c => (
        <div
          key={c._id}
          className="conversation-item"
          onClick={() => navigate(`/messages/${c._id}`)}
        >
          <p>{c.title || "Conversation"}</p>
          <small>{c.lastMessage?.text}</small>
        </div>
      ))}
    </div>
  );
}
