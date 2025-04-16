import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';


import Login from './component/Login';
import Schedule from "./component/Schedule";
import ListClients from "./component/ListClients";
import ClientForm from "./component/ClientForm";
import ListServices from "./component/ListServices";
import ServiceForm from './component/ServiceForm';

import UpdateUserForm from "./component/Update";
import UnpaidClients from "./component/UnpaidClients";
import ViewReports from "./component/ViewReports";
import AppointmentForm from './component/Appointments';

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/clients" element={<ListClients />} />
              <Route path="/client/:id" element={<ClientForm />} />
              <Route path="/clients/add" element={<ClientForm />} /> 
              <Route path="/services" element={<ListServices />} />
              <Route path="/service/:id" element={<ServiceForm />} />
              <Route path="/services/add" element={<ServiceForm />} /> 
              
              
              <Route path="/updateuserForm/:userId" element={<UpdateUserForm />} />
              <Route path="/UnpaidClients" element={<UnpaidClients />} />
              <Route path="/viewReports" element={<ViewReports />} />
              <Route path="/Appointments/Add" element={<AppointmentForm />} />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
