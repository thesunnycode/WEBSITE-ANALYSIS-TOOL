import React from "react";
import PropTypes from "prop-types";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-10">
        <button
          className="absolute top-2 right-2"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
