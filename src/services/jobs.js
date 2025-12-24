import api from './api'; // adjust if your api.js file is named differently or located elsewhere

export const getJobs = (search = '', role = '') => {
  return api.get('/jobs', { params: { search, role } });
};

export const acceptJob = (id) => {
  return api.put(`/jobs/${id}/accept`);
};

export const getAcceptedJobs = () => {
  return api.get('/jobs/accepted');
};


// ---------------- 🟢 new endpoints for payments ----------------

// 1️⃣ Poster selects winning bid — creates Razorpay Order
export const selectWinningBid = (jobId, bidId) => {
  return api.put(`/jobs/${jobId}/select/${bidId}`);
};

// 2️⃣ Poster completes payout (manual UTR entry for now)
export const completePayment = (jobId, payoutRef) => {
  return api.post(`/jobs/${jobId}/complete-payment`, { payoutRef });
};

// 3️⃣ Fetch single job (used to refresh status after payment)
export const getJobById = (id) => {
  return api.get(`/jobs/${id}`);
};