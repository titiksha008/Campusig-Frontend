// frontend/pages/AdminDashboard/AdminUserDetails.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [jobsPosted, setJobsPosted] = useState([]);
    const [jobsAccepted, setJobsAccepted] = useState([]);
    const [jobsCompleted, setJobsCompleted] = useState([]);
    const [openJob, setOpenJob] = useState(null);

    const toggleJob = (jobId) => {
        setOpenJob(openJob === jobId ? null : jobId);
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userRes = await axios.get(
                    `http://localhost:5000/api/admin/user/${id}`,
                    { withCredentials: true }
                );

                const jobsRes = await axios.get(
                    `http://localhost:5000/api/admin/user/${id}/jobs`,
                    { withCredentials: true }
                );

                setUser(userRes.data.user);
                setJobsPosted(jobsRes.data.posted);
                setJobsAccepted(jobsRes.data.accepted);
                setJobsCompleted(jobsRes.data.completed);

            } catch (err) {
                console.error("Failed:", err);
            }
        };

        fetchUserDetails();
    }, [id]);

    if (!user) return <p className="loading">Loading user...</p>;

    return (
        <div className="admin-user-details-container">

            <h1 className="dashboard-title">{user.name}'s Details</h1>

            <button className="back-btn" onClick={() => navigate(-1)}>
                ⬅ Back
            </button>

            {/* USER INFO */}
            <div className="detail-section">
                <h2>User Info</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            {/* GRID LAYOUT */}
            <div className="details-grid">

                {/* Jobs Posted */}
                <div className="detail-section">
                    <h2>Jobs Posted</h2>

                    {jobsPosted.length === 0 ? (
                        <p>No jobs posted</p>
                    ) : (
                        jobsPosted.map(job => (
                            <div key={job._id} className="job-accordion">
                                <div
                                    className="job-item"
                                    onClick={() => toggleJob(job._id)}
                                >
                                    {job.title}
                                </div>

                                {openJob === job._id && (
                                    <div className="job-details">
                                        <p><strong>Description:</strong> {job.description}</p>
                                        <p><strong>Category:</strong> {job.category}</p>
                                        <p><strong>Status:</strong> {job.status}</p>
                                        <p><strong>Created:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                                        <p>
                                            <strong>Assigned To:</strong>{" "}
                                            {job.assignedTo?.name || "Not Assigned"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Jobs Accepted */}
                <div className="detail-section">
                    <h2>Jobs Accepted</h2>

                    {jobsAccepted.length === 0 ? (
                        <p>No jobs accepted</p>
                    ) : (
                        jobsAccepted.map(job => (
                            <div key={job._id} className="job-accordion">
                                <div
                                    className="job-item"
                                    onClick={() => toggleJob(job._id)}
                                >
                                    {job.title}
                                </div>

                                {openJob === job._id && (
                                    <div className="job-details">
                                        <p><strong>Description:</strong> {job.description}</p>
                                        <p><strong>Category:</strong> {job.category}</p>
                                        <p><strong>Status:</strong> {job.status}</p>
                                        <p><strong>Created:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                                        <p>
                                            <strong>Job Posted By:</strong>{" "}
                                            {job.postedBy?.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Jobs Completed */}
                <div className="detail-section details-grid-full">
                    <h2>Jobs Completed</h2>

                    {jobsCompleted.length === 0 ? (
                        <p>No jobs completed</p>
                    ) : (
                        jobsCompleted.map(job => (
                            <div key={job._id} className="job-accordion">
                                <div
                                    className="job-item"
                                    onClick={() => toggleJob(job._id)}
                                >
                                    {job.title}
                                </div>

                                {openJob === job._id && (
                                    <div className="job-details">
                                        <p><strong>Description:</strong> {job.description}</p>
                                        <p><strong>Category:</strong> {job.category}</p>
                                        <p><strong>Status:</strong> {job.status}</p>
                                        <p><strong>Completed:</strong> {new Date(job.updatedAt).toLocaleDateString()}</p>
                                        <p>
                                            <strong>Job Posted By:</strong>{" "}
                                            {job.postedBy?.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminUserDetails;
