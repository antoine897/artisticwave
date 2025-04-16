import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { COLLECTIONS } from '../constants/collectionConst';
import "../css/style.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

import fetchDocuments from '../methods/fetchDocuments';
import deleteDocument from '../methods/deleteDocument';

const ListServices = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [services, setServices] = useState([]);

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
    if (!isAuthorized) return;

    const loadServices = async () => {
      try {
        const servicesData = await fetchDocuments(COLLECTIONS.SERVICES);
        setServices(servicesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading services: ", error);
        setIsLoading(false);
      }
    };

    loadServices();
  }, [isAuthorized]);

  const handleEditClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  const handleDeleteClick = async (serviceId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');

    if (confirmDelete) {
      try {
        await deleteDocument(COLLECTIONS.SERVICES, serviceId);
        setServices(services.filter(service => service.id !== serviceId));
        alert('Service deleted successfully.');
      } catch (error) {
        console.error("Error deleting service: ", error);
        alert('Error deleting service. Please try again later or call Antonato.');
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">All Services</h2>
        <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Duration (min)</th>
              <th>Session Price ($)</th>
              <th>Max Students</th>
              <th>Available Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index}>
                <td>{service.serviceName}</td>
                <td>{service.serviceDescription}</td>
                <td>{service.durationMinutes}</td>
                <td>{service.sessionPrice}</td>
                <td>{service.studentNumber}</td>
                <td>{(service.availableDays || []).map((day, i) => (
                    <span key={i} className="badge bg-secondary me-1">{day.slice(0, 3)}</span>
                  ))}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEditClick(service.id)} 
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2"  
                    onClick={() => handleDeleteClick(service.id)}  
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link to="../services/add" className="btn btn-primary mt-3">Add New Service</Link>
    </div>
  );
};

export default ListServices;
