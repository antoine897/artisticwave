import { BrowserRouter, Routes, Route } from "react-router-dom";
import Add from "./component/Add";
import Users from "./component/Users";
import UpdateUserForm from "./component/Update";
import Login from "./component/login";
import UnpaidUsers from "./component/UnpaidUser";
import ViewReports from "./component/ViewReports";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />

          <Route path="/Users" element={<Users />} />
          <Route path="/add" element={<Add />} />
          <Route path="/UpdateUserForm/:userId" element={<UpdateUserForm />} />
          <Route path="/UnpaidUsers" element={<UnpaidUsers />} />
          <Route path="/ViewReports" element={<ViewReports />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
