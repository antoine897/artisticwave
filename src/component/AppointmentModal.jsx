// components/AppointmentModal.jsx
import React from 'react';

const AppointmentModal = ({ appointment, onClose, onEdit, onDelete }) => {
  if (!appointment) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Appointment Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>Name:</strong> {appointment.FirstName} {appointment.LastName}</p>
            <p><strong>Phone:</strong> {appointment.PhoneNumber}</p>
            <p><strong>Relative:</strong> {appointment.relativeName} ({appointment.relativePhoneNumber})</p>
            <p><strong>Type:</strong> {appointment.type}</p>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Status:</strong> <span className={appointment.status === "paid" ? "text-success" : "text-danger"}>{appointment.status}</span></p>
            <p><strong>Amount:</strong> ${appointment.amount}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-warning" onClick={() => onEdit(appointment.id)}>
              <i className="bi bi-pencil"></i> Edit
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              <i className="bi bi-trash"></i> Delete
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
