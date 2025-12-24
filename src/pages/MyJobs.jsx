import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import "./AppStyles.css";

const MyJobs = ({ onProfileUpdate }) => {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [ratingData, setRatingData] = useState({});
  const navigate = useNavigate();
  const [hasFetched, setHasFetched] = useState(false); // ✅ to prevent duplicate toast

  // Fetch jobs posted by user
  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/my");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching my jobs:", err);
      if (!hasFetched) toast.error("Failed to load your jobs."); // only once
    } finally {
      setJobsLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchJobs();
  }, [user]);

  // Handle rating submission
  const handleRatingSubmit = async (assignedJobId) => {
    const { stars, comment } = ratingData[assignedJobId] || {};
    if (!stars || stars < 1) {
      toast.warn("Please select a star rating before submitting!");
      return;
    }

    try {
      // FIX: Changed from regex literal /.../ to template literal `...`
      await api.post(`/jobs/${assignedJobId}/rate`, {
        rating: stars,
        review: comment,
      });

      toast.success("Thank you for your feedback!");
      fetchJobs();
      if (onProfileUpdate) onProfileUpdate();

      setRatingData((prev) => ({
        ...prev,
        [assignedJobId]: { stars: 0, comment: "" },
      }));
    } catch (err) {
      console.error("Error submitting rating:", err);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  // Accept Bid
  const handleAcceptBid = async (jobId, bidId) => {
    try {
      // FIX: Changed from regex literal /.../ to template literal `...`
      const res = await api.put(`/jobs/${jobId}/select/${bidId}`);
      toast.success(res.data.message || "Bid accepted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      fetchJobs();
    } catch (err) {
      console.error("Error accepting bid:", err);
      toast.error(err.response?.data?.message || "Failed to accept bid.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  if (loading || jobsLoading)
    return <p className="text-center mt-6">Loading your jobs...</p>;

  return (
    <div>
      <Navbar />
      <div className="my-jobs-container">
        <h2>My Posted Jobs</h2>

        {jobs.length === 0 ? (
          <p>You haven’t posted any jobs yet.</p>
        ) : (
          <ul className="my-jobs-list">
            {jobs.map((job) => (
              <li key={job._id} className="my-job-card">
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <p>
                    Posted on{" "}
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {job.status === "pending"
                      ? "Not yet accepted"
                      : job.status === "accepted"
                      ? `Accepted by ${job.acceptedBy?.name || "someone"}` // FIX: Changed to template literal
                      : job.status === "completed"
                      ? "Completed"
                      : job.status === "rated"
                      ? "Rated (Completed)"
                      : "Unknown"}
                  </p>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <button
                    className="btn-accept"
                    onClick={() => {
                      // FIX: Changed from regex literal /.../ to template literal `...`
                      navigate(`/jobs/${job._id}/bids`);
                      // Removed toast here to prevent duplicate
                    }}
                  >
                    View Bids
                  </button>
                </div>

                {job.acceptedBy && job.status === "completed" && (
                  <div className="rating-card">
                    <h4 className="rating-header">Rate Completed Work</h4>

                    <div className="stars-wrapper">
                      {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1;
                        return (
                          <FaStar
                            key={ratingValue}
                            className="star-icon"
                            size={28}
                            color={
                              ratingValue <=
                              (ratingData[job._id]?.hover ||
                                ratingData[job._id]?.stars)
                                ? "#facc15"
                                : "#e5e7eb"
                            }
                            onClick={() =>
                              setRatingData((prev) => ({
                                ...prev,
                                [job._id]: {
                                  ...prev[job._id],
                                  stars: ratingValue,
                                },
                              }))
                            }
                            onMouseEnter={() =>
                              setRatingData((prev) => ({
                                ...prev,
                                [job._id]: {
                                  ...prev[job._id],
                                  hover: ratingValue,
                                },
                              }))
                            }
                            onMouseLeave={() =>
                              setRatingData((prev) => ({
                                ...prev,
                                [job._id]: {
                                  ...prev[job._id],
                                  hover: null,
                                },
                              }))
                            }
                          />
                        );
                      })}
                    </div>

                    <textarea
                      className="rating-textarea"
                      placeholder="Write a short review..."
                      value={ratingData[job._id]?.comment || ""}
                      onChange={(e) =>
                        setRatingData((prev) => ({
                          ...prev,
                          [job._id]: {
                            ...prev[job._id],
                            comment: e.target.value,
                          },
                        }))
                      }
                    />

                    <button
                      className="rating-btn"
                      onClick={() => handleRatingSubmit(job._id)}
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyJobs;