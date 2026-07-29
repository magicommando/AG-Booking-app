import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setSending(true);
    onSend(text);
    setText("");
    setSending(false);
  }

  <button disabled={sending}>
  {sending ? "Sending..." : "Send"}
</button>

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button onClick={submit}>Send</button>
    </div>
  );
}
