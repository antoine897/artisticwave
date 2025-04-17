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

  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);

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

          const service = services.find(s => s.id === appointmentData.service?.id);
          if (service) setSelectedService(service);

          if (appointmentData.dateFrom) {
            setDate(new Date(appointmentData.dateFrom));
          }

          if (appointmentData.clients?.length) {
            const matchedClients = clients.filter(c => appointmentData.clients.find(ac => ac.id === c.id));
            const clientsWithPaidStatus = matchedClients.map(c => {
              const clientData = appointmentData.clients.find(ac => ac.id === c.id);
              return { ...c, paid: clientData?.paid || false };
            });
            setSelectedClients(clientsWithPaidStatus);
          }
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

    if (!selectedService || !date || selectedClients.length === 0) {
      alert("Please fill all fields.");
      return;
    }

    if (selectedClients.length > selectedService.studentNumber) {
      alert(`You can only select up to ${selectedService.studentNumber} clients.`);
      return;
    }

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
      clients: selectedClients.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        phoneNumber: c.phoneNumber,
        relativeName: c.relativeName || "",
        relativePhoneNumber: c.relativePhoneNumber || "",
        paid: c.paid || false,
        ammountToPay : selectedService.sessionPrice,
      })),
      service: selectedService,
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString(),
      status: 'new',
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
                setDate(null);
                setSelectedClients([]);
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
                onChange={(date) => {
                  setDate(date);
                  setSelectedClients([]);
                }}
                filterDate={isDayAvailable}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
                className="form-control"
              />
            </div>
          )}

          {/* Client Multi-Select */}
          {selectedService && date && (
            <div className="mb-3">
              <label htmlFor="clientSelect" className="form-label">
                Select Clients ({selectedClients.length}/{selectedService.studentNumber})
              </label>
              <select
                id="clientSelect"
                className="form-select"
                multiple
                value={selectedClients.map(c => c.id)}
                onChange={(e) => {
                  const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value);
                  const selected = clients
                    .filter(c => selectedIds.includes(c.id))
                    .map(c => {
                      const existing = selectedClients.find(sc => sc.id === c.id);
                      return existing || { ...c, paid: false };
                    });
                  setSelectedClients(selected);
                }}
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName} ({client.phoneNumber})
                  </option>
                ))}
              </select>
              <small className="text-muted">
                You can select up to {selectedService.studentNumber} clients.
              </small>
            </div>
          )}

          {/* Per-Client Info & Paid Checkbox */}
          {selectedClients.length > 0 && (
            <div className="mb-3">
              <h5>Client Details:</h5>
              {selectedClients.map((client, index) => (
                <div key={client.id} className="border rounded p-2 mb-2">
                  <p><strong>Name:</strong> {client.firstName} {client.lastName}</p>
                  <p><strong>Phone:</strong> {client.phoneNumber}</p>
                  {client.relativeName && <p><strong>Relative Name:</strong> {client.relativeName}</p>}
                  {client.relativePhoneNumber && <p><strong>Relative Phone:</strong> {client.relativePhoneNumber}</p>}
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`paid-${client.id}`}
                      checked={client.paid}
                      onChange={(e) => {
                        const updatedClients = [...selectedClients];
                        updatedClients[index].paid = e.target.checked;
                        setSelectedClients(updatedClients);
                      }}
                    />
                    <label className="form-check-label" htmlFor={`paid-${client.id}`}>
                      Paid
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
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
