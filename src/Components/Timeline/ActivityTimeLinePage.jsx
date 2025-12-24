// ActivityTimelinePage.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api"; // adjust import based on your project structure
import "./Timeline.css";

const ActivityTimelinePage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/jobs/activities/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.activities || [];

        const formatted = data.map((a) => ({
          ...a,
          userName: a.user?.name || "Unknown User",
          jobName: a.jobName || a.job?.title || "Untitled Job",
          date: new Date(a.createdAt).toLocaleString(),
          type:
            a.action === "posted"
              ? "green"
              : a.action === "accepted"
              ? "blue"
              : "purple",
        }));

        setActivities(formatted);
      } catch (err) {
        console.error("Error fetching all activities:", err);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="timeline-container" style={{ maxWidth: "800px" }}>
      <h2 className="timeline-heading">All Activities</h2>
      <div className="timeline">
        {activities.length === 0 ? (
          <p className="no-activity">No activities found.</p>
        ) : (
          activities.map((item, index) => (
            <div className="timeline-item" key={index}>
              <div className={`dot ${item.type}`}></div>
              <div className="content">
                <h3>{item.action}</h3>
                <p>
                  {item.jobName} • on {item.date}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTimelinePage;
