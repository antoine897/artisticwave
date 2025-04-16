import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { COLLECTIONS } from '../constants/collectionConst';
import "../css/style.css";
import createDocument from '../methods/createDocument';
import updateDocumentWithId from '../methods/updateDocumentWithId';
import fetchDocumentWithId from '../methods/fetchDocumentWithId';

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [sessionPrice, setSessionPrice] = useState('');
  const [studentNumber, setStudentNumber] = useState(1);
  const [availableDays, setAvailableDays] = useState([]);

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
          setServiceDescription(serviceData.serviceDescription || '');
          setDurationMinutes(serviceData.durationMinutes || 50);
          setSessionPrice(serviceData.sessionPrice || '');
          setStudentNumber(serviceData.studentNumber || 1)
          setAvailableDays(serviceData.availableDays || []);
        }
      } catch (error) {
        console.error("Error fetching service: ", error);
      }
    };

    fetchService();
  }, [id]);

  const handleDayToggle = (day) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  if (availableDays.length === 0) {
    alert("Please select at least one available day.");
    return;
  }

  const serviceData = {
    serviceName,
    serviceDescription,
    durationMinutes: Number(durationMinutes),
    sessionPrice: Number(sessionPrice),
    studentNumber: Number(studentNumber),
    availableDays,
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
          <div className="mb-3">
            <label className="form-label">Service Name</label>
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
            <label className="form-label">Service Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter service description"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Duration (in minutes)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter duration in minutes"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price per Session</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter session price"
              value={sessionPrice}
              onChange={(e) => setSessionPrice(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Maximum Student number per Session</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Max Student Number"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Available Days</label>
            <div className="d-flex flex-wrap gap-2">
              {weekdays.map(day => (
                <div key={day} className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`day-${day}`}
                    checked={availableDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  <label className="form-check-label" htmlFor={`day-${day}`}>
                    {day}
                  </label>
                </div>
              ))}
            </div>
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
