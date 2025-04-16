import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { COLLECTIONS } from '../constants/collectionConst';
import "../css/style.css";

import RightSidebar from './RightSidbar';
import AppointmentModal from './AppointmentModal';
import fetchDocuments from '../methods/fetchDocuments';
import deleteDocument from '../methods/deleteDocument';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Schedule = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
    if (!isAuthorized) return;

    const loadAppointments = async () => {
      try {
        const data = await fetchDocuments(COLLECTIONS.APPOINTMENTS);

        const sortedAppointments = data
          .map(app => ({
            ...app,
            dateFrom: new Date(app.dateFrom),
            dateTo: new Date(app.dateTo),
          }))
          .sort((a, b) => a.dateFrom - b.dateFrom);

        setAppointments(sortedAppointments);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthorized]);

  const handleEditClick = (id) => {
    navigate(`/appointment/${id}`);
  };

  const handleDeleteClick = async () => {
    if (!selectedAppointment) return;

    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteDocument(COLLECTIONS.APPOINTMENTS, selectedAppointment.id);
        setAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
        setSelectedAppointment(null);
        alert("Appointment deleted successfully.");
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Error deleting appointment. Please try again later.");
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const events = appointments.map(app => ({
    id: app.id,
    title: `${app.client?.firstName || 'NoName'} ${app.client?.lastName || ''} (${app.service?.serviceName || 'Service'})`,
    start: app.dateFrom,
    end: app.dateTo,
    allDay: false,
    resource: {
      status: app.status,
      paid: app.paid,
    }
  }));

  if (isLoading) return <div className="full-page">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="full-page">
      <div className="top-bar d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h2 className="page-title mb-0">Appointments Calendar</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate('/appointments/add')}
            title="Add Appointment"
          >
            <i className="bi bi-plus-lg"></i> Add
          </button>
        </div>

        {!isSidebarOpen && (
          <button className="btn btn-outline-primary" onClick={toggleSidebar}>
            ☰ Menu
          </button>
        )}
      </div>

      <RightSidebar onClose={toggleSidebar} isOpen={isSidebarOpen} />

      <div
        className="calendar-wrapper"
        style={{
          marginRight: isSidebarOpen ? "200px" : "0",
          width: isSidebarOpen ? "calc(100% - 230px)" : "100%",
          transition: "all 0.3s ease-in-out",
          padding: '20px'
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month', 'week', 'day']}
          onSelectEvent={(event) => setSelectedAppointment(appointments.find(a => a.id === event.id))}
          tooltipAccessor={(event) =>
            `${event.title}\nDate: ${format(event.start, 'PPP')}\nTime: ${format(event.start, 'p')}`
          }
          eventPropGetter={(event) => {
            const { status, paid } = event.resource;

            let backgroundColor = '#6c757d'; // default
            if (status === 'new') backgroundColor = '#0d6efd'; // blue
            else if (status === 'closed') backgroundColor = '#6c757d'; // gray

            const border = paid ? '' : '4px dashed #dc3545'; // green or red

            return {
              style: {
                backgroundColor,
                color: 'white',
                border,
                borderRadius: '6px',
                fontWeight: '500',
              },
            };
          }}
        />
      </div>

      <AppointmentModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    </div>
  );
};

export default Schedule;
