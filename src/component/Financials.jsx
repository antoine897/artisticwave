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
  const [description, setDescription] = useState('');

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

    if (!entryType || !type.trim() || !value || isNaN(value)) {
      alert("Please fill in all required fields with valid values.");
      return;
    }

    const now = new Date();
    const docId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newEntry = {
      type: type.trim(),
      value: Number(value),
      details: {
        description: description.trim()
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

      alert(`${entryType === 'income' ? 'Income' : 'Expense'} added successfully.`);
      setEntryType('income');
      setType('');
      setValue('');
      setDescription('');
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
          <button
            className="btn btn-outline-primary fw-bold fs-5"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Entry Type Selector */}
          <div className="mb-3">
            <label className="form-label">Entry Type<span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Type Input */}
          <div className="mb-3">
            <label className="form-label">Type<span className="text-danger">*</span></label>
            <input
              className="form-control"
              placeholder="e.g., Rent, Salary, Shopping"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          {/* Value Input */}
          <div className="mb-3">
            <label className="form-label">Value ($)<span className="text-danger">*</span></label>
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

          {/* Description Input */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Optional additional notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
