// src/components/BidModel.jsx
import React, { useState } from "react";
import "./BidModel.css";

export default function BidModal({ isOpen, onClose, onSubmit }) {
  const [bid, setBid] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!bid || isNaN(bid)) {
      alert("Please enter a valid bid amount.");
      return;
    }
    onSubmit(bid);
    setBid("");
  };

  return (
    <div className="bid-overlay">
      <div className="bid-modal">
        <h3>💰 Place Your Bid</h3>
        <p>Enter your bid amount below</p>
        <input
          type="number"
          value={bid}
          onChange={(e) => setBid(e.target.value)}
          placeholder="Enter amount (₹)"
          className="bid-input"
        />
        <div className="bid-actions">
          <button onClick={handleSubmit} className="btn-primary">Submit Bid</button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}
