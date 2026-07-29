import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import ChatBubble from "../../components/Messages/ChatBubble";
import MessageInput from "../../components/Messages/MessageInput";

export default function ConversationView() {
  const { id } = useParams();
  const { token, user } = useAppState();
  const [loadingThread, setLoadingThread] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/${id}`, authHeader(token))
      .then(res => setMessages(res.data))
      .finally(() => setLoadingMessages(false))
      .catch(err => console.error(err));
  }, [id, token]);

  if (loadingMessages) {
    return <p>Loading messages...</p>;
  }

  async function sendMessage(text) {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/messages/${id}`,
        { text },
        authHeader(token)
      );

      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Message send failed:", err);
    }
  }

  return (
    <div className="conversation-view">
      <div className="messages-container">
        {messages.map(m => (
          <ChatBubble
            key={m._id}
            message={m}
            isSender={m.sender === user._id}
          />
        ))}
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
