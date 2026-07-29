import "./ChatBubble.css";

export default function ChatBubble({ message, isSender }) {
  return (
    <div className={`chatbubble ${isSender ? "sender" : "receiver"}`}>
      <div className="chatbubble-content">
        <p>{message.text}</p>
        <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
      </div>

      <div className="chatbubble-time">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}
      </div>
    </div>
  );
}
