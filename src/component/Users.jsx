import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RightSidebar from "../component/RightSidbar"; // Import sidebar component
import "../css/style.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle

  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const res = await axios.get("http://localhost:8800/users");
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllUser();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (iduser, fullName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${fullName}?`);
    if (isConfirmed) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.iduser !== iduser));
      axios.delete(`http://localhost:8800/users/${iduser}`).catch((err) => console.log(err));
    }
  };

  // Function to check if the date/time has passed
  const hasDateTimePassed = (userDate, userTime) => {
    const currentDateTime = new Date(); // Get current date and time
    const userDateTime = new Date(`${userDate}T${userTime}`); // Construct the date and time from the user data
    console.log(`Comparing: ${userDateTime} with ${currentDateTime}`); // Log the comparison
    return userDateTime < currentDateTime; // Returns true if userDateTime has passed
  };

  const filteredUsers = [...users]
    .sort((a, b) => new Date(`${a.Date}T${a.Time}`) - new Date(`${b.Date}T${b.Time}`))
    .filter((user) =>
      user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.LastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          transition: "margin-right 0.3s ease",
          padding: "20px",
          marginRight: isSidebarOpen ? "250px" : "0",
        }}
      >
        <div className="d-flex justify-content-between align-items-center my-3 flex-wrap gap-3">
          <h1 className="mb-0">All Students</h1>

          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px" }}
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <button
            className="btn btn-outline-primary"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            {isSidebarOpen ? "Menu" : "☰ Menu"}
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone Number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {currentUsers.map((user) => {
  const isDateTimePassed = hasDateTimePassed(user.Date, user.Time);
  console.log(`User: ${user.FirstName} ${user.LastName}, Status: ${user.Status}, Is Date/Time Passed: ${isDateTimePassed}`);
  return (
    <tr
  key={user.iduser}
  style={{
    textDecoration: user.Status === "Paid" && isDateTimePassed ? "line-through" : "none",
    color: user.Status === "Unpaid" && isDateTimePassed ? "red !important" : "inherit",
  }}
>
      <td>{user.FirstName}</td>
      <td>{user.LastName}</td>
      <td>{user.PhoneNumber}</td>
      <td>{user.Date}</td>
      <td>{user.Time}</td>
      <td>{user.Type}</td>
      <td>{user.Status === "Paid" ? "Paid" : "Unpaid"}</td>
      <td>{user.Status === "Paid" ? user.Amount : "-"}</td>
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(user.iduser, `${user.FirstName} ${user.LastName}`)}
        >
          Delete
        </button>
        <Link
          to={`/UpdateUserForm/${user.iduser}`}
          className="btn btn-warning btn-sm ms-2 text-white"
        >
          Update
        </Link>
      </td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <button className="btn btn-secondary" onClick={goToPreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button className="btn btn-secondary" onClick={goToNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>

        {/* <div className="mt-3 d-flex justify-content-center gap-3">
          <Link to="/Add" className="btn btn-primary text-white text-decoration-none">
            Add new user
          </Link>
          <Link to="/UnpaidUsers" className="btn btn-primary text-white text-decoration-none">
            Unpaid Users
          </Link> 
        </div> */}
      </div>

      {/* Right Sidebar */}
      {isSidebarOpen && <RightSidebar onClose={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Users;
