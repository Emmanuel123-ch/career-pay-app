import API from "./api";

// Get company-wide equity overview (totals, breakdowns)
export const getEquityOverview = async () => {
  const res = await API.get("/equity/overview");
  return res.data;
};

// Get all equity grants (with vesting progress calculated)
export const getAllEquityGrants = async () => {
  const res = await API.get("/equity/grants");
  return res.data;
};

// Issue a new equity grant to an employee
export const createEquityGrant = async (data) => {
  const res = await API.post("/equity/grants", data);
  return res.data;
};

// Process vesting for all eligible grants (moves vested shares forward)
export const processVesting = async () => {
  const res = await API.post("/equity/process-vesting");
  return res.data;
};
