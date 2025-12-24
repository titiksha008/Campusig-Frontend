//frontend/pages/jobsList.jsx
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "./AppStyles.css";
import BidModel from "../components/BidModel";
import { toast } from "react-toastify";

export default function JobsList({ user, setUser }) {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tick, setTick] = useState(0);
  const [currentUser, setCurrentUser] = useState(user || null);
  const [sortOrder, setSortOrder] = useState(""); // "high" or "low"
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 🆕 Bid modal logic
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Force re-render every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) {
        try {
          const res = await api.get("/auth/me", { withCredentials: true });
          const userData = res.data.user;
          if (!userData.skills) userData.skills = [];
          setCurrentUser(userData);
          if (setUser) setUser(userData);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [currentUser, setUser]);

  // Fetch jobs and filter expired immediately
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs", { params: { role: roleFilter } });
        const allJobs = res.data || [];
        const validJobs = allJobs.filter(
          (job) => !job.deadline || new Date(job.deadline) > new Date()
        );
        setJobs(validJobs);

        const uniqueCategories = [
          ...new Set(
            validJobs.map((job) => job.category?.toLowerCase()).filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, [roleFilter]);

  // Compute recommendations based on user skills
  useEffect(() => {
    if (!currentUser?.skills?.length || !jobs.length) return;

    const matched = jobs.filter(
      (job) =>
        job.skills?.length > 0 &&
        currentUser.skills.some((skill) => {
          const s = skill.toLowerCase();
          return (
            job.title?.toLowerCase().includes(s) ||
            job.description?.toLowerCase().includes(s) ||
            job.category?.toLowerCase().includes(s)
          );
        })
    );

    const topMatches = matched.slice(0, 2);
    const others = jobs.filter((j) => !matched.includes(j));
    const randomOther =
      others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null;

    setRecommendations(
      randomOther ? [...topMatches, randomOther].slice(0, 3) : topMatches
    );
  }, [currentUser, jobs]);

  // 🆕 Open bid modal
  const openBidModal = (jobId) => {
    setSelectedJob(jobId);
    setShowBidModal(true);
  };

  // 🆕 Handle bid submission
  const handleBidSubmit = async (bidAmount) => {
    try {
      await api.post(`/jobs/${selectedJob}/bid`, { bidAmount });
      const res = await api.get("/auth/me", { withCredentials: true });
      setCurrentUser(res.data.user);
      if (setUser) setUser(res.data.user);
      setShowBidModal(false);
      toast.success("✅ Bid placed successfully!");
    } catch (err) {
      console.error("Error bidding:", err.response?.data || err.message);
      toast.error(`Failed to place bid: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle pass
  const handlePass = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/pass`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.info("🚫 You passed this job.");
    } catch (err) {
      console.error("Error passing job:", err.response?.data || err.message);
      toast.error(`Failed to pass job: ${err.response?.data?.message || err.message}`);
    }
  };

  // 🆕 Handle save/unsave job
  const handleSaveJob = async (jobId) => {
    try {
      const isSaved = currentUser?.savedJobs?.includes(jobId);
      if (isSaved) {
        await api.delete(`/users/unsave-job/${jobId}`);
        setCurrentUser((prev) => ({
          ...prev,
          savedJobs: prev.savedJobs.filter((id) => id !== jobId),
        }));
        toast.info("❌ Removed from Saved Jobs");
      } else {
        await api.post(`/users/save-job/${jobId}`);
        setCurrentUser((prev) => ({
          ...prev,
          savedJobs: [...(prev.savedJobs || []), jobId],
        }));
        toast.success("⭐ Job saved!");
      }
    } catch (err) {
      console.error("Error saving job:", err.response?.data || err.message);
      toast.error("Failed to save job. Please try again.");
    }
  };

  // Calculate time left
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
    if (hours > 0) return `${hours}h left`;
    if (minutes > 0) return `${minutes}m left`;
    return "Less than a minute left";
  };

  // Filters
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  const recommendedJobs =
    currentUser?.skills?.length > 0
      ? filteredJobs
          .map((job) => {
            if (!job.skills?.length) return null;
            const userSkills = currentUser.skills.map((s) =>
              s.toLowerCase().trim().replace(/[^a-z0-9]/g, "")
            );
            const jobSkills = job.skills.map((s) =>
              s.toLowerCase().trim().replace(/[^a-z0-9]/g, "")
            );
            const matchCount = jobSkills.filter((js) => userSkills.includes(js)).length;
            return matchCount > 0 ? { ...job, matchCount } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.matchCount - a.matchCount)
      : [];

  const allJobs = filteredJobs.filter((job) => !recommendedJobs.includes(job));

  const sortJobs = (arr) => {
    if (sortOrder === "high") return [...arr].sort((a, b) => b.price - a.price);
    if (sortOrder === "low") return [...arr].sort((a, b) => a.price - b.price);
    return arr;
  };

  const sortedRecommendedJobs = sortJobs(recommendedJobs);
  const sortedAllJobs = sortJobs(allJobs);

  // Render job card
  const renderJobCard = (job) => (
    <li key={job._id} className="job-card">
      <span className="job-time">{timeLeft(job.deadline)}</span>
      <h3>{job.title}</h3>
      <p>{job.description}</p>
      <p>
        <strong>Category:</strong> {job.category}
      </p>
      <p>
        <strong>Skills:</strong>{" "}
        {job.skills && job.skills.length > 0 ? job.skills.join(", ") : "None"}
      </p>
      <p>
        <strong>Pay:</strong> ₹{job.price}
      </p>
      <p>
        <strong>Deadline:</strong>{" "}
        {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
      </p>
      <p>
        <strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}
      </p>

      <div className="job-actions">
        {/* 🆕 Save / Unsave button */}
        <button onClick={() => handleSaveJob(job._id)}>
          {currentUser?.savedJobs?.includes(job._id) ? "★ Saved" : "☆ Save"}
        </button>

        {/* Existing buttons */}
        <button onClick={() => openBidModal(job._id)}>Place Bid</button>
        <button onClick={() => handlePass(job._id)}>Pass</button>
      </div>
    </li>
  );

  return (
    <div className="jobs-list" style={{ position: "relative" }}>
      {/* Search & Filters */}
      <div className="jobs-filters" style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);

            if (value.trim() === "") {
              setSuggestions([]);
              setShowDropdown(true);
            } else {
              const matches = jobs.filter(
                (job) =>
                  job.title.toLowerCase().includes(value.toLowerCase()) ||
                  job.category?.toLowerCase().includes(value.toLowerCase())
              );
              setSuggestions(matches.slice(0, 5));
              setShowDropdown(true);
            }
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="nav-search"
          ref={dropdownRef}
        />

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "38px",
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "6px",
              width: "350px",
              zIndex: 1000,
              color: "#000",
            }}
          >
            {search.trim() === "" && recommendations.length > 0 && (
              <>
                <p style={{ fontWeight: "bold", color: "#000" }}>
                  Recommended for you:
                </p>
                {recommendations.map((job) => (
                  <div
                    key={job._id}
                    onMouseDown={() => {
                      setSearch(job.title);
                      setShowDropdown(false);
                    }}
                    style={{ padding: "4px 0", cursor: "pointer", color: "#000" }}
                  >
                    {job.title} — {job.category}
                  </div>
                ))}
              </>
            )}
            {search.trim() !== "" && suggestions.length > 0 && (
              <>
                <p style={{ fontWeight: "bold", color: "#000" }}>Matching jobs:</p>
                {suggestions.map((job) => (
                  <div
                    key={job._id}
                    onMouseDown={() => {
                      setSearch(job.title);
                      setShowDropdown(false);
                    }}
                    style={{ padding: "4px 0", cursor: "pointer", color: "#000" }}
                  >
                    {job.title} — {job.category}
                  </div>
                ))}
              </>
            )}
            {search.trim() !== "" && suggestions.length === 0 && (
              <p style={{ color: "#000" }}>No matches found.</p>
            )}
          </div>
        )}

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="nav-filter"
        >
          <option value="">All Roles</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="sort-container">
        <label>Sort by Price: </label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="">Default</option>
          <option value="high">High to Low</option>
          <option value="low">Low to High</option>
        </select>
      </div>

   

      <h2>Recommended Jobs</h2>
      {sortedRecommendedJobs.length > 0 ? (
        <ul>{sortedRecommendedJobs.map(renderJobCard)}</ul>
      ) : (
        <p className="no-jobs-msg">No recommended jobs based on your skills.</p>
      )}

      <h2>All Jobs</h2>
      {sortedAllJobs.length > 0 ? (
        <ul>{sortedAllJobs.map(renderJobCard)}</ul>
      ) : (
        <p className="no-jobs-msg">No other jobs available right now.</p>
      )}

      {/* 🆕 Bid modal */}
      {showBidModal && (
        <BidModel
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
}
