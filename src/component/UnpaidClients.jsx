import React, { useEffect, useState } from 'react';
import fetchClientsWithUnpaidStatus from '../methods/fetchClientsWithUnpaidStatus';
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import sendFinancialRecapEmail from '../methods/sendFinancialRecapEmail';

import "../css/style.css"; 

const UnpaidClients = () => {
    const [clients, setClients] = useState([]);
    const [expandedClientId, setExpandedClientId] = useState(null);
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

    useEffect(() => {
        const fetchData = async () => {
            const unpaidClients = await fetchClientsWithUnpaidStatus();
            setClients(unpaidClients);
        };

        fetchData();
    }, []);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSendEmail = async (client, e) => {
        e.stopPropagation();

        let clientEmail = client.mailAddress;

        if (!clientEmail) {
            clientEmail = prompt("This client doesn't have an email address. Please enter one:");
            if (!validateEmail(clientEmail)) {
                alert("Invalid email format. Please try again.");
                return;
            }
            client.mailAddress = clientEmail; // Only in memory for now
        }

        const confirmed = window.confirm(`Send payment reminder to ${client.firstName} ${client.lastName} at ${client.mailAddress}?`);
        if (!confirmed) return;

        try {
            await sendFinancialRecapEmail(client);
            alert(`Email successfully sent to ${client.mailAddress}`);
        } catch (err) {
            alert("An error occurred while sending the email. Please try again later or contact Antonato.");
        }
    };

    const handleRowClick = (clientId) => {
        setExpandedClientId(expandedClientId === clientId ? null : clientId);
    };

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthorized) return null;

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Clients with Unpaid Appointments</h2>
                <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Client Name</th>
                            <th>Phone Number</th>
                            <th>Mail Address</th>
                            <th>Total Owed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <React.Fragment key={client.id}>
                                <tr onClick={() => handleRowClick(client.id)}>
                                    <td>{client.firstName} {client.lastName}</td>
                                    <td>{client.phoneNumber}</td>
                                    <td>{client.mailAddress || <span className="text-danger">No email</span>}</td>
                                    <td>${client.totalOwed}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={(e) => handleSendEmail(client, e)}
                                        >
                                            Send Reminder Email
                                        </button>
                                    </td>
                                </tr>

                                {expandedClientId === client.id && (
                                    <tr>
                                        <td colSpan="5">
                                            <div>
                                                <h5>Appointments Details</h5>
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Service Name</th>
                                                            <th>Appointment Date</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {client.appointments.map((appointment, index) => (
                                                            <tr key={index}>
                                                                <td>{appointment.serviceName}</td>
                                                                <td>
                                                                    {new Date(appointment.dateFrom).toLocaleString()} - {new Date(appointment.dateTo).toLocaleString()}
                                                                </td>
                                                                <td>${appointment.amount}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UnpaidClients;
