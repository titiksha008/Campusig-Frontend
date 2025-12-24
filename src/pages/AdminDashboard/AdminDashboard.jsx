//AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const usersRes = await axios.get("http://localhost:5000/api/admin/users", {
          withCredentials: true,
        });

        const jobsRes = await axios.get("http://localhost:5000/api/admin/jobs", {
          withCredentials: true,
        });

        setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);
        setJobs(Array.isArray(jobsRes.data.jobs) ? jobsRes.data.jobs : []);

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="dashboard-summary">
        <div className="summary-tile users">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>

        <div className="summary-tile jobs">
          <h3>Total Jobs</h3>
          <p>{jobs.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;