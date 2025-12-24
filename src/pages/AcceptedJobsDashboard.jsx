// src/pages/AcceptedJobs.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AppStyles.css";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function AcceptedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useAuth(); // to update profile stats
  const [tick, setTick] = useState(0);

  // Refresh every minute to update deadlines
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const openChat = (posterId, jobId, acceptedUserId, posterName) => {
    if (!acceptedUserId) {
      toast.error("Cannot open chat: Accepted user not found");
      return;
    }
    toast("Opening chat...", { icon: "💬" });
    navigate(`/chat/${posterId}/${jobId}/${acceptedUserId}`, {
      state: { posterName },
    });
  };

  const fetchAcceptedJobs = async () => {
    try {
      const res = await api.get("/jobs/accepted");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching accepted jobs:", err.response?.data || err.message);
      toast.error("Failed to load accepted jobs.");
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (id) => {
    try {
      await api.put(`/jobs/${id}/complete`);
      toast.success("Job marked as completed!");
      fetchAcceptedJobs();

      // Refresh user stats
      const res = await api.get("/auth/me", { withCredentials: true });
      setUser(res.data.user);
    } catch (err) {
      console.error("Error marking job completed:", err.response?.data || err.message);
      toast.error("Failed to mark job as completed.");
    }
  };

  const acceptJob = async (id) => {
    try {
      await api.put(`/jobs/${id}/accept`);
      toast.success("Job accepted successfully!");
      fetchAcceptedJobs();

      // Update user stats immediately
      const res = await api.get("/auth/me", { withCredentials: true });
      setUser(res.data.user);
    } catch (err) {
      console.error("Error accepting job:", err.response?.data || err.message);
      toast.error("Failed to accept the job.");
    }
  };

  const timeLeft = (deadline) => {
    if (!deadline) return "No deadline";

    const now = new Date();
    const end = new Date(deadline);
    const diffMs = end - now;

    if (diffMs <= 0) return "Expired";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours % 24}h left`;
    if (minutes > 0) return `${minutes % 60}m left`;
    return "Less than a minute left";
  };

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  if (loading) return <p>Loading your accepted jobs...</p>;

  const acceptedJobs = jobs.filter((j) => j.status === "accepted");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  return (
    <div className="jobs-list">
      <Toaster position="top-right" />
      <h2>My Accepted Jobs</h2>
      {acceptedJobs.length === 0 ? (
        <p className="no-jobs-msg">You haven’t accepted any jobs yet.</p>
      ) : (
        <ul>
          {acceptedJobs.map((jobItem) => {
            const job = jobItem.job || {};
            const postedBy = job.postedBy || {};
            const student = jobItem.student || {};
            return (
              <li key={jobItem._id} className="job-card">
                <span className="job-time">{timeLeft(job.deadline)}</span>
                <h3>{job.title}</h3>
                <p>{job.description || "No description available"}</p>
                <p><strong>Category:</strong> {job.category || "N/A"}</p>
                <p><strong>Pay:</strong> ₹{job.price || "N/A"}</p>
                <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</p>
                <p><strong>Posted by:</strong> {postedBy.name || "Unknown"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: "#FFA500", fontWeight: "bold" }}>{jobItem.status}</span>
                </p>

                <div className="job-buttons">
                  <button
                    className="btn-portfolio"
                    onClick={() => {
                      if (!postedBy._id) {
                        toast.error("Poster profile not found");
                        return;
                      }
                      toast("Opening portfolio...", { icon: "🧾" });
                      navigate(`/portfolio/${postedBy._id}`);
                    }}
                  >
                    View Portfolio
                  </button>

                  {jobItem.status === "pending" && (
                    <button className="btn-accept" onClick={() => acceptJob(jobItem._id)}>
                      Accept Job
                    </button>
                  )}
                  {jobItem.status === "accepted" && (
                    <button className="btn-complete" onClick={() => markCompleted(jobItem._id)}>
                      Mark as Completed
                    </button>
                  )}

                  <button
                    className="chat-btn"
                    onClick={() => openChat(postedBy._id, jobItem._id, student._id, postedBy.name)}
                  >
                    Chat
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>My Completed Jobs</h2>
      {completedJobs.length === 0 ? (
        <p className="no-jobs-msg">No jobs completed yet.</p>
      ) : (
        <ul>
          {completedJobs.map((jobItem) => {
            const job = jobItem.job || {};
            const postedBy = job.postedBy || {};
            const student = jobItem.student || {};
            return (
              <li key={jobItem._id} className="job-card">
                <h3>{job.title}</h3>
                <p>{job.description || "No description available"}</p>
                <p><strong>Category:</strong> {job.category || "N/A"}</p>
                <p><strong>Pay:</strong> ₹{job.price || "N/A"}</p>
                <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</p>
                <p><strong>Posted by:</strong> {postedBy.name || "Unknown"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: "#28a745", fontWeight: "bold" }}>{jobItem.status}</span>
                </p>

                <div className="job-buttons">
                  <button
                    className="btn-portfolio"
                    onClick={() => {
                      if (!postedBy._id) {
                        toast.error("Poster profile not found");
                        return;
                      }
                      toast("Opening portfolio...", { icon: "🧾" });
                      navigate(`/portfolio/${postedBy._id}`);
                    }}
                  >
                    View Portfolio
                  </button>

                  <button
                    className="chat-btn"
                    onClick={() => openChat(postedBy._id, jobItem._id, student._id, postedBy.name)}
                  >
                    Chat
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
