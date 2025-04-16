import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import '../../node_modules/react-datepicker/dist/react-datepicker.css';
import { format, addMinutes } from 'date-fns';
import "../css/style.css";

import { COLLECTIONS } from '../constants/collectionConst';
import createDocument from '../methods/createDocument';
import updateDocumentWithId from '../methods/updateDocumentWithId';
import checkAppointmentConflict from '../methods/checkAppointmentConflict';
import fetchDocuments from '../methods/fetchDocuments';
import fetchDocumentWithId from '../methods/fetchDocumentWithId';

const AppointmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      } else {
        setIsAuthorized(true);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      const clientList = await fetchDocuments(COLLECTIONS.CLIENTS);
      setClients(clientList);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesList = await fetchDocuments(COLLECTIONS.SERVICES);
      setServices(servicesList);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;

      try {
        const appointmentData = await fetchDocumentWithId(COLLECTIONS.APPOINTMENTS, id);
        if (appointmentData) {
          setIsEditMode(true);

          const client = clients.find(c => c.id === appointmentData.client?.id);
          const service = services.find(s => s.id === appointmentData.service?.id);

          if (client) setSelectedClient(client);
          if (service) setSelectedService(service);

          if (appointmentData.dateFrom) {
            setDate(new Date(appointmentData.dateFrom));
          }

          setIsPaid(appointmentData.paid || false);
        }
      } catch (error) {
        console.error("Error fetching appointment: ", error);
      }
    };

    if (clients.length > 0 && services.length > 0) {
      fetchAppointment();
    }
  }, [id, clients, services]);

  const isDayAvailable = (date) => {
    if (!selectedService || !selectedService.availableDays) return true;
    const dayName = format(date, 'EEEE');
    return selectedService.availableDays.includes(dayName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient || !selectedService || !date) return;

    const duration = selectedService.serviceDuration || 30;
    const startDate = date;
    const endDate = addMinutes(startDate, duration);

    const hasConflict = await checkAppointmentConflict(
      COLLECTIONS.APPOINTMENTS,
      startDate,
      endDate
    );

    if (hasConflict) {
      alert("Appointment conflict detected. Please choose a different time.");
      return;
    }

    const appointmentData = {
      client: selectedClient,
      service: selectedService,
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString(),
      status: 'new',
      paid: isPaid,
      createdDate: new Date().toISOString(),
    };

    try {
      if (isEditMode && id) {
        await updateDocumentWithId(COLLECTIONS.APPOINTMENTS, appointmentData, id);
        alert('Appointment Updated Successfully');
      } else {
        await createDocument(appointmentData, COLLECTIONS.APPOINTMENTS);
        alert('Appointment Created Successfully');
      }
      navigate('/schedule');
    } catch (e) {
      alert('Error saving appointment. Please try again later or call Antonato');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-3">{isEditMode ? 'Update Appointment' : 'Add New Appointment'}</h2>
          <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Client Select */}
          <div className="mb-3">
            <label htmlFor="clientSelect" className="form-label">Select Client</label>
            <select
              id="clientSelect"
              className="form-select"
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const selected = clients.find(c => c.id === e.target.value);
                setSelectedClient(selected);
              }}
              required
            >
              <option value="" disabled>-- Select a Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} ({client.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Client Info */}
          {selectedClient && (
            <div className="mb-3">
              {(selectedClient.firstName || selectedClient.lastName) && (
                <p><strong>Name:</strong> {selectedClient.firstName} {selectedClient.lastName}</p>
              )}
              {selectedClient.phoneNumber && (
                <p><strong>Phone:</strong> {selectedClient.phoneNumber}</p>
              )}
              {selectedClient.relativeName && (
                <p><strong>Relative Name:</strong> {selectedClient.relativeName}</p>
              )}
              {selectedClient.relativePhoneNumber && (
                <p><strong>Relative Phone:</strong> {selectedClient.relativePhoneNumber}</p>
              )}
            </div>
          )}

          {/* Service Select */}
          <div className="mb-3">
            <label htmlFor="serviceSelect" className="form-label">Select Service</label>
            <select
              id="serviceSelect"
              className="form-select"
              value={selectedService?.id || ''}
              onChange={(e) => {
                const selected = services.find(s => s.id === e.target.value);
                setSelectedService(selected);
              }}
              required
            >
              <option value="" disabled>-- Select a Service --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.serviceName} : {service.serviceDuration}min / ${service.sessionPrice}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          {selectedService && (
            <div className="mb-3">
              <label className="form-label">Select Date</label>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                filterDate={isDayAvailable}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
                className="form-control"
              />
            </div>
          )}

          {/* Paid Checkbox */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="isPaid">Paid</label>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? 'Update Appointment' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
