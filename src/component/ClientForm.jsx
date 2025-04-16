import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { COLLECTIONS } from '../constants/collectionConst'
import "../css/style.css";
import 'react-time-picker/dist/TimePicker.css';

import createDocument from '../methods/createDocument';
import updateDocumentWithId from '../methods/updateDocumentWithId';
import fetchDocumentWithId from '../methods/fetchDocumentWithId';

const ClientForm = () => {
  const { id } = useParams();  // Get the client id from URL
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [relativePhoneNumber, setRelativePhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [relativePhoneNumberError, setRelativePhoneNumberError] = useState('');

  // Regex pattern for validating the phone number
  const phoneNumberPattern = /^(06|03|78|70|71|80|81)\d{6}$/;

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

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;

      try {
        const clientData = await fetchDocumentWithId(COLLECTIONS.CLIENTS, id);
        if (clientData) {
          setIsEditMode(true);
          setFirstName(clientData.firstName || '');
          setLastName(clientData.lastName || '');
          setPhoneNumber(clientData.phoneNumber || '');
          setRelativeName(clientData.relativeName || '');
          setRelativePhoneNumber(clientData.relativePhoneNumber || '');
        }
      } catch (error) {
        console.error("Error fetching client: ", error);
      }
    };

    fetchClient();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone numbers
    if (!phoneNumberPattern.test(phoneNumber)) {
      setPhoneNumberError('Phone number must be 8 digits and start with 06, 03, 78, 70, 71, 80, or 81.');
      return;
    }

    if (relativePhoneNumber && !phoneNumberPattern.test(relativePhoneNumber)) {
      setRelativePhoneNumberError('Relative phone number must be 8 digits and start with 06, 03, 78, 70, 71, 80, or 81.');
      return;
    }

    // Clear any previous errors
    setPhoneNumberError('');
    setRelativePhoneNumberError('');

    const clientData = {
      firstName,
      lastName,
      phoneNumber,
      relativeName,
      relativePhoneNumber,
      createdDate: new Date().toISOString(),
    };

    try {
      if (isEditMode && id) {
        await updateDocumentWithId(COLLECTIONS.CLIENTS, clientData, id);
        alert('Client Updated Successfully');
      } else {
        await createDocument(clientData, COLLECTIONS.CLIENTS);
        alert('Client Created Successfully');
      }
      navigate('/clients');
    } catch (e) {
      alert('Error saving client. Please try again later or call Antonato');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-3 mt-5">{isEditMode ? 'Update Client' : 'Add New Client'}</h2>
          <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/clients')}>← Back</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="mb-3">
            <label htmlFor="FirstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter first name"
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
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {phoneNumberError && <div className="text-danger">{phoneNumberError}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="Family" className="form-label">Relative Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter relative name"
              value={relativeName}
              onChange={(e) => setRelativeName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="RelativePhoneNumber" className="form-label">Relative Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter relative phone number"
              value={relativePhoneNumber}
              onChange={(e) => setRelativePhoneNumber(e.target.value)}
            />
            {relativePhoneNumberError && <div className="text-danger">{relativePhoneNumberError}</div>}
          </div>

          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Client' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
