import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignOut } from '../methods/SignOut';

const RightSidebar = ({ onClose, isOpen }) => {
  const navigate = useNavigate();
  const [isClientsMenuOpen, setIsClientsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isAppointmentsMenuOpen, setIsAppointmentsMenuOpen] = useState(false);
  const [isFinancialMenuOpen, setIsFinancialMenuOpen] = useState(false); // ✅ Financial menu state

  const handleSignOut = () => {
    SignOut()
      .then(() => navigate('/'))
      .catch((error) => console.error('Sign out failed:', error.message));
  };

  return (
    <div className={`right-sidebar ${isOpen ? "open" : ""}`}>
      <div className="position-relative p-3 border-bottom text-center">
        <h5 className="mb-0 text-primary menu-hover" onClick={onClose}>Menu</h5>
      </div>

      {/* Clients */}
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
            <li><Link to="/clients" onClick={onClose}>All Clients</Link></li>
            <li><Link to="/clients/add" onClick={onClose}>Add New Client</Link></li>
            <li><Link to="/UnpaidClients" onClick={onClose}>Unpaid Clients</Link></li>
          </ul>
        </div>
      </div>

      {/* Services */}
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
            <li><Link to="/services" onClick={onClose}>All Services</Link></li>
            <li><Link to="/services/add" onClick={onClose}>Add Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Appointments */}
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
            <li><Link to="/appointments/add" onClick={onClose}>Add Appointment</Link></li>
          </ul>
        </div>
      </div>

      {/* ✅ Financial */}
      <div className="p-3">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => setIsFinancialMenuOpen(!isFinancialMenuOpen)}
        >
          Financial
        </div>
        <div className={`collapse ${isFinancialMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li><Link to="/ViewReports" onClick={onClose}>View Report</Link></li>
          </ul>
        </div>
      </div>

      {/* Sign Out */}
      <div className="p-3">
  <div
    className="fw-bold text-start"
    style={{ cursor: "pointer" }}
    onClick={() => {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        handleSignOut();
      }
    }}
  >
    Sign Out
  </div>
</div>

    </div>
  );
};

export default RightSidebar;
