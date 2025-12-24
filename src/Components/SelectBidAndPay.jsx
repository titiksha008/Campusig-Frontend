// // src/components/SelectBidAndPay.jsx
// import React, { useState } from "react";
// import { selectWinningBid, getJobById } from "../services/jobs";

// /**
//  * Props:
//  * - jobId (string, required)
//  * - bidId (string, required)
//  * - onPaid?: (updatedJob) => void
//  * - label?: string  // default "Select Bid & Pay" (use "Pay Now" if already accepted)
//  * - className?: string
//  * - prefill?: { name?: string, email?: string, contact?: string }
//  */
// export default function SelectBidAndPay({
//   jobId,
//   bidId,
//   onPaid,
//   label = "Select Bid & Pay",
//   className = "btn-primary",
//   prefill = {}
// }) {
//   const [loading, setLoading] = useState(false);

//   const handleClick = async () => {
//     try {
//       setLoading(true);

//       // Ask backend to accept (if needed) and create/return a Razorpay Order
//       const { data } = await selectWinningBid(jobId, bidId);
//       const { payment } = data || {};

//       if (!payment?.orderId || !payment?.keyId || !payment?.amount) {
//         alert(data?.message || "Payment order was not created.");
//         return;
//       }
//       if (!window.Razorpay) {
//         alert("Razorpay SDK not loaded. Refresh the page.");
//         return;
//       }

//       const rzp = new window.Razorpay({
//         key: payment.keyId,
//         order_id: payment.orderId,
//         amount: payment.amount,            // in paise
//         currency: payment.currency || "INR",
//         name: "CampusGig",
//         description: "Secure Escrow Payment",
//         notes: { jobId: payment.jobId || jobId, bidId },
//         prefill,                            // optional prefill from props
//         theme: { color: "#2563eb" },
//         handler: async function () {
//           // Success — webhook will update DB to PAID; lightly refresh UI
//           setTimeout(async () => {
//             try {
//               const refreshed = await getJobById(payment.jobId || jobId);
//               onPaid?.(refreshed.data);
//             } catch (e) {
//               console.error("Refresh after payment failed:", e);
//             }
//           }, 2500);
//           alert("Payment successful! Awaiting confirmation…");
//         },
//         modal: {
//           ondismiss: () => console.log("Checkout closed by user"),
//         },
//       });

//       // 🔎 show detailed reason when Razorpay says it failed
//       rzp.on("payment.failed", function (resp) {
//         const err = resp?.error || {};
//         console.error("Razorpay payment.failed:", resp);
//         alert(
//           `Payment Failed\n` +
//           `Code: ${err.code || "-" }\n` +
//           `Desc: ${err.description || "-" }\n` +
//           `Step: ${err.step || "-" }\n` +
//           `Reason: ${err.reason || "-" }`
//         );
//       });

//       rzp.open();
//     } catch (err) {
//       console.error("Select&Pay error:", err);
//       alert(
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         err?.message ||
//         "Failed to start payment"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button className={className} onClick={handleClick} disabled={loading}>
//       {loading ? "Processing…" : label}
//     </button>
//   );
// }


// SelectBidAndPay.jsx
import React, { useState } from "react";
import { selectWinningBid, getJobById } from "../services/jobs";

export default function SelectBidAndPay({ jobId, bidId, onPaid, label="Select Bid & Pay", className="btn-primary" }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const { data } = await selectWinningBid(jobId, bidId);
      const { payment } = data || {};

      if (!payment?.orderId || !payment?.keyId || !payment?.amount) {
        alert(data?.message || "Payment order was not created.");
        return;
      }
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Refresh the page.");
        return;
      }

      const rzp = new window.Razorpay({
        key: payment.keyId,
        order_id: payment.orderId,
        amount: payment.amount,
        currency: payment.currency || "INR",
        name: "CampusGig",
        description: "Secure Escrow Payment",
        handler: async () => {
          setTimeout(async () => {
            try {
              const refreshed = await getJobById(payment.jobId || jobId);
              onPaid?.(refreshed.data);
            } catch (e) { console.error("Refresh after payment:", e); }
          }, 2500);
          alert("Payment initiated. Awaiting confirmation…");
        },
        modal: {
          ondismiss: () => console.log("Checkout closed"),
        },
        theme: { color: "#2563eb" },
      });

      // >>> Show exact failure reason
      rzp.on("payment.failed", (resp) => {
        console.error("Razorpay payment.failed:", resp);
        const err = resp?.error || {};
        alert(
          `Payment Failed\n` +
          `code: ${err.code || "-"}\n` +
          `reason: ${err.reason || "-"}\n` +
          `description: ${err.description || "-"}`
        );
      });

      rzp.open();
    } catch (err) {
      console.error("Select&Pay error:", err);
      alert(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to start payment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={className} onClick={handleClick} disabled={loading}>
      {loading ? "Processing…" : label}
    </button>
  );
}