import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ViewReports = () => {
  const [users, setUsers] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [privateAmounts, setPrivateAmounts] = useState(0);
  const [classAmounts, setClassAmounts] = useState({});
  const [monthlyAmounts, setMonthlyAmounts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredAmount, setFilteredAmount] = useState({ private: 0, class: 0 });
  const [unpaidMessage, setUnpaidMessage] = useState("");
  const [years, setYears] = useState([]);
  const [showTotalAmount, setShowTotalAmount] = useState(false);
  const [showUnpaidMessage, setShowUnpaidMessage] = useState(false);

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

  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const res = await axios.get("http://localhost:8800/users");
        setUsers(res.data);

        // Extract distinct years from users data
        const uniqueYears = [
          ...new Set(res.data.map((user) => new Date(user.Date).getFullYear())),
        ].sort((a, b) => b - a); // Sort years in descending order
        setYears(uniqueYears);

        // Filter unpaid users by type
        const unpaidPrivateUsers = res.data.filter(
          (user) => user.Status !== "Paid" && user.Type === "Private"
        );
        const unpaidClassUsers = res.data.filter(
          (user) => user.Status !== "Paid" && user.Type === "Class"
        );

        // Set the message based on unpaid users
        let message = "";
        if (unpaidPrivateUsers.length > 0 || unpaidClassUsers.length > 0) {
          message = "There are students who haven't paid.";
        }
        setUnpaidMessage(message);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchAllUser();
  }, []);

  useEffect(() => {
    if (users.length === 0) return;

    // Recalculate totals when the selected year changes
    const total = users.reduce((sum, user) => {
      if (user.Status === "Paid" && !isNaN(parseFloat(user.Amount))) {
        const userDate = new Date(user.Date);
        if (selectedYear && userDate.getFullYear() !== parseInt(selectedYear)) {
          return sum;
        }
        return sum + parseFloat(user.Amount);
      }
      return sum;
    }, 0);

    const privateTotal = users.reduce((sum, user) => {
      if (user.Status === "Paid" && user.Type === "Private" && !isNaN(parseFloat(user.Amount))) {
        const userDate = new Date(user.Date);
        if (selectedYear && userDate.getFullYear() !== parseInt(selectedYear)) {
          return sum;
        }
        return sum + parseFloat(user.Amount);
      }
      return sum;
    }, 0);

    const classTotal = users.reduce((sum, user) => {
      if (user.Status === "Paid" && user.Type === "Class" && !isNaN(parseFloat(user.Amount))) {
        const userDate = new Date(user.Date);
        const month = `${userDate.getMonth() + 1}-${userDate.getFullYear()}`;
        if (selectedYear && userDate.getFullYear() !== parseInt(selectedYear)) {
          return sum;
        }
        if (!sum[month]) {
          sum[month] = 0;
        }
        sum[month] += parseFloat(user.Amount);
      }
      return sum;
    }, {});

    setTotalAmount(total);
    setPrivateAmounts(privateTotal);
    setClassAmounts(classTotal);

    const monthly = users.reduce((acc, user) => {
      if (user.Status === "Paid" && !isNaN(parseFloat(user.Amount))) {
        const userDate = new Date(user.Date);
        const month = `${userDate.getMonth() + 1}-${userDate.getFullYear()}`;
        const category = user.Type;
        if (selectedYear && userDate.getFullYear() !== parseInt(selectedYear)) {
          return acc;
        }
        if (!acc[month]) {
          acc[month] = { Private: 0, Class: 0 };
        }
        acc[month][category] = acc[month][category]
          ? acc[month][category] + parseFloat(user.Amount)
          : parseFloat(user.Amount);
      }
      return acc;
    }, {});

    setMonthlyAmounts(monthly);
  }, [selectedYear, users]);

  // Handle month selection
  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);

    if (month) {
      const selectedMonthData = monthlyAmounts[month] || { Private: 0, Class: 0 };
      setFilteredAmount({
        private: selectedMonthData.Private || 0,
        class: selectedMonthData.Class || 0,
      });
    } else {
      setFilteredAmount({ private: privateAmounts, class: classAmounts });
    }
  };

  // Handle year selection
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
  };

  // Function to safely format amounts
  const formatAmount = (amount) => {
    return isNaN(amount) ? 0 : amount.toFixed(2);
  };

  // Toggle visibility of total paid amount and unpaid message
  const toggleTotalAmount = () => {
    setShowTotalAmount(!showTotalAmount);
    setShowUnpaidMessage(!showUnpaidMessage); // Toggle the unpaid message visibility as well
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
    <div className="container mt-5">
      {/* Year Dropdown */}
      <div className="mt-4">
        <h3>Select Year:</h3>
        <select
          className="form-select"
          value={selectedYear}
          onChange={handleYearChange}
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Total Paid Amount with click to toggle visibility */}
      {selectedYear && (
        <h2
          onClick={toggleTotalAmount}
          style={{
            cursor: "pointer",
            display: "inline",
            marginRight: "20px",
          }}
        >
          Total Paid Students Amount: ${formatAmount(totalAmount)}
        </h2>
      )}

      {/* Display Total Amounts if visible */}
      {showTotalAmount && selectedYear && (
        <div style={{ display: "inline" }}>
          <p className="mt-4" style={{ display: "inline", marginRight: "20px" }}>
            Private Students Total Paid: ${formatAmount(privateAmounts)}
          </p>
          <p className="mt-4" style={{ display: "inline" }}>
            Classes Total Paid: ${formatAmount(Object.values(classAmounts).reduce((sum, amount) => sum + amount, 0))}
          </p>
        </div>
      )}

      {/* Unpaid Message with click to toggle visibility */}
      {unpaidMessage && selectedYear && (
        <div className="mt-3">
          {showUnpaidMessage && (
            <p style={{ color: "red" }}>{unpaidMessage}</p>
          )}
        </div>
      )}

      {/* Month Dropdown */}
      <div className="mt-4">
        <h3>Monthly Report</h3>
        <label htmlFor="monthSelect">Select Month:</label>
        <select
          id="monthSelect"
          className="form-select"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          <option value="">All Time</option>
          {Object.keys(monthlyAmounts).map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Display Filtered Amount for Selected Month */}
      {selectedMonth && (
        <>
          <h3 className="mt-4">Paid Amount for {selectedMonth}:</h3>
          <p>Private Users: ${formatAmount(filteredAmount.private)}</p>
          <p>Class Users: ${formatAmount(filteredAmount.class)}</p>

          {/* Display Total of the Selected Month */}
          <h3 className="mt-4">Total of Selected Month:</h3>
          <p>
            ${formatAmount(filteredAmount.private + filteredAmount.class)}
          </p>
        </>
      )}
    </div>
  );
};

export default ViewReports;
