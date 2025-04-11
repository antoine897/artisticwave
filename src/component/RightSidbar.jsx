import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const RightSidebar = ({ onClose }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFinancialMenuOpen, setIsFinancialMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Example: Load user from localStorage or API
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

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

      {/* User Section */}
      <div className="p-3">
        <div
          className="fw-bold text-start"
          style={{ cursor: "pointer" }}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          User
        </div>
        <div className={`collapse ${isUserMenuOpen ? "show" : ""}`}>
          <ul className="list-unstyled text-start ps-3 mt-2">
            <li>
              <Link to="/Add" className="text-decoration-none">Add new user</Link>
            </li>
            <li>
              <Link to="/UnpaidUsers" className="text-decoration-none">Unpaid user</Link>
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
    </div>
  );
};

export default RightSidebar;
