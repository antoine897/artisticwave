import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Table } from 'react-bootstrap';
import { COLLECTIONS } from '../constants/collectionConst';
import fetchDocuments from '../methods/fetchDocuments'; // Must fetch docs with IDs
import "../css/style.css";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ViewReports = () => {
  const [financialData, setFinancialData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [yearlyData, setYearlyData] = useState({});
  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      } else {
        setIsAuthorized(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    if (!isAuthorized) return;

    const loadFinancials = async () => {
      try {
        const rawDocs = await fetchDocuments(COLLECTIONS.FINANCIALS);
        setFinancialData(rawDocs);
        setYearlyData(transformFinancialData(rawDocs));
      } catch (error) {
        console.error("Error loading Financials:", error);
      }
    };

    loadFinancials();
  }, [isAuthorized]);


  const transformFinancialData = (docs) => {
    const structured = {};

    docs.forEach((doc) => {
      const { id, income = [], expense = [] } = doc;
      const year = id.slice(0, 4);
      const month = id.slice(4);

      if (!structured[year]) structured[year] = {};

      const monthIncome = income.reduce((acc, item) => acc + parseFloat(item.value || 0), 0);
      const monthExpense = expense.reduce((acc, item) => acc + parseFloat(item.value || 0), 0);

      if (monthIncome > 0 || monthExpense > 0) {
        structured[year][month] = {
          id,
          income,
          expense,
          totalIncome: monthIncome,
          totalExpense: monthExpense,
          net: monthIncome - monthExpense,
        };
      }
    });

    return structured;
  };

  const toggleYear = (year) => {
    setExpandedYear(prev => (prev === year ? null : year));
    setExpandedMonths({}); // Reset months when changing year
  };

  const toggleMonth = (year, month) => {
    const key = `${year}-${month}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getMonthName = (monthNumber) => {
    const num = parseInt(monthNumber, 10);
    return MONTH_NAMES[num] || monthNumber;
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Financial Report</h3>
        <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="mt-5">
        <h4>Yearly Summary</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Year</th>
              <th>Total Income</th>
              <th>Total Expense</th>
              <th>Net Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(yearlyData).map(([year, months]) => {
              const totalIncome = Object.values(months).reduce((acc, m) => acc + m.totalIncome, 0);
              const totalExpense = Object.values(months).reduce((acc, m) => acc + m.totalExpense, 0);
              const net = totalIncome - totalExpense;

              return (
                <React.Fragment key={year}>
                  <tr onClick={() => toggleYear(year)} style={{ cursor: "pointer" }}>
                    <td>{year}</td>
                    <td style={{ color: "green" }}>${totalIncome.toFixed(2)}</td>
                    <td style={{ color: "red" }}>${totalExpense.toFixed(2)}</td>
                    <td style={{ color: net >= 0 ? "green" : "red" }}>${net.toFixed(2)}</td>
                  </tr>

                  {expandedYear === year &&
                    Object.entries(months).map(([monthKey, monthData]) => {
                      const isExpanded = expandedMonths[`${year}-${monthKey}`];

                      return (
                        <React.Fragment key={`${year}-${monthKey}`}>
                          <tr
                            onClick={() => toggleMonth(year, monthKey)}
                            style={{ cursor: "pointer", backgroundColor: "#f8f9fa" }}
                          >
                            <td className="ps-4">{getMonthName(monthKey)}</td>
                            <td style={{ color: "green" }}>${monthData?.totalIncome?.toFixed(2) || "0.00"}</td>
                            <td style={{ color: "red" }}>${monthData?.totalExpense?.toFixed(2) || "0.00"}</td>
                            <td style={{ color: (monthData?.net || 0) >= 0 ? "green" : "red" }}>
                              ${(monthData?.net || 0).toFixed(2)}
                            </td>
                          </tr>

                          {isExpanded && monthData && (
                            <tr>
                              <td colSpan={4}>
                                <div className="monthly-table-container">
                                  <Table striped bordered hover size="sm">
                                    <thead>
                                      <tr>
                                        <th>Entry</th>
                                        <th>Description</th>
                                        <th>Details</th>
                                        <th>Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(monthData.income || []).map((item, idx) => (
                                        <tr key={`inc-${idx}`}>
                                          <td style={{ color: "green" }}>Income</td>
                                          <td>{item.type || "-"}</td>
                                          <td>{item.details?.description || "-"}</td>
                                          <td style={{ color: "green" }}>${parseFloat(item.value).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                      {(monthData.expense || []).map((item, idx) => (
                                        <tr key={`exp-${idx}`}>
                                          <td style={{ color: "red" }}>Expense</td>
                                          <td>{item.type || "-"}</td>
                                          <td>{item.details?.description || "-"}</td>
                                          <td style={{ color: "red" }}>${parseFloat(item.value).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ViewReports;
