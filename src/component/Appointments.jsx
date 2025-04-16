import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import "../css/style.css";

export const COLLECTIONS = {
  CLIENTS: 'clients',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
};

const AppointmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(getApp());

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [relativePhoneNumber, setRelativePhoneNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('pending');
  const [amount, setAmount] = useState('');

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
    const fetchClients = async () => {
      try {
        // Fetch only the first 5 clients
        const q = query(collection(db, COLLECTIONS.CLIENTS));
        const querySnapshot = await getDocs(q);
        const clientList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientList);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, [db]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.SERVICES));
        const servicesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [db]);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const appointmentData = docSnap.data();
          setIsEditMode(true);
          setFirstName(appointmentData.FirstName || '');
          setLastName(appointmentData.LastName || '');
          setPhoneNumber(appointmentData.PhoneNumber || '');
          setRelativeName(appointmentData.relativeName || '');
          setRelativePhoneNumber(appointmentData.relativePhoneNumber || '');
          setDate(appointmentData.date || '');
          setTime(appointmentData.time || '');
          setType(appointmentData.type || '');
          setStatus(appointmentData.status || 'pending');
          setAmount(appointmentData.amount || '');
        }
      } catch (error) {
        console.error("Error fetching appointment: ", error);
      }
    };

    fetchAppointment();
  }, [db, id]);

  const checkAppointmentConflict = async () => {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("date", "==", date),
      where("time", "==", time),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    const newType = type.toLowerCase();

    const conflictingAppointments = querySnapshot.docs.filter(docSnap => {
      const existing = docSnap.data().type?.toLowerCase();

      const isExistingGroup = existing === "group class";
      const isNewGroup = newType === "group class";

      if (
        (!isNewGroup && !isExistingGroup) || 
        (isNewGroup && !isExistingGroup) ||   
        (!isNewGroup && isExistingGroup)
      ) {
        return true;
      }

      return false;
    });

    return conflictingAppointments.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConflict = await checkAppointmentConflict();
    if (isConflict) {
      alert("There is already an appointment at this time. Please select another time.");
      return;
    }

    const appointmentData = {
      FirstName: firstName,
      LastName: lastName,
      PhoneNumber: phoneNumber,
      relativeName,
      relativePhoneNumber,
      date,
      time,
      type,
      status,
      amount: status === "paid" ? amount : '',
      createdDate: new Date().toISOString(),
    };

    try {
      if (isEditMode && id) {
        const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
        await updateDoc(docRef, appointmentData);
        alert('Appointment Updated Successfully');
      } else {
        await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), appointmentData);
        alert('Appointment Created Successfully');
      }
      navigate('/Schedule');
    } catch (e) {
      console.error("Error saving appointment: ", e);
      alert('Error saving appointment. Please try again later.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <div className="w-50 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-3 mt-5">{isEditMode ? 'Update Appointment' : 'Add New Appointment'}</h2>
          <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Select Client</label>
            <select
              className="form-select"
              onChange={(e) => {
                const selectedClient = clients.find(c => c.id === e.target.value);
                if (selectedClient) {
                  setFirstName(selectedClient.firstName || '');
                  setLastName(selectedClient.lastName || '');
                  setPhoneNumber(selectedClient.phoneNumber || '');
                  setRelativeName(selectedClient.relativeName || '');
                  setRelativePhoneNumber(selectedClient.relativePhoneNumber || '');
                }
              }}
            >
              <option value="">-- Select a Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} ({client.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Relative Name</label>
            <input
              type="text"
              className="form-control"
              value={relativeName}
              onChange={(e) => setRelativeName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Relative Phone Number</label>
            <input
              type="tel"
              className="form-control"
              value={relativePhoneNumber}
              onChange={(e) => setRelativePhoneNumber(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Time</label>
            <input
              type="time"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Select Type</label>
            <select
              className="form-select"
              onChange={(e) => {
                const selectedType = services.find(service => service.id === e.target.value);
                if (selectedType) {
                  setType(selectedType.serviceName || '');
                }
              }}
              required
            >
              <option value="">-- Select a Type --</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.serviceName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (e.target.value !== 'paid') setAmount('');
              }}
              required
            >
              <option value="">Pending</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {status === 'paid' && (
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Appointment' : 'Add Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
