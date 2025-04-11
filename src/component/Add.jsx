import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/style.css";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const Add = () => {
  const [users, setUsers] = useState({
    FirstName: "",
    LastName: "",
    PhoneNumber: "",
    Date: "",
    Time: "",
    Type: "",
    Status: "Unpaid",
    Amount: "",
  });

  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setUsers((prev) => ({
        ...prev,
        Status: e.target.checked ? "Paid" : "Unpaid",
        Amount: e.target.checked ? prev.Amount : "",
      }));
    } else {
      setUsers((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const validatePhone = (phone) => {
    const pattern = /^(03|06|70|71|76|78|80|81)\d{6}$/;
    return pattern.test(phone);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validatePhone(users.PhoneNumber)) {
      alert("Phone number must be 8 digits and start with a valid prefix (03, 06, 70, etc.)");
      return;
    }

    if (!users.Type) {
      alert("Please select a type.");
      return;
    }

    try {
      await axios.post("http://localhost:8800/users", users);
      navigate("../Users");
    } catch (err) {
      console.log(err);
      setError(true);
    }
  };

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <h2 className="mb-3 mt-5">Add New Student</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="FirstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter first name"
              name="FirstName"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="LastName" className="form-label">Last Name</label>
            <input
              className="form-control"
              placeholder="Enter last name"
              name="LastName"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="PhoneNumber" className="form-label">Phone Number</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter phone number"
              name="PhoneNumber"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Date" className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              name="Date"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Time" className="form-label">Time</label>
            <input
              type="time"
              className="form-control"
              name="Time"
              value={users.Time}
              onChange={handleChange}
              min="00:00"
              max="23:59"
              step="60"
              lang="en-GB"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Type" className="form-label">Type</label>
            <select
              className="form-select"
              name="Type"
              value={users.Type}
              onChange={handleChange}
            >
              <option value="">Select a Type</option>
              <option value="Private">Private</option>
              <option value="Class">Class</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Paid status:</label>
            <input
              type="checkbox"
              className="form-check-input ms-2"
              name="Status"
              checked={users.Status === "Paid"}
              onChange={handleChange}
            />
          </div>

          {users.Status === "Paid" && (
            <div className="mb-3">
              <label htmlFor="Amount" className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                name="Amount"
                value={users.Amount}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" onClick={handleClick}>Add</button>
        </form>

        {error && <p className="text-danger mt-3">Something went wrong!</p>}
        <Link to="../Users" className="btn btn-link mt-3">See all Students</Link>
      </div>
    </div>
  );
};

export default Add;
