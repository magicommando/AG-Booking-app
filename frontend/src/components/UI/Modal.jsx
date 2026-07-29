import ReactDOM from "react-dom";
import "./Modal.css";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="modal-title">{title}</h3>}

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <button className="modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
