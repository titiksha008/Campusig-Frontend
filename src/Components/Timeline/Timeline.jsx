// Timeline.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Timeline.css";

const Timeline = ({ activities = [] }) => {
  const navigate = useNavigate();
  const visibleActivities = activities.slice(0, 3);

  return (
    <div className="timeline-container">
      <h2 className="timeline-heading">Recent Activity</h2>
      <div className="timeline">
        {visibleActivities.length === 0 ? (
          <p className="no-activity">No activity yet.</p>
        ) : (
          visibleActivities.map((item, index) => (
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

      {/* ✅ If there are more than 3 activities, show navigation button */}
      {activities.length > 3 && (
        <button
          className="view-more-btn"
          onClick={() => navigate("/activities")}
        >
          View All Activities →
        </button>
      )}
    </div>
  );
};

export default Timeline;
