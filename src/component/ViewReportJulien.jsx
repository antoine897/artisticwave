import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Table } from 'react-bootstrap';
import { COLLECTIONS } from '../constants/collectionConst';

import fetchDocumentsId from '../methods/fetchDocumentsId'; 
import fetchDocumentWithId from "../methods/fetchDocumentWithId";

const ViewReports = () => {
  const [financialData, setFinancialData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [monthsInYear, setMonthsInYear] = useState([]);  // Months available for the selected year
  const [unpaidMessage, setUnpaidMessage] = useState("");
  const [yearsAndMonths,setYearsAndMonths] = useState([])

  const auth = getAuth();
  const navigate = useNavigate();

  // Firebase Auth to check if the user is authorized
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

  // Fetch years and months from Firestore
  useEffect(() => {
    const fetchYearsAndMonths = async () => {
      try {
        const documentIds = await fetchDocumentsId(COLLECTIONS.FINANCIALS);

        // Extract years and months from document IDs
        const yearsAndMonthsList = documentIds.map(id => {
          const year = id.slice(0, 4);
          const month = id.slice(4, 6);
          return { year, month };
        });

        // Group months by year
        const groupedYearsAndMonths = yearsAndMonthsList.reduce((acc, { year, month }) => {
          if (!acc[year]) acc[year] = [];
          acc[year].push(month);
          return acc;
        }, {});

        // Convert the object into an array and sort by year
        const sortedYearsAndMonths = Object.entries(groupedYearsAndMonths).map(([year, months]) => ({
          year,
          months: months.sort((a, b) => a - b)  // Sort months in ascending order
        }));

        setYearsAndMonths(sortedYearsAndMonths);
      } catch (err) {
        console.error("Error fetching years and months:", err);
      }
    };

    fetchYearsAndMonths();
  }, []);

  const fetchFinancialData = async (year, month) => {
    const docId = `${year}${month}`; 
    console.log(docId)
    try {
      const data = await fetchDocumentWithId(COLLECTIONS.FINANCIALS, docId);
      if (data) {
        setFinancialData(data);

        const income = data.income || [];
        const expense = data.expense || [];

        const incomeTotal = income.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        const expenseTotal = expense.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

        setTotalIncome(incomeTotal);
        setTotalExpense(expenseTotal);
      } else {
        setFinancialData(null);
        setUnpaidMessage("No financial data found for the selected month and year.");
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    }
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    setSelectedMonth("");  // Reset the selected month when the year changes
    setMonthsInYear(yearsAndMonths.find(item => item.year === year)?.months || []);  // Get months for the selected year
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
  };

  // Handle form submission to fetch data
  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedYear && selectedMonth) {
      fetchFinancialData(selectedYear, selectedMonth);
    }
  };

  // Loading state handling
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mt-5">
      <h3>Financial Report</h3>

      {/* Year and Month Selectors */}
      <div className="form-row">
        <div className="form-group col-md-6">
          <label htmlFor="yearSelect">Year</label>
          <select id="yearSelect" className="form-control" value={selectedYear} onChange={handleYearChange}>
            <option value="">Select Year</option>
            {yearsAndMonths.map(({ year }) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="monthSelect">Month</label>
          <select id="monthSelect" className="form-control" value={selectedMonth} onChange={handleMonthChange}>
            <option value="">Select Month</option>
            {selectedYear && monthsInYear.map((month) => (
              <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button className="btn btn-primary mt-3" onClick={handleSubmit}>Fetch Data</button>

      {/* Message if no data found */}
      {unpaidMessage && <p style={{ color: "red" }}>{unpaidMessage}</p>}

      {/* Displaying Financial Data */}
      {financialData && (
        <div className="mt-4">
          <h4>Income and Expenses for {selectedMonth}-{selectedYear}</h4>

          {/* Table for Income and Expenses */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Income Rows */}
              {financialData.income && financialData.income.map((item, index) => (
                <tr key={`income-${index}`}>
                  <td style={{ color: "green" }}>Income</td>
                  <td>{item.details.description || '-'}</td>
                  <td style={{ color: "green" }}>${parseFloat(item.value).toFixed(2)}</td>
                </tr>
              ))}
              {/* Expense Rows */}
              {financialData.expense && financialData.expense.map((item, index) => (
                <tr key={`expense-${index}`}>
                  <td style={{ color: "red" }}>Expense</td>
                  <td>{item.details.description}</td>
                  <td style={{ color: "red" }}>${parseFloat(item.value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Totals */}
          <h5>Total Income: ${totalIncome.toFixed(2)}</h5>
          <h5>Total Expense: ${totalExpense.toFixed(2)}</h5>
          <h5>Net Gain/Loss: ${(totalIncome - totalExpense).toFixed(2)}</h5>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
