import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UnpaidClients = () => {

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

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const res = await axios.get("http://localhost:8800/users");
        const unpaid = res.data.filter((user) => user.Status !== "Paid");
        setUsers(unpaid);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllUser();
  }, []);

  const handleDelete = (iduser) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (isConfirmed) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.iduser !== iduser));
      // Optionally send delete request to backend:
      axios.delete(`http://localhost:8800/users/${iduser}`).catch((err) => console.log(err));
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
    <div className="container py-5">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="mb-0">All Clients</h2>
      <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
    </div>
        {users.length === 0 ? (
          <div className="alert alert-info mt-4">
            There is no unpaid student.
          </div>
        ) : (
          <table className="table table-striped mt-4">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone Number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.iduser}>
                  <td>{user.FirstName}</td>
                  <td>{user.LastName}</td>
                  <td>{user.PhoneNumber}</td>
                  <td>{user.Date}</td>
                  <td>{user.Time}</td>
                  <td>{user.Status}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.iduser)}
                    >
                      Delete
                    </button>
                    <button className="btn btn-warning btn-sm ms-2">
                      <Link
                        to={`/UpdateUserForm/${user.iduser}`}
                        className="text-white text-decoration-none"
                      >
                        Update
                      </Link>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
        
    
    );
    
};

export default UnpaidClients;
