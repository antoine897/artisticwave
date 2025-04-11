import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/style.css";
import TimePicker from 'react-time-picker';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'react-time-picker/dist/TimePicker.css';

import createDocument from '../methods/createDocument';

const AddClient = () => {
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

  const [error, setError] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [relativePhoneNumber, setRelativePhoneNumber] = useState('');
  const [clientType, setClientType] = useState('');

  const validatePhone = (phone) => {
    if (!phone) return true;
    const pattern = /^(03|06|70|71|76|78|80|81)\d{6}$/;
    return pattern.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(phoneNumber) || !validatePhone(relativePhoneNumber)) {
      alert("Phone number must be 8 digits and start with a valid prefix (03, 06, 70, etc.)");
      return;
    }

    const newClient = {
      firstName,
      lastName,
      phoneNumber,
      clientType,
      relativeName,
      relativePhoneNumber
    };

    try {
      await createDocument(newClient, 'clients');
      alert('Client Created Successfully');
      navigate(-1);
    } catch (e) {
      console.error('Error adding client: ', e);
      setError(true);
    }
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <h2 className="mb-3 mt-5">Add New Student</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="FirstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter first name"
              name="FirstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="LastName" className="form-label">Last Name</label>
            <input
              className="form-control"
              placeholder="Enter last name"
              name="LastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="PhoneNumber" className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter phone number"
              name="PhoneNumber"
              value={phoneNumber}
              pattern="(03|06|70|71|76|78|80|81)[0-9]{6}"
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                e.target.setCustomValidity(""); // clear previous messages
              }}
              onInvalid={(e) => {
                if (!e.target.validity.valid) {
                  e.target.setCustomValidity("Phone must start with a valid prefix 03/06/70... and be exactly 8 digits.");
                }
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Family" className="form-label">A relative name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a relative Name"
              name="RelativeName"
              value={relativeName}
              onChange={(e) => setRelativeName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="RelativePhoneNumber" className="form-label">Relative Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter the relative phone number"
              name="RelativePhoneNumber"
              pattern="(03|06|70|71|76|78|80|81)[0-9]{6}"
              value={relativePhoneNumber}
              onChange={(e) => {
                setRelativePhoneNumber(e.target.value);
                e.target.setCustomValidity(""); // clear previous messages
              }}
              onInvalid={(e) => {
                if (!e.target.validity.valid) {
                  e.target.setCustomValidity("Phone must start with a valid prefix 03/06/70... and be exactly 8 digits.");
                }
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Type" className="form-label">Client Type</label>
            <select
              className="form-select"
              name="Type"
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select client type</option>
              <option value="Private">Private</option>
              <option value="Class">Class</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Add</button>
        </form>

        {error && <p className="text-danger mt-3">Something went wrong!</p>}
        <Link to="../Users" className="btn btn-link mt-3">See all Students</Link>
      </div>
    </div>
  );
};

export default AddClient;
