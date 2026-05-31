// App.js
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchDashboardStats } from "./store/slices/employeeSlice";
import Dashboard from "./components/Dashboard";
import EmployeeList from "./components/EmployeeList";
import AddEditEmployee from "./components/AddEditEmployee";
import Departments from "./components/Departments";
import Attendance from "./components/Attendance";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Layout from "./components/Layout";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/add" element={<AddEditEmployee />} />
          <Route path="/employees/edit/:id" element={<AddEditEmployee />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
