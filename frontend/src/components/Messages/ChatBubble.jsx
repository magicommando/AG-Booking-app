import "./ChatBubble.css";

export default function ChatBubble({ message, isSender }) {
  const content = message?.content || message?.text || "";
  const timeSource = message?.createdAt || message?.timestamp;
  const timeLabel = timeSource
    ? new Date(timeSource).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  return (
    <div className={`chatbubble ${isSender ? "sender" : "receiver"}`}>
      <div className="chatbubble-content">
        <p>{content}</p>
      </div>

      {timeLabel && <div className="chatbubble-time">{timeLabel}</div>}
    </div>
  );
}
