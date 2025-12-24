import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify"; // keep toast for future user actions if needed
import "./MyBids.css";

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all"); // filter
  const [sortByAmount, setSortByAmount] = useState(""); // sort

  useEffect(() => {
    async function fetchBids() {
      try {
        const { data } = await api.get("/jobs/my-bids");
        setBids(data.bids);
        setTotalEarnings(data.totalEarnings);
        // ✅ Removed toast on initial load
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bids"); // keep error toast
      }
    }
    fetchBids();
  }, []);

  // Apply filter and sort whenever bids, filterStatus, or sortByAmount changes
  useEffect(() => {
    let updated = [...bids];

    // Filter by status
    if (filterStatus !== "all") {
      updated = updated.filter((b) => b.status === filterStatus);
    }

    // Sort by bidAmount
    if (sortByAmount === "asc") {
      updated.sort((a, b) => a.bidAmount - b.bidAmount);
    } else if (sortByAmount === "desc") {
      updated.sort((a, b) => b.bidAmount - a.bidAmount);
    }

    setFilteredBids(updated);
  }, [bids, filterStatus, sortByAmount]);

  return (
    <div className="my-bids-container">
      <h2>📋 My Bids</h2>
      <h3 className="total-earnings">Total Earnings: ₹{totalEarnings}</h3>

      {/* Filter & Sort Controls */}
      {bids.length > 0 && (
        <div className="filter-sort-controls">
          <label>
            Filter by Status:
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label>
            Sort by Amount:
            <select
              value={sortByAmount}
              onChange={(e) => setSortByAmount(e.target.value)}
            >
              <option value="">None</option>
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>
          </label>
        </div>
      )}

      {/* Bids Display */}
      {filteredBids.length === 0 ? (
        <p>No bids to display.</p>
      ) : (
        <div className="bids-list">
          {filteredBids.map((b) => (
            <div className="bid-card" key={b._id}>
              <h4>{b.job?.title}</h4>
              <p>
                <strong>Poster:</strong> {b.job?.postedBy?.name || "Unknown"}
              </p>
              <p>
                <strong>Bid Amount:</strong> ₹{b.bidAmount}
              </p>
              <p className={`status ${b.status}`}>
                Status: {b.status || "pending"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
