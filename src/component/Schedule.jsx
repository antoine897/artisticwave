import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import "../css/style.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import RightSidebar from './RightSidbar';
import fetchDocuments from '../methods/fetchDocuments';
import deleteDocument from '../methods/deleteDocument';

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
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [appointmentsPerPage] = useState(5); // Number of appointments per page

  // Handle user login
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

  // Load appointments
  useEffect(() => {
    if (!isAuthorized) return;

    const loadAppointments = async () => {
      try {
        const data = await fetchDocuments(COLLECTIONS.APPOINTMENTS);

        // Ensure that each appointment has valid date and time
        const sortedAppointments = data
          .map(app => ({
            ...app,
            appointmentDateTime: new Date(`${app.date}T${app.time}`), // Create a Date object from date and time
          }))
          .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime); // Sort by date and time

        setAppointments(sortedAppointments);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthorized]);

  // Edit & Delete
  const handleEditClick = (id) => {
    navigate(`/appointment/${id}`);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteDocument(COLLECTIONS.APPOINTMENTS, id);
        setAppointments(appointments.filter(app => app.id !== id));
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

  const indexOfLastAppointment = currentPage * appointmentsPerPage; // Get the last appointment index
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage; // Get the first appointment index
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment); // Slice the appointments for current page

  const handleNextPage = () => {
    if (currentPage * appointmentsPerPage < appointments.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) return <div className="full-page">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="full-page">
      <div className="top-bar">
        <h2 className="page-title">All Appointments</h2>
        {!isSidebarOpen && (
          <button className="btn btn-outline-primary" onClick={toggleSidebar}>
            ☰ Menu
          </button>
        )}
      </div>

      <RightSidebar onClose={toggleSidebar} isOpen={isSidebarOpen} />

      <div
        className="table-wrapper"
        style={{
          marginRight: isSidebarOpen ? "200px" : "0",
          width: isSidebarOpen ? "calc(100% - 230px)" : "100%",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Phone Number</th>
              <th>Relative First Name</th>
              <th>Relative Phone Number</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map((app, index) => (
              <tr key={index}>
                <td>{app.FirstName}</td>
                <td>{app.LastName}</td>
                <td>{app.PhoneNumber}</td>
                <td>{app.relativeName}</td>
                <td>{app.relativePhoneNumber}</td>
                <td>{app.date}</td>
                <td>{app.time}</td>
                <td>{app.type}</td>
                <td className={app.status === "paid" ? "text-success" : "text-danger"}>
                  {app.status}
                </td>
                <td>${app.amount}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEditClick(app.id)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(app.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-container">
  <button
    onClick={handlePrevPage}
    disabled={currentPage === 1}
    className="btn btn-secondary"
  >
    Prev
  </button>
  
  <span className="page-number">{`Page ${currentPage}`}</span>

  <button
    onClick={handleNextPage}
    disabled={currentPage * appointmentsPerPage >= appointments.length}
    className="btn btn-secondary"
  >
    Next
  </button>
</div>


      </div>
    </div>
  );
};

export default Schedule;
