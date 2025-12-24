import { useState } from "react";
import { completePayment } from "../services/jobsApi";

export default function CompletePaymentButton({ jobId, token }) {
  const [payoutRef, setPayoutRef] = useState("");
  const [loading, setLoading] = useState(false);

  const onComplete = async () => {
    try {
      setLoading(true);
      await completePayment(jobId, payoutRef, token);
      alert("Marked completed & payout recorded");
      setPayoutRef("");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        placeholder="Payout reference (UTR / note)"
        value={payoutRef}
        onChange={(e) => setPayoutRef(e.target.value)}
      />
      <button onClick={onComplete} disabled={loading}>
        {loading ? "Saving…" : "Complete & Release"}
      </button>
    </div>
  );
}