import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignOut } from '../methods/SignOut';

const RightSidebar = ({ onClose, isOpen }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const sidebarRef = useRef(null);

  const handleSignOut = () => {
    SignOut()
      .then(() => navigate('/'))
      .catch((error) => console.error('Sign out failed:', error.message));
  };

  const toggleMenu = (menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  // ✅ Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={sidebarRef} className={`right-sidebar ${isOpen ? "open" : ""}`}>
      <div className="position-relative p-3 border-bottom text-center">
        <h5 className="mb-0 text-primary menu-hover" onClick={onClose}>Menu</h5>
      </div>

      {/* Clients */}
      <div className="p-3">
        <div className="fw-bold text-start" style={{ cursor: "pointer" }} onClick={() => toggleMenu("clients")}>
          Clients
        </div>
        <div className={`collapse ${openMenu === "clients" ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li><Link to="/clients" onClick={onClose}>All Clients</Link></li>
            <li><Link to="/clients/add" onClick={onClose}>Add New Client</Link></li>
            <li><Link to="/unpaidclients" onClick={onClose}>Unpaid Clients</Link></li>
          </ul>
        </div>
      </div>

      {/* Services */}
      <div className="p-3">
        <div className="fw-bold text-start" style={{ cursor: "pointer" }} onClick={() => toggleMenu("services")}>
          Services
        </div>
        <div className={`collapse ${openMenu === "services" ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li><Link to="/services" onClick={onClose}>All Services</Link></li>
            <li><Link to="/services/add" onClick={onClose}>Add Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Appointments */}
      <div className="p-3">
        <div className="fw-bold text-start" style={{ cursor: "pointer" }} onClick={() => toggleMenu("appointments")}>
          Appointments
        </div>
        <div className={`collapse ${openMenu === "appointments" ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li><Link to="/appointments/add" onClick={onClose}>Add Appointment</Link></li>
          </ul>
        </div>
      </div>

      {/* Financial */}
      <div className="p-3">
        <div className="fw-bold text-start" style={{ cursor: "pointer" }} onClick={() => toggleMenu("financial")}>
          Financial
        </div>
        <div className={`collapse ${openMenu === "financial" ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li><Link to="/viewreports" onClick={onClose}>View Report</Link></li>
            <li><Link to="/financials" onClick={onClose}>Add Depence/Income</Link></li>
          </ul>
        </div>
      </div>

      {/* Account */}
      <div className="p-3">
        <div className="fw-bold text-start" style={{ cursor: "pointer" }} onClick={() => toggleMenu("account")}>
          Account
        </div>
        <div className={`collapse ${openMenu === "account" ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li><Link to="/change-password" onClick={onClose}>Change Password</Link></li>
            <li>
              <Link
              className="fw-bold text-start"
              style={{ cursor: "pointer" }}
              onClick={() => {
                const confirmLogout = window.confirm("Are you sure you want to log out?");
                if (confirmLogout) handleSignOut();
              }}
            >
              Sign Out
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
