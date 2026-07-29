import ReactDOM from "react-dom";
import "./Modal.css";

export default function ModalStack({ modals }) {
  return ReactDOM.createPortal(
    <>
      {modals.map((m, i) =>
        m.open ? (
          <div
            key={i}
            className="modal-backdrop stacked"
            style={{ zIndex: 2000 + i }}
            onClick={m.onClose}
          >
            <div
              className="modal-window"
              style={{ zIndex: 2100 + i }}
              onClick={(e) => e.stopPropagation()}
            >
              {m.title && <h3 className="modal-title">{m.title}</h3>}
              <div className="modal-body">{m.content}</div>
            </div>
          </div>
        ) : null
      )}
    </>,
    document.getElementById("modal-root")
  );
}
