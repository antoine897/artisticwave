// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';

// const ViewReports = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [privateAmounts, setPrivateAmounts] = useState(0);
//   const [classAmounts, setClassAmounts] = useState({});
//   const [monthlyAmounts, setMonthlyAmounts] = useState({});
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [filteredAmount, setFilteredAmount] = useState({ private: 0, class: 0 });
//   const [unpaidMessage, setUnpaidMessage] = useState("");
//   const [years, setYears] = useState([]);
//   const [showTotalAmount, setShowTotalAmount] = useState(false);
//   const [showUnpaidMessage, setShowUnpaidMessage] = useState(false);

//   const cors = require('cors');
// app.use(cors());

//   // Firebase Authentication for user verification
//   const navigate = useNavigate();
//   const auth = getAuth();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         navigate('/');
//       } else {
//         setIsAuthorized(true);
//         setIsLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [auth, navigate]);

//   // Fetching appointment data
//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const res = await axios.get("http://localhost:8800/appointments"); // Adjust the API endpoint as needed
//         setAppointments(res.data);

//         // Extract distinct years from appointments data
//         const uniqueYears = [
//           ...new Set(res.data.map((appointment) => new Date(appointment.date).getFullYear())),
//         ].sort((a, b) => b - a); // Sort years in descending order
//         setYears(uniqueYears);

//         // Filter unpaid appointments by type
//         const unpaidPrivateAppointments = res.data.filter(
//           (appointments) => appointments.status !== "Paid" && appointments.type === "Private"
//         );
//         const unpaidClassAppointments = res.data.filter(
//           (appointments) => appointments.status !== "Paid" && appointments.type === "Class"
//         );

//   // Fetching appointment data
//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const res = await axios.get("http://localhost:8800/appointments"); // Adjust the API endpoint as needed
//         setAppointments(res.data);

//     fetchAppointments();
//   }, []);

//   // Recalculating totals when year or appointments data change
//   useEffect(() => {
//     if (appointments.length === 0) return;

//     const total = appointments.reduce((sum, appointment) => {
//       if (appointment.status === "Paid" && !isNaN(parseFloat(appointment.amount))) {
//         const appointmentDate = new Date(appointment.date);
//         if (selectedYear && appointmentDate.getFullYear() !== parseInt(selectedYear)) {
//           return sum;
//         }
//         return sum + parseFloat(appointment.amount);
//       }
//       return sum;
//     }, 0);

//     const privateTotal = appointments.reduce((sum, appointment) => {
//       if (appointment.status === "Paid" && appointment.type === "Private" && !isNaN(parseFloat(appointment.amount))) {
//         const appointmentDate = new Date(appointment.date);
//         if (selectedYear && appointmentDate.getFullYear() !== parseInt(selectedYear)) {
//           return sum;
//         }
//         return sum + parseFloat(appointment.amount);
//       }
//       return sum;
//     }, 0);

//     const classTotal = appointments.reduce((sum, appointment) => {
//       if (appointment.status === "Paid" && appointment.type === "Class" && !isNaN(parseFloat(appointment.amount))) {
//         const appointmentDate = new Date(appointment.date);
//         const month = `${appointmentDate.getMonth() + 1}-${appointmentDate.getFullYear()}`;
//         if (selectedYear && appointmentDate.getFullYear() !== parseInt(selectedYear)) {
//           return sum;
//         }
//         if (!sum[month]) {
//           sum[month] = 0;
//         }
//         sum[month] += parseFloat(appointment.amount);
//       }
//       return sum;
//     }, {});

//     setTotalAmount(total);
//     setPrivateAmounts(privateTotal);
//     setClassAmounts(classTotal);

//     const monthly = appointments.reduce((acc, appointment) => {
//       if (appointment.status === "Paid" && !isNaN(parseFloat(appointment.amount))) {
//         const appointmentDate = new Date(appointment.date);
//         const month = `${appointmentDate.getMonth() + 1}-${appointmentDate.getFullYear()}`;
//         const category = appointment.type;
//         if (selectedYear && appointmentDate.getFullYear() !== parseInt(selectedYear)) {
//           return acc;
//         }
//         if (!acc[month]) {
//           acc[month] = { Private: 0, Class: 0 };
//         }
//         acc[month][category] = acc[month][category]
//           ? acc[month][category] + parseFloat(appointment.amount)
//           : parseFloat(appointment.amount);
//       }
//       return acc;
//     }, {});

//     setMonthlyAmounts(monthly);
//   }, [selectedYear, appointments]);

//   // Handling month selection
//   const handleMonthChange = (event) => {
//     const month = event.target.value;
//     setSelectedMonth(month);

//     if (month) {
//       const selectedMonthData = monthlyAmounts[month] || { Private: 0, Class: 0 };
//       setFilteredAmount({
//         private: selectedMonthData.Private || 0,
//         class: selectedMonthData.Class || 0,
//       });
//     } else {
//       setFilteredAmount({ private: privateAmounts, class: classAmounts });
//     }
//   };

//   // Handling year selection
//   const handleYearChange = (event) => {
//     const year = event.target.value;
//     setSelectedYear(year);
//   };

//   // Formatting amounts
//   const formatAmount = (amount) => {
//     return isNaN(amount) ? 0 : amount.toFixed(2);
//   };

//   // Toggling visibility of total amount and unpaid message
//   const toggleTotalAmount = () => {
//     setShowTotalAmount(!showTotalAmount);
//     setShowUnpaidMessage(!showUnpaidMessage);
//   };

//   // Loading and authorization state
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthorized) {
//     return null;
//   }

//   return (
//     <div className="container mt-5">
//       {/* Year Dropdown */}
//       <div className="mt-4">
//         <h3>Select Year:</h3>
//         <select
//           className="form-select"
//           value={selectedYear}
//           onChange={handleYearChange}
//         >
//           <option value="">All Years</option>
//           {years.map((year) => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Total Paid Amount */}
//       {selectedYear && (
//         <h2
//           onClick={toggleTotalAmount}
//           style={{
//             cursor: "pointer",
//             display: "inline",
//             marginRight: "20px",
//           }}
//         >
//           Total Paid Appointments Amount: ${formatAmount(totalAmount)}
//         </h2>
//       )}

//       {/* Display Total Amounts if visible */}
//       {showTotalAmount && selectedYear && (
//         <div style={{ display: "inline" }}>
//           <p className="mt-4" style={{ display: "inline", marginRight: "20px" }}>
//             Private Appointments Total Paid: ${formatAmount(privateAmounts)}
//           </p>
//           <p className="mt-4" style={{ display: "inline" }}>
//             Classes Total Paid: ${formatAmount(Object.values(classAmounts).reduce((sum, amount) => sum + amount, 0))}
//           </p>
//         </div>
//       )}

//       {/* Unpaid Message */}
//       {unpaidMessage && selectedYear && (
//         <div className="mt-3">
//           {showUnpaidMessage && <p style={{ color: "red" }}>{unpaidMessage}</p>}
//         </div>
//       )}

//       {/* Month Dropdown */}
//       <div className="mt-4">
//         <h3>Monthly Report</h3>
//         <label htmlFor="monthSelect">Select Month:</label>
//         <select
//           id="monthSelect"
//           className="form-select"
//           value={selectedMonth}
//           onChange={handleMonthChange}
//         >
//           <option value="">All Time</option>
//           {Object.keys(monthlyAmounts).map((month) => (
//             <option key={month} value={month}>
//               {month}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Display Filtered Amount for Selected Month */}
//       {selectedMonth && (
//         <>
//           <h3 className="mt-4">Paid Amount for {selectedMonth}:</h3>
//           <p>Private Appointments: ${formatAmount(filteredAmount.private)}</p>
//           <p>Class Appointments: ${formatAmount(filteredAmount.class)}</p>

//           {/* Display Total of the Selected Month */}
//           <h3 className="mt-4">Total of Selected Month:</h3>
//           <p>
//             ${formatAmount(filteredAmount.private + filteredAmount.class)}
//           </p>
//         </>
//       )}
//     </div>
//   );
// };

// export default ViewReports;
