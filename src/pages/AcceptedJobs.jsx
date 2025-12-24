
// src/pages/AcceptedJobs.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AppStyles.css";
import axios from "axios";

const refreshUser = async (setUser) => {
  const res = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
  setUser(res.data.user);
};


export default function AcceptedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  const fetchAcceptedJobs = async () => {
    try {
      const res = await api.get("/jobs/accepted");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching accepted jobs:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

const markCompleted = async (id) => {
  try {
    await api.put(`/jobs/${id}/complete`);
    fetchAcceptedJobs(); // refresh jobs
    await refreshUser(setUser); // refresh profile counters
  } catch (err) {
    console.error("Error marking job completed:", err.response?.data || err.message);
  }
};


  if (loading) return <p>Loading your accepted jobs...</p>;

  const acceptedJobs = jobs.filter((j) => j.status === "accepted");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  return (
    <div className="jobs-list">
      <h2>My Accepted Jobs</h2>
      {acceptedJobs.length === 0 ? (
        <p>You haven’t accepted any jobs yet.</p>
      ) : (
        <ul>
          {acceptedJobs.map((a) => (
            <li key={a._id} className="job-card">
              <h3>{a.job?.title}</h3>
              <p>{a.job?.description || "No description available"}</p>
              <p><strong>Category:</strong> {a.job?.category || "N/A"}</p>
              <p><strong>Pay:</strong> ₹{a.job?.price || "N/A"}</p>
              <p><strong>Deadline:</strong> {a.job?.deadline ? new Date(a.job.deadline).toLocaleDateString() : "No deadline"}</p>
              <p><strong>Posted by:</strong> {a.job?.postedBy?.name || "Unknown"}</p>
              <p><strong>Status:</strong> <span style={{ color: "orange" }}>{a.status}</span></p>

              <button onClick={() => markCompleted(a._id)} className="btn-complete">
                Mark as Completed
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Completed Jobs */}
      <h2 style={{ marginTop: "2rem" }}>My Completed Jobs</h2>
      {completedJobs.length === 0 ? (
        <p>No jobs completed yet.</p>
      ) : (
        <ul>
          {completedJobs.map((a) => (
            <li key={a._id} className="job-card">
              <h3>{a.job?.title}</h3>
              <p>{a.job?.description || "No description available"}</p>
              <p><strong>Category:</strong> {a.job?.category || "N/A"}</p>
              <p><strong>Pay:</strong> ₹{a.job?.price || "N/A"}</p>
              <p><strong>Deadline:</strong> {a.job?.deadline ? new Date(a.job.deadline).toLocaleDateString() : "No deadline"}</p>
              <p><strong>Posted by:</strong> {a.job?.postedBy?.name || "Unknown"}</p>
              <p><strong>Status:</strong> <span style={{ color: "green" }}>{a.status}</span></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
