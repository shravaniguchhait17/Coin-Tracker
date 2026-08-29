import { createPortal } from 'react-dom';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="pixel-frame modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="quest-title">
          <span className="dot"></span>
          {title}
        </div>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn modal-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
