import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../css/style.css";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UpdateUserForm = () => {
    /* ********************************************************************** */
    // Verify that the user was authorized
    const navigate = useNavigate();
    const auth = getAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
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
    /* ********************************************************************** */

  const { userId } = useParams(); // Get userId from the URL
  const [user, setUser] = useState({
    FirstName: "",
    LastName: "",
    PhoneNumber: "",
    Date: "",
    Time: "",
    Status: "Unpaid", // Default to "Unpaid"
    Amount: "", // Default value for Amount
    Type: "", // Add Type field here
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user data from the server
  useEffect(() => {
    if (!userId) {
      console.error('User ID is undefined');
      return; // Prevent the request if userId is undefined
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/users/${userId}`);
        setUser(response.data); // Set fetched data to the state
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // If the checkbox is clicked, set Status to "Paid" or "Unpaid"
      setUser((prevState) => ({
        ...prevState,
        Status: checked ? "Paid" : "Unpaid", // "Paid" if checked, "Unpaid" if unchecked
        Amount: checked ? prevState.Amount : "", // Clear the Amount if unchecked (if Status changes to Unpaid)
      }));
    } else {
      setUser((prevState) => ({
        ...prevState,
        [name]: value // Update the state for other fields
      }));
    }
  };

  const validatePhone = (phone) => {
    const pattern = /^(03|06|70|71|76|78|80|81)\d{6}$/;
    return pattern.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!validatePhone(user.PhoneNumber)) {
      alert('Invalid phone number. Must be 8 digits and start with 03, 06, 70, etc.');
      return;
    }

    // Basic validation
    if (!user.FirstName || !user.LastName || !user.PhoneNumber || !user.Date || !user.Time || !user.Status || !user.Type) {
      setErrorMessage('Please fill all the fields');
      return;
    } else {
      setErrorMessage('');
    }

    // Check if Status is "Paid" and Amount is missing
    if (user.Status === "Paid" && (!user.Amount || user.Amount === "")) {
      alert('Amount is required when the status is Paid');
      return;
    }

    // If Status is Unpaid and Amount is not needed, set Amount to null
    const updatedUser = { ...user };
    if (user.Status === "Unpaid") {
      updatedUser.Amount = null; // Set Amount to null for unpaid users
    }

    try {
      // Send PUT request to update user data on the server
      await axios.put(`http://localhost:8800/users/${userId}`, updatedUser);

      // Redirect to the user's details page (or another page after success)
      navigate(`/Users/`);
    } catch (error) {
      console.error('Error updating user data:', error);
      setErrorMessage('Error updating user data. Please try again.');
    }
  };

    // This is to display a cicular loading while fetching data and authorisation
  /* ********************************************************************** */
  if (isLoading) {
    return (
      <div>
        Loading
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }
  /* ********************************************************************** */

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="w-50 mx-auto">
        <h1 className="text-center mb-4">Update User</h1>
        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-3">
            <label htmlFor="FirstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control form-control-sm w-100"
              placeholder="First Name"
              name="FirstName"
              value={user.FirstName}
              onChange={handleChange}
            />
          </div>

          {/* Last Name */}
          <div className="mb-3">
            <label htmlFor="LastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control form-control-sm w-100"
              placeholder="Last Name"
              name="LastName"
              value={user.LastName}
              onChange={handleChange}
            />
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label htmlFor="PhoneNumber" className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control form-control-sm w-100"
              placeholder="Phone Number"
              name="PhoneNumber"
              value={user.PhoneNumber}
              onChange={handleChange}
            />
          </div>

          {/* Date */}
          <div className="mb-3">
            <label htmlFor="Date" className="form-label">Date</label>
            <input
              type="date"
              className="form-control form-control-sm w-100"
              name="Date"
              value={user.Date}
              onChange={handleChange}
            />
          </div>

          {/* Time */}
          <div className="mb-3">
            <label htmlFor="Time" className="form-label">Time</label>
            <input
              type="time"
              className="form-control form-control-sm w-100"
              name="Time"
              value={user.Time}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className="mb-3">
            <label htmlFor="Type" className="form-label">Type</label>
            <select
              className="form-select"
              name="Type"
              value={user.Type}
              onChange={handleChange}
            >
              <option value="">Select a Type</option>
              <option value="Private">Private</option>
              <option value="Class">Class</option>
            </select>
          </div>

          {/* Status Checkbox */}
          <div className="mb-3">
            <label>Paid status:</label>
            <input
              type="checkbox"
              className="form-check-input ms-2"
              name="Status"
              checked={user.Status === "Paid"}
              onChange={handleChange}
            />
          </div>

          {/* Conditionally render the Amount field if the status is "Paid" */}
          {user.Status === "Paid" && (
            <div className="mb-3">
              <label htmlFor="Amount" className="form-label">Amount</label>
              <input
                type="number"
                className="form-control form-control-sm w-100"
                placeholder="Amount"
                name="Amount"
                value={user.Amount}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">Update User</button>
        </form>

        {/* Display the error message if it exists */}
        {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default UpdateUserForm;
