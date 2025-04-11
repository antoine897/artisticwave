import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';

import AddClient from "./component/AddClient";
import Users from "./component/Users";
import UpdateUserForm from "./component/Update";
import Login from "./component/login";
import UnpaidUsers from "./component/UnpaidUser";
import ViewReports from "./component/ViewReports";

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/users" element={<Users />} />
              <Route path="/addclient" element={<AddClient />} />
              <Route path="/updateuserForm/:userId" element={<UpdateUserForm />} />
              <Route path="/unpaidusers" element={<UnpaidUsers />} />
              <Route path="/viewReports" element={<ViewReports />} />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
