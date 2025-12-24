import React from "react";
import "./ProfileOverview.css"; // optional for styling

export default function ProfileOverview({ user, jobs }) {
  if (!user) return null;

  const totalJobs = jobs.length;
  const urgentJobs = jobs.filter(job => new Date(job.deadline) < new Date()).length;

  return (
    <div className="profile-overview">
      <img src={user.profilePic || "/default-avatar.png"} alt="Profile" className="avatar" />
      <h3>{user.name}</h3>
      <p>{user.branch || "Branch"} | {user.college}</p>
      
      <div className="overview-stats">
        <p>Jobs Posted: {user.jobsPosted}</p>
        <p>Jobs Accepted: {user.jobsAccepted}</p>
        <p>Urgent Jobs: {urgentJobs}</p>
        <p>Total Earnings: ₹{user.earnings}</p>
      </div>
    </div>
  );
}