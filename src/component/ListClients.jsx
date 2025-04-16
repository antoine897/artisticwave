import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { COLLECTIONS } from '../constants/collectionConst';
import "../css/style.css";
import 'react-time-picker/dist/TimePicker.css';

import fetchDocuments from '../methods/fetchDocuments';
import deleteDocument from '../methods/deleteDocument';


const ListClients = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [clients, setClients] = useState([]);

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

    const loadClients = async () => {
      try {
        const clientsData = await fetchDocuments(COLLECTIONS.CLIENTS);
        setClients(clientsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading clients: ", error);
        setIsLoading(false);
      }
    };

    loadClients();
  }, [isAuthorized]);

  const handleEditClick = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  const handleDeleteClick = async (clientId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this client?');

    if (confirmDelete) {
      try {
        await deleteDocument(COLLECTIONS.CLIENTS, clientId);
        setClients(clients.filter(client => client.id !== clientId));
        alert('Client deleted successfully.');
      } catch (error) {
        console.error("Error deleting client: ", error);
        alert('Error deleting client. Please try again later or call Antonato.');
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">All Students</h2>
        <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Phone Number</th>
              {/* <th>Client Type</th> */}
              <th>Relative Name</th>
              <th>Relative Phone</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={index}>
                <td>{client.firstName}</td>
                <td>{client.lastName}</td>
                <td>{client.phoneNumber}</td>
                {/* <td>{client.clientType}</td> */}
                <td>{client.relativeName || "-"}</td>
                <td>{client.relativePhoneNumber || "-"}</td>
                <td>{new Date(client.createdDate).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEditClick(client.id)}
                  >
                    <i className="bi bi-pencil"></i> 
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2"  
                    onClick={() => handleDeleteClick(client.id)}  
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="../clients/add" className="btn btn-primary mt-3">Add New Student</Link>      
    </div>
  );
};

export default ListClients;
