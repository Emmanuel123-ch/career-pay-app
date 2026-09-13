import API from "./api";

// Apply for payroll financing
export const applyForFinancing = async (data) => {
  const res = await API.post("/financing/apply", data);
  return res.data;
};

// Get all financing applications for the company
export const getCompanyFinancing = async (params = {}) => {
  const res = await API.get("/financing", { params });
  return res.data;
};

// Get a single financing application by ID
export const getFinancingById = async (id) => {
  const res = await API.get(`/financing/${id}`);
  return res.data;
};

// Review a financing application (approve/reject) — manual override for under_review cases
export const reviewFinancing = async (id, data) => {
  const res = await API.put(`/financing/${id}/review`, data);
  return res.data;
};

// Disburse an approved financing application
export const disburseFinancing = async (id, data = {}) => {
  const res = await API.post(`/financing/${id}/disburse`, data);
  return res.data;
};

// Make a repayment on an active loan
export const makeRepayment = async (id, data) => {
  const res = await API.post(`/financing/${id}/repayment`, data);
  return res.data;
};

// Get financing statistics for the dashboard
export const getFinancingStats = async () => {
  const res = await API.get("/financing/stats");
  return res.data;
};
