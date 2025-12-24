//AdminJobs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" by default

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/jobs", { withCredentials: true });
        setJobs(Array.isArray(res.data.jobs) ? res.data.jobs : []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err.response || err);
        setError("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p className="loading">Loading jobs...</p>;
  if (error) return <p className="loading">{error}</p>;

  // Dashboard stats based on status
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === "pending").length;
  const acceptedJobs = jobs.filter(j => j.status === "accepted").length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;

  const chartData = [
  { name: "Pending", count: pendingJobs },
  { name: "Accepted", count: acceptedJobs },
  { name: "Completed", count: completedJobs },
];


  // Apply filter to jobs list
  const filteredJobs = statusFilter === "all" ? jobs : jobs.filter(j => j.status === statusFilter);

  return (
    <div className="admin-jobs-container">
      <h1 className="dashboard-title">Admin Jobs</h1>

      <div className="jobs-chart-container">
  <h2 className="chart-title">Jobs Status Overview</h2>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#6a5acd" radius={[5, 5, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>

      {/* Dashboard Tiles */}
      <div className="dashboard-tiles">
        <div className="tile total">Total Jobs: {totalJobs}</div>
        <div className="tile pending">Pending: {pendingJobs}</div>
        <div className="tile accepted">Accepted: {acceptedJobs}</div>
        <div className="tile completed">Completed: {completedJobs}</div>
      </div>

      {/* Filter */}
      <div className="filter-container">
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Accordion Cards */}
      <div className="accordion-container">
        {filteredJobs.map(job => (
          <div key={job._id} className="accordion-card">
            <div className="accordion-header">
              <span>{job.title}</span>
              <button
                className="details-btn"
                onClick={() => setExpandedId(expandedId === job._id ? null : job._id)}
              >
                {expandedId === job._id ? "Hide Details" : "View Details"}
              </button>
            </div>
            {expandedId === job._id && (
              <div className="accordion-body">
                <p><strong>Posted By:</strong> {job.postedBy?.name || "Unknown"}</p>
                <p><strong>Status:</strong> {job.status}</p>
                <p><strong>Created:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                {job.description && <p><strong>Description:</strong> {job.description}</p>}
              </div>
            )}
          </div>
        ))}
        {filteredJobs.length === 0 && <p className="loading">No jobs found for this filter.</p>}
      </div>
    </div>
  );
};

export default AdminJobs;