import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SignOut } from '../methods/SignOut';
import { useNavigate } from 'react-router-dom';

const RightSidebar = ({ onClose, isOpen }) => {
  const navigate = useNavigate();
  const [isClientsMenuOpen, setIsClientsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isAppointmentsMenuOpen, setIsAppointmentsMenuOpen] = useState(false);

  const handleSignOut = () => {
    SignOut()
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Sign out failed:', error.message);
      });
  };

  return (
    <div className={`right-sidebar ${isOpen ? "open" : ""}`}>
      <div className="position-relative p-3 border-bottom text-center">
        <h5 className="mb-0 text-primary menu-hover" onClick={onClose}>Menu</h5>
      </div>

      <div className="p-3">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => setIsClientsMenuOpen(!isClientsMenuOpen)}
        >
          Clients
        </div>
        <div className={`collapse ${isClientsMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li>
              <Link to="/clients" className="text-decoration-none" onClick={onClose}>All clients</Link>
            </li>
            <li>
              <Link to="/clients/add" className="text-decoration-none" onClick={onClose}>Add New Client</Link>
            </li>
            <li>
              <Link to="/UnpaidClients" className="text-decoration-none" onClick={onClose}>Unpaid Clients</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => setIsServicesMenuOpen(!isServicesMenuOpen)}
        >
          Services
        </div>
        <div className={`collapse ${isServicesMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li>
              <Link to="/services" className="text-decoration-none" onClick={onClose}>All Services</Link>
            </li>
            <li>
              <Link to="/services/Add" className="text-decoration-none" onClick={onClose}>Add Service</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => setIsAppointmentsMenuOpen(!isAppointmentsMenuOpen)}
        >
          Appointments
        </div>
        <div className={`collapse ${isAppointmentsMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li>
              <Link to="/appointments/Add" className="text-decoration-none" onClick={onClose}>Add Appointment</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={handleSignOut}
        >
          Sign Out
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
