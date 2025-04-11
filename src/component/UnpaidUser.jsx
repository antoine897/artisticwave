import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const UnpaidUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const res = await axios.get("http://localhost:8800/users");
        const unpaid = res.data.filter((user) => user.Status !== "Paid");
        setUsers(unpaid);
      } catch (err) {
        console.log(err);
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

  return (
      <div className="container my-5">
        <h2>Unpaid Users</h2>
    
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
    
        <Link to="/Users" className="btn btn-secondary mt-3">
          Back to Student page
        </Link>
      </div>
    );
    
};

export default UnpaidUsers;
