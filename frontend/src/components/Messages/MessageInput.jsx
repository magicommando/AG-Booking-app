const [sendError, setSendError] = useState(null);

async function submit() {
  try {
    await onSend(text);
    setSendError(null);
  } catch {
    setSendError("Message failed to send");
  }
}

{sendError && <p className="error-text">{sendError}</p>}
