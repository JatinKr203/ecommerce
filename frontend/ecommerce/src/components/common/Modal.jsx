function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}><div className="modal-header"><h3>{title}</h3><button className="icon-button" type="button" onClick={onClose} aria-label="Close">×</button></div>{children}</div></div>
}

export default Modal