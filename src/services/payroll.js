import API from "./api";

// Get current payroll
export const getCurrentPayroll = async () => {
  const res = await API.get("/payroll/current");
  return res.data;
};

// Get payroll by ID
export const getPayrollById = async (payrollId) => {
  const res = await API.get(`/payroll/${payrollId}`);
  return res.data;
};

// Calculate payroll
export const calculatePayroll = async (payrollId) => {
  const res = await API.post(`/payroll/${payrollId}/calculate`);
  return res.data;
};

// Payroll approval
export const payrollApproval = async (payrollId) => {
  const res = await API.post(`/payroll/${payrollId}/approve`);
  return res.data;
};

// Process payroll/payment
export const processPayroll = async (
  payrollId,
  useFinancing = false,
  preferredGateway = "flutterwave",
) => {
  const res = await API.post(`/payroll/${payrollId}/process`, {
    useFinancing,
    preferredGateway,
  });

  return res.data;
};

//Reset a stuck / failed payroll back to draft

export const resetPayroll = async (payrollId) => {
  const res = await API.post(`/payroll/${payrollId}/reset`);
  return res.data;
};

// Get all payment transactions for the company (with optional filters)
export const getAllTransactions = async (params = {}) => {
  const res = await API.get("/payroll/transactions", { params });
  return res.data;
};

// Get audit log activity for a specific module (e.g. "payroll")
export const getAuditLogsByModule = async (module, params = {}) => {
  const res = await API.get(`/audit-logs/module/${module}`, { params });
  return res.data;
};

// Get a specific employee's payslip for a given payroll run
export const getEmployeePayslip = async (payrollId, employeeId) => {
  const res = await API.get(`/payroll/${payrollId}/payslip/${employeeId}`);
  return res.data;
};

// Tax breakdown
export const getTaxBreakdown = async (annualGross) => {
  const res = await API.post("/payroll/tax-breakdown", {
    annualGross,
  });

  return res.data;
};
