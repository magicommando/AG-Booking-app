import ChatBubble from "./ChatBubble";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import "./MessageCenter.css";

export default function ConversationView() {
  const { token, user } = useAppState();
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState("");
  const [errorThread, setErrorThread] = useState(null);

  useEffect(() => {
    async function loadConversation() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/conversations/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setConversation(res.data.conversation);
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Error loading conversation:", err);
        setErrorThread("Failed to load conversation");
      }
    }

    loadConversation();
  }, [id, token]);

  if (errorThread) return <p>{errorThread}</p>;

  async function sendMessage() {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/messages/${id}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, res.data]);
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  if (!conversation) return <div className="msg-container">Loading...</div>;

  return (
    <div className="msg-container">
      <h2>{conversation.title || "Conversation"}</h2>

      <div className="msg-thread">
        {messages.map((m) => (
          <ChatBubble
            key={m._id}
            message={m}
            isSender={m.sender === user._id}
          />
        ))}
      </div>

      <div className="msg-input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
