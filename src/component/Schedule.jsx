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
import "../css/style.css";

import RightSidebar from './RightSidbar';
import AppointmentModal from './AppointmentModal'; // ✅ Import the new modal
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

export const COLLECTIONS = {
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
};

const Schedule = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Handle login check
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

  // Fetch appointments
  useEffect(() => {
    if (!isAuthorized) return;

    const loadAppointments = async () => {
      try {
        const data = await fetchDocuments(COLLECTIONS.APPOINTMENTS);
        const sortedAppointments = data
          .map(app => ({
            ...app,
            appointmentDateTime: new Date(`${app.date}T${app.time}`),
          }))
          .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime);

        setAppointments(sortedAppointments);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthorized]);

  // Handle appointment actions
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

  // Transform appointments to calendar events
  const events = appointments.map(app => {
    const start = new Date(`${app.date}T${app.time}`);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 mins slot

    return {
      id: app.id,
      title: `${app.FirstName} ${app.LastName} (${app.type})`,
      start,
      end,
      allDay: false,
      resource: app,
    };
  });

  if (isLoading) return <div className="full-page">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="full-page">
      <div className="top-bar">
        <h2 className="page-title">Appointments Calendar</h2>
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
          onSelectEvent={(event) => setSelectedAppointment(event.resource)}
          tooltipAccessor={(event) =>
            `${event.title}\nDate: ${format(event.start, 'PPP')}\nTime: ${format(event.start, 'p')}`
          }
        />
      </div>

      {/* Appointment Modal */}
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
