// src/pages/JobBids.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { selectWinningBid, completePayment } from "../services/jobs";
import "./AppStyles.css";
import axios from "axios";
import { toast } from "react-toastify";  // ✅ Toastify added

export default function JobBids() {
  const { jobId } = useParams();
  const [bids, setBids] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payoutRef, setPayoutRef] = useState("");
  const navigate = useNavigate();

  // Fetch job + bids
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const jobRes = await api.get(`/jobs/my`);
        const currentJob = jobRes.data.find((j) => j._id === jobId);
        setJob(currentJob);

        const res = await api.get(`/jobs/${jobId}/bids`);
        setBids(res.data);
      } catch (err) {
        console.error("Error fetching bids:", err.response?.data || err.message);
        toast.error("Failed to load bids");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [jobId]);

  // Select Bid
  const handleSelectBid = async (bidId) => {
    try {
      await selectWinningBid(jobId, bidId);

      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data);

      const bidsRes = await api.get(`/jobs/${jobId}/bids`);
      setBids(bidsRes.data);

      toast.success("Bid selected successfully!");
    } catch (err) {
      console.error("Error selecting bid:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Failed to select bid");
    }
  };

  // Pay Now
  const handlePayNow = async (bidId) => {
    try {
      setPaying(true);

      const { data } = await axios.post(
        `http://localhost:5000/api/payment/jobs/${jobId}/create-payment`,
        { bidId },
        { withCredentials: true }
      );

      const { payment } = data;

      if (!payment) {
        toast.error("Payment order could not be created");
        return;
      }

      const rzp = new window.Razorpay({
        key: payment.keyId,
        order_id: payment.orderId,
        amount: payment.amount,
        currency: payment.currency || "INR",
        name: "CampusGig",
        description: "Escrow charge",
        handler: async () => {
          toast.info("Payment processing…");

          const res = await api.get(`/jobs/${jobId}`);
          setJob(res.data);

          const bidsRes = await api.get(`/jobs/${jobId}/bids`);
          setBids(bidsRes.data);

          toast.success("Payment completed!");
        },
        theme: { color: "#2563eb" },
      });

      rzp.on("payment.failed", (resp) => {
        console.error("Payment failed:", resp);
        toast.error(`Payment Failed: ${resp.error?.description || "Unknown error"}`);
      });

      rzp.open();
    } catch (err) {
      console.error("Error starting payment:", err);
      toast.error(err?.response?.data?.message || "Failed to start payment");
    } finally {
      setPaying(false);
    }
  };

  // Complete + Release
  const handleCompleteAndRelease = async () => {
    try {
      if (!payoutRef.trim()) {
        toast.warning("No payout reference entered — proceeding anyway.");
      }

      await completePayment(jobId, payoutRef.trim());
      setPayoutRef("");

      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data);

      toast.success("Job marked completed & payout released!");
    } catch (err) {
      console.error("Complete-payment error:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Failed to complete and release");
    }
  };

  if (loading) return <p>Loading bids...</p>;

  const isPaid = job?.payment?.status === "PAID";
  const isCompleted = job?.status === "COMPLETED";

  return (
    <div className="jobs-list">
      <h2>Job Bids</h2>

      {job && (
        <div className="job-card">
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p><strong>Budget:</strong> ₹{job.price}</p>
          <p>
            <strong>Deadline:</strong>{" "}
            {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
          </p>
          <p><strong>Status:</strong> {job.status}</p>
          <p>
            <strong>Payment:</strong>{" "}
            {job.payment?.status || "NONE"}{" "}
            {job.payment?.heldAmount ? `(₹${(job.payment.heldAmount / 100).toFixed(2)})` : ""}
          </p>
        </div>
      )}

      <h3 style={{ marginTop: "1.5rem" }}>Bids</h3>

      {bids.length === 0 ? (
        <p>No bids yet for this job.</p>
      ) : (
        <ul>
          {bids.map((bid) => (
            <li key={bid._id} className="job-card">
              <p>
                <strong>Student:</strong> {bid.student?.name} ({bid.student?.email})
              </p>
              <p><strong>Bid Amount:</strong> ₹{bid.bidAmount}</p>
              <p>
                <strong>Status:</strong>{" "}
                {bid.status === "pending" ? "⏳ Pending" : bid.status}
              </p>

              <div className="job-buttons">
                <button
                  className="btn-portfolio"
                  onClick={() => navigate(`/portfolio/${bid.student?._id}`)}
                >
                  View Portfolio
                </button>

                {/* Select Bid Button */}
                {bid.status === "pending" && !isPaid && (
                  <button
                    className="btn-accept"
                    disabled={paying}
                    onClick={() => handleSelectBid(bid._id)}
                  >
                    {paying ? "Processing…" : "Select Bid"}
                  </button>
                )}

                {/* Pay Now */}
                {bid.status === "accepted" && !isPaid && (
                  <button
                    className="btn-accept"
                    disabled={paying}
                    onClick={() => handlePayNow(bid._id)}
                  >
                    {paying ? "Processing…" : "Pay Now"}
                  </button>
                )}

                {/* Paid Status */}
                {bid.status === "accepted" && isPaid && (
                  <span style={{ color: "green", fontWeight: "bold", marginLeft: 12 }}>
                    ✅ Selected (Paid)
                  </span>
                )}

                {/* Rejected */}
                {bid.status === "rejected" && (
                  <span style={{ color: "red", fontWeight: "bold" }}>❌ Rejected</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Release Payout */}
      {isPaid && !isCompleted && (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Release payout</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Payout reference (UTR / Note)"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
            />
            <button className="btn-primary" onClick={handleCompleteAndRelease}>
              Complete & Release
            </button>
          </div>
        </>
      )}

      {isCompleted && (
        <div style={{ marginTop: "1rem", color: "green", fontWeight: "bold" }}>
          ✅ Job completed & payout recorded
        </div>
      )}
    </div>
  );
}
