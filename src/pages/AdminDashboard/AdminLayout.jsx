//AdminLayout.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminUsers from "./AdminUsers";
import AdminJobs from "./AdminJobs";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminLayout = () => {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return (
    <div className="page-container">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

export default AdminLayout;