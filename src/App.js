import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';

import Login from './component/Login';
import ForgotPassword from './component/ForgotPassword';
import ChangePassword from './component/ChangePassword';
import Schedule from "./component/Schedule";
import AppointmentForm from './component/AppointmentForm';
import ListClients from "./component/ListClients";
import ClientForm from "./component/ClientForm";
import UnpaidClients from "./component/UnpaidClients";

import ListServices from "./component/ListServices";
import ServiceForm from './component/ServiceForm';


import ViewReports from "./component/ViewReports";
import Financials from './component/Financials';


import NotFound from './component/NotFound';

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
              
              <Route path="/" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/appointments/:id" element={<AppointmentForm />} />
              <Route path="/appointments/add" element={<AppointmentForm />} />
              <Route path="/clients" element={<ListClients />} />
              <Route path="/client/:id" element={<ClientForm />} />
              <Route path="/clients/add" element={<ClientForm />} /> 
              <Route path="/unpaidclients" element={<UnpaidClients />} />
              <Route path="/services" element={<ListServices />} />
              <Route path="/service/:id" element={<ServiceForm />} />
              <Route path="/services/add" element={<ServiceForm />} /> 
              
              <Route path="/viewreports" element={<ViewReports />} />
              <Route path="/financials" element={<Financials />} /> 

              <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
