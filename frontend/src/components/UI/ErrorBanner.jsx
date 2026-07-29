export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-banner">
      <p>{message}</p>
      <button onClick={onClose}>X</button>
    </div>
  );
}
