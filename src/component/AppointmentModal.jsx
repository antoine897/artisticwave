import React from 'react';
import { format } from 'date-fns';
import updateDocumentWithId from '../methods/updateDocumentWithId';
import { COLLECTIONS } from '../constants/collectionConst';

const AppointmentModal = ({ appointment, onClose, onEdit, onDelete }) => {
  if (!appointment) return null;

  const { clients = [], service, status, dateFrom, dateTo } = appointment;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return 'badge bg-primary';
      case 'closed': return 'badge bg-secondary';
      default: return 'badge bg-dark';
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateDocumentWithId(COLLECTIONS.APPOINTMENTS, { status: newStatus }, appointment.id);
      alert(`Status set to "${newStatus}"`);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating status.");
    }
  };

  const handlePaidUpdate = async (index, isPaid) => {
    try {
      const updatedClients = [...clients];
      updatedClients[index].paid = isPaid;

      await updateDocumentWithId(
        COLLECTIONS.APPOINTMENTS,
        { clients: updatedClients },
        appointment.id
      );
      onClose();
    } catch (error) {
      console.error("Failed to update payment:", error);
      alert("Error updating payment status.");
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Appointment Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <h6><strong>Clients:</strong></h6>
            {clients.map((client, index) => (
              <div key={index} className="mb-2">
                <p className="mb-1">
                  <strong>Name:</strong> {client.firstName} {client.lastName}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {client.phoneNumber}
                </p>
                <p className="mb-2">
                  <strong>Amount:</strong> {client.ammountToPay} $
                  {client.paid ? (
                    <span className="text-success"><i className="bi bi-check-circle-fill"></i> Yes</span>
                  ) : (
                    <span className="text-danger"><i className="bi bi-x-circle-fill"></i> No</span>
                  )}
                </p>
                <div className="d-flex gap-2 mb-3">
                  {!client.paid && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handlePaidUpdate(index, true)}
                    >
                      <i className="bi bi-cash-coin"></i> Mark as Paid
                    </button>
                  )}
                  {client.paid && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handlePaidUpdate(index, false)}
                    >
                      <i className="bi bi-cash-coin"></i> Mark as Unpaid
                    </button>
                  )}
                </div>
                <hr />
              </div>
            ))}

            <p><strong>Service:</strong> {service?.serviceName}</p>
            <p><strong>Description:</strong> {service?.serviceDescription}</p>
            <p><strong>Total Price:</strong> ${service?.sessionPrice ? service.sessionPrice * clients.length : 0}</p>

            <hr />

            <p><strong>Date:</strong> {format(new Date(dateFrom), 'PPP')}</p>
            <p><strong>From:</strong> {format(new Date(dateFrom), 'p')}</p>
            <p><strong>To:</strong> {format(new Date(dateTo), 'p')}</p>

            <p><strong>Status:</strong> <span className={getStatusBadge(status)}>{status}</span></p>
          </div>

          <div className="modal-footer d-flex justify-content-between flex-wrap gap-2">
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-warning" onClick={() => onEdit(appointment.id)}>
                <i className="bi bi-pencil"></i> Edit
              </button>
              <button className="btn btn-danger" onClick={onDelete}>
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {status !== 'closed' && (
                <button className="btn btn-outline-secondary" onClick={() => handleStatusUpdate('closed')}>
                  <i className="bi bi-archive"></i> Mark as Closed
                </button>
              )}
            </div>

            <button className="btn btn-secondary mt-2" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
