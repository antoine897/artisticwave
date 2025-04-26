import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [selectedDates, setSelectedDates] = useState([]); // Multiple dates
  const [selectedClients, setSelectedClients] = useState([]);
  const [tempDate, setTempDate] = useState(null); // Temporarily store selected date

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
            setSelectedDates([new Date(appointmentData.dateFrom)]);
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

  const handleAddDate = () => {
    if (!tempDate) return;
    const isDuplicate = selectedDates.some(d => d.getTime() === tempDate.getTime());
    if (!isDuplicate) {
      setSelectedDates([...selectedDates, tempDate]);
    }
    setTempDate(null);
  };

  const handleRemoveDate = (date) => {
    const newDates = selectedDates.filter(d => d.getTime() !== date.getTime());
    setSelectedDates(newDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService || selectedDates.length === 0 || selectedClients.length === 0) {
      alert("Please fill all fields.");
      return;
    }

    if (selectedClients.length > selectedService.studentNumber) {
      alert(`You can only select up to ${selectedService.studentNumber} clients.`);
      return;
    }

    const duration = selectedService.serviceDuration || 30;
    let hasConflict = false;

    for (let selectedDate of selectedDates) {
      const startDate = selectedDate;
      const endDate = addMinutes(startDate, duration);
      const conflict = await checkAppointmentConflict(
        COLLECTIONS.APPOINTMENTS,
        startDate,
        endDate,
        selectedService
      );
      if (conflict) {
        hasConflict = true;
        break;
      }
    }

    if (hasConflict) {
      alert("Appointment conflict detected. Please choose a different time.");
      return;
    }

    const appointmentData = selectedDates.map((selectedDate) => ({
      clients: selectedClients.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        phoneNumber: c.phoneNumber,
        mailAddress: c.mailAddress,
        relativeName: c.relativeName || "",
        relativePhoneNumber: c.relativePhoneNumber || "",
        paid: false,
        ammountToPay: selectedService.sessionPrice,
      })),
      service: selectedService,
      dateFrom: selectedDate.toISOString(),
      dateTo: addMinutes(selectedDate, duration).toISOString(),
      status: 'new',
      createdDate: new Date().toISOString(),
    }));

    try {
      if (isEditMode && id) {
        await updateDocumentWithId(COLLECTIONS.APPOINTMENTS, appointmentData, id);
        alert('Appointment Updated Successfully');
      } else {
        for (let data of appointmentData) {
          await createDocument(data, COLLECTIONS.APPOINTMENTS);
        }
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
          <div className="mb-3">
            <label htmlFor="serviceSelect" className="form-label">Select Service</label>
            <select
              id="serviceSelect"
              className="form-select"
              value={selectedService?.id || ''}
              onChange={(e) => {
                const selected = services.find(s => s.id === e.target.value);
                setSelectedService(selected);
                setSelectedDates([]);
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

          {/* Custom multiple date-time selector */}
          {selectedService && (
            <div className="mb-3">
              <label className="form-label">Select Date and Time</label>
              <div className="d-flex gap-2">
                <DatePicker
                  selected={tempDate}
                  onChange={(date) => setTempDate(date)}
                  filterDate={isDayAvailable}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="Pp"
                  className="form-control"
                />
                <button type="button" className="btn btn-success" onClick={handleAddDate}>Add</button>
              </div>
              <div className="form-text mt-1">
                {selectedService.studentNumber > 1
                  ? 'Group class: multiple clients can book this time.'
                  : 'One-on-one session: exclusive time slot.'}
              </div>
            </div>
          )}

          {/* Display selected dates */}
          {selectedDates.length > 0 && (
            <div className="mb-3">
              <h5>Selected Dates:</h5>
              <ul>
                {selectedDates.map((date, index) => (
                  <li key={index}>
                    {format(date, 'PPPppp')}{" "}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveDate(date)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Client selection */}
          {selectedService && selectedDates.length > 0 && (
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

          {/* Submit */}
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
