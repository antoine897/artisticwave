import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SignOut } from '../methods/SignOut';
import { useNavigate } from 'react-router-dom';



const RightSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const [isClientsMenuOpen, setIsClientsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);

  const [isFinancialMenuOpen, setIsFinancialMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Example: Load user from localStorage or API
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

    // Handle sign-out
    const handleSignOut = () => {
      SignOut()
        .then(() => {
          navigate('/');
        })
        .catch((error) => {
          throw Error('Sign out failed:', error.message);
        });
    };

  return (
    <div
      className="bg-light border-start shadow mt-5"
      style={{
        width: "250px",
        minHeight: "100vh",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div className="position-relative p-3 border-bottom text-center">
        <h5 className="mb-0 text-primary">Menu</h5>
        <button
          className="btn-close position-absolute end-0 top-50 translate-middle-y me-3"
          onClick={onClose}
        ></button>
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
              <Link to="/clients" className="text-decoration-none">All clients</Link>
            </li>
            <li>
              <Link to="/UnpaidUsers" className="text-decoration-none">Unpaid user</Link>
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
              <Link to="/services" className="text-decoration-none">All Services</Link>
            </li>
          </ul>
        </div>
      </div>






      {/* Financial Section */}
      <div className="p-3 mt-0">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => setIsFinancialMenuOpen(!isFinancialMenuOpen)}
        >
          Financial
        </div>
        <div className={`collapse ${isFinancialMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
         
              <li>
                <Link to={`/ViewReports`} className="text-decoration-none">
                  View reports
                </Link>
              </li>
            
          </ul>
        </div>
      </div>

      {/* Financial Section */}
      <div className="p-3 mt-0">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => handleSignOut()}
        >
          SignOut
        </div>
        <div className={`collapse ${isFinancialMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
         
              <li>
                <Link to={`/ViewReports`} className="text-decoration-none">
                  View reports
                </Link>
              </li>
            
          </ul>
        </div>
      </div>

    </div>
  );
};

export default RightSidebar;
