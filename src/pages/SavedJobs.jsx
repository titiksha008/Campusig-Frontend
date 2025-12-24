//frontend/pages/SavedJobs.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./SavedJobs.css";
import { toast } from "react-toastify";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await api.get("/users/saved-jobs");
        setJobs(res.data);
        // ✅ Removed toast on initial load
      } catch (err) {
        console.error("Error fetching saved jobs", err);
        toast.error("Failed to load saved jobs");
      }
    };
    fetchSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      await api.delete(`/users/unsave-job/${jobId}`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.info("❌ Job removed from saved list"); // only triggers on unsave
    } catch (err) {
      console.error("Error unsaving job:", err);
      toast.error("Failed to unsave job. Try again.");
    }
  };

  return (
    <div className="saved-jobs-container">
      <h2>Saved Jobs</h2>
      {jobs.length === 0 ? (
        <p>You haven’t saved any jobs yet.</p>
      ) : (
        <div className="saved-jobs-list">
          {jobs.map((job) => (
            <div key={job._id} className="saved-job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p>
                <strong>Budget:</strong> ₹{job.budget || job.price || "Not specified"}
              </p>
              <button
                className="unsave-btn"
                onClick={() => handleUnsaveJob(job._id)}
              >
                ❌ Unsave
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
