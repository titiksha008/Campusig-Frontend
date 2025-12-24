// AdminUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          withCredentials: true,
        });

        const fetchedUsers = Array.isArray(res.data.users) ? res.data.users : [];
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err.response || err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (startDate) {
      filtered = filtered.filter(
        (u) => new Date(u.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (u) => new Date(u.createdAt) <= new Date(endDate)
      );
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredUsers(filtered);
  }, [startDate, endDate, users, sortOrder]);

  if (loading) return <p className="loading">Loading users...</p>;

  const totalUsers = filteredUsers.length;
  const adminUsers = filteredUsers.filter((u) => u.role === "admin").length;

  return (
    <div className="admin-users-container">
      <h1 className="dashboard-title">Admin Users</h1>

      {/* Filters */}
      <div className="filter-container">
        <label>Joined From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label>Sort:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="">None</option>
          <option value="asc">Name A → Z</option>
          <option value="desc">Name Z → A</option>
        </select>
      </div>

      {/* Summary Tiles */}
      <div className="dashboard-tiles">
        <div className="tile total">Total Users: {totalUsers}</div>
        <div className="tile admin">Admins: {adminUsers}</div>
      </div>

      {/* Accordion */}
      <div className="accordion-container">
        {filteredUsers.map((user) => (
          <div key={user._id} className="accordion-card">
            <div className="accordion-header">
              <span>{user.name}</span>
              <button
                className="details-btn"
                onClick={() =>
                  setExpandedId(expandedId === user._id ? null : user._id)
                }
              >
                {expandedId === user._id ? "Hide Details" : "View Details"}
              </button>
            </div>

            {expandedId === user._id && (
              <div className="accordion-body">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>

                {user.skills && (
                  <p>
                    <strong>Skills:</strong> {user.skills.join(", ")}
                  </p>
                )}

                <button
                  className="view-jobs-btn"
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                >
                  View User Jobs →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
