import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { COLLECTIONS } from '../constants/collectionConst';
import "../css/style.css";

import createDocumentWithId from '../methods/createDocumentWithId';
import updateDocumentWithId from '../methods/updateDocumentWithId';
import fetchDocumentWithId from "../methods/fetchDocumentWithId";

const Financials = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [entryType, setEntryType] = useState('income'); 
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [details, setDetails] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!type || !value || isNaN(value)) {
      alert("Please fill in valid type and numeric value.");
      return;
    }
  
    const now = new Date();
    const docId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newEntry = {
      type,
      value: Number(value),
      details: {
        description: details
      }
    };
  
    try {
      const existingDoc = await fetchDocumentWithId(COLLECTIONS.FINANCIALS, docId);
      if (existingDoc) {
        const updatedList = Array.isArray(existingDoc[entryType])
          ? [...existingDoc[entryType], newEntry]
          : [newEntry];
  
        await updateDocumentWithId(COLLECTIONS.FINANCIALS, {
          [entryType]: updatedList
        }, docId);
      } else {
        const initialData = {
          income: entryType === 'income' ? [newEntry] : [],
          expense: entryType === 'expense' ? [newEntry] : []
        };
  
        await createDocumentWithId(COLLECTIONS.FINANCIALS, initialData, docId);
      }
  
      alert(`${entryType === 'income' ? 'Income' : 'Expense'} added successfully`);
      setType('');
      setValue('');
      setDetails('');
    } catch (error) {
      console.error("Error saving financial entry:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-3 mt-5">Add Financial Entry</h2>
          <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Entry Type</label>
            <select
              className="form-select"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Type</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Consultation - John Doe"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Value ($)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter amount"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Details</label>
            <textarea
              className="form-control"
              placeholder="Optional additional notes"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success">
            Add Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default Financials;
