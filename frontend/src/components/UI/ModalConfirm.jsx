import Modal from "./Modal";

export default function ModalConfirm({
  open,
  title = "Confirm Action",
  message = "Are you sure?",
  onConfirm,
  onCancel
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p>{message}</p>

      <div className="modal-footer">
        <button className="modal-btn danger" onClick={onConfirm}>
          Yes
        </button>
        <button className="modal-btn" onClick={onCancel}>
          No
        </button>
      </div>
    </Modal>
  );
}
