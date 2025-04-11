import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { COLLECTIONS } from '../constants/collectionConst'
import "../css/style.css";
import 'react-time-picker/dist/TimePicker.css';

import createDocument from '../methods/createDocument';
import updateDocumentWithId from '../methods/updateDocumentWithId';
import fetchDocumentWithId from '../methods/fetchDocumentWithId';

const ServiceForm = () => {
  const { id } = useParams();  // Get the client id from URL
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [serviceName, setServiceName] = useState('');
  const [serviceUnit, setServiceUnit] = useState('');
  const [serviceUnitPrice, setServiceUnitPrice] = useState('');


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
    const fetchService = async () => {
      if (!id) return;

      try {
        const serviceData = await fetchDocumentWithId(COLLECTIONS.SERVICES, id);
        if (serviceData) {
          setIsEditMode(true);
          setServiceName(serviceData.serviceName || '');
          setServiceUnit(serviceData.serviceUnit || '');
          setServiceUnitPrice(serviceData.serviceUnitPrice || '');
        }
      } catch (error) {
        console.error("Error fetching service: ", error);
      }
    };

    fetchService();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serviceData = {
      serviceName,
      serviceUnit,
      serviceUnitPrice,
      createdDate: new Date().toISOString()
    };

    try {
      if (isEditMode && id) {
        await updateDocumentWithId(COLLECTIONS.SERVICES, serviceData, id);
        alert('Service Updated Successfully');
      } else {
        await createDocument(serviceData, COLLECTIONS.SERVICES);
        alert('Service Created Successfully');
      }
      navigate('/services');
    } catch (e) {
      alert('Error saving service. Please try again later or call Antonato.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-3 mt-5">{isEditMode ? 'Update Service' : 'Add New Service'}</h2>
          <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/services')}>← Back</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="mb-3">
            <label htmlFor="ServiceName" className="form-label">Service Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter service name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="ServiceUnit" className="form-label">Service Unit in hour (each unit/session is x hour)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter service unit"
              value={serviceUnit}
              onChange={(e) => setServiceUnit(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="ServiceUnitPrice" className="form-label">Service Unit Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter service unit price"
              value={serviceUnitPrice}
              onChange={(e) => setServiceUnitPrice(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Service' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
