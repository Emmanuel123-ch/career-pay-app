import React, { useState, useEffect } from "react";
import {
  PieChart as PieIcon,
  Users,
  Award,
  Calendar,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getEquityOverview,
  getAllEquityGrants,
  createEquityGrant,
} from "../../services/equity";
import { getCompanyEmployees } from "../../services/company";
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({ label, value, icon: Icon, bg, iconColor }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between relative z-10">
      <div
        className={`p-4 rounded-2xl ${bg} w-fit group-hover:scale-110 transition-transform duration-500`}
      >
        <Icon size={24} strokeWidth={2.5} className={iconColor} />
      </div>
    </div>
    <div className="mt-6 relative z-10">
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none focus:ring-2 focus:ring-[#1D4EFF] transition-all text-sm font-medium";

function IssueGrantModal({ employees, onClose, onIssued }) {
  const [form, setForm] = useState({
    employeeId: "",
    grantType: "stock_option",
    totalShares: "",
    strikePrice: "",
    currentFMV: "",
    grantDate: new Date().toISOString().slice(0, 10),
    vestingStartDate: new Date().toISOString().slice(0, 10),
    vestingPeriodMonths: 48,
    cliffMonths: 12,
    vestingFrequency: "monthly",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.totalShares || !form.vestingStartDate) {
      setError("Employee, total shares, and vesting start date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await createEquityGrant({
        employeeId: form.employeeId,
        grantType: form.grantType,
        totalShares: Number(form.totalShares),
        strikePrice: Number(form.strikePrice) || 0,
        currentFMV: Number(form.currentFMV) || 0,
        grantDate: form.grantDate,
        vestingStartDate: form.vestingStartDate,
        vestingPeriodMonths: Number(form.vestingPeriodMonths),
        cliffMonths: Number(form.cliffMonths),
        vestingFrequency: form.vestingFrequency,
      });
      if (res.success) {
        onIssued();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to issue grant. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900">Issue New Grant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Employee*
            </label>
            <select
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.user?.firstName} {emp.user?.lastName} — {emp.position}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Grant Type
            </label>
            <select
              name="grantType"
              value={form.grantType}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="stock_option">Stock Option</option>
              <option value="rsu">RSU</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Total Shares/Options*
            </label>
            <input
              type="number"
              min="1"
              name="totalShares"
              value={form.totalShares}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Strike Price (₦)
            </label>
            <input
              type="number"
              min="0"
              name="strikePrice"
              value={form.strikePrice}
              onChange={handleChange}
              placeholder="e.g. 10"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Current FMV (₦)
            </label>
            <input
              type="number"
              min="0"
              name="currentFMV"
              value={form.currentFMV}
              onChange={handleChange}
              placeholder="e.g. 50"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Grant Date
            </label>
            <input
              type="date"
              name="grantDate"
              value={form.grantDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Vesting Start Date*
            </label>
            <input
              type="date"
              name="vestingStartDate"
              value={form.vestingStartDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Vesting Period (months)
            </label>
            <input
              type="number"
              min="1"
              name="vestingPeriodMonths"
              value={form.vestingPeriodMonths}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Cliff (months)
            </label>
            <input
              type="number"
              min="0"
              name="cliffMonths"
              value={form.cliffMonths}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Vesting Frequency
            </label>
            <select
              name="vestingFrequency"
              value={form.vestingFrequency}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Defaults follow the standard 4-year vesting with a 1-year cliff —
          adjust if this grant uses different terms.
        </p>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1D4EFF] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Issue Grant"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ESOP() {
  const [overview, setOverview] = useState(null);
  const [grants, setGrants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [overviewRes, grantsRes, employeesRes] = await Promise.all([
        getEquityOverview(),
        getAllEquityGrants(),
        getCompanyEmployees(),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (grantsRes.success) setGrants(grantsRes.data);
      if (employeesRes.success) setEmployees(employeesRes.data);
    } catch (err) {
      console.error("Failed to load ESOP data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load equity data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Equity Data...
        </p>
      </div>
    );
  }

  const vestedPercent =
    overview?.totalSharesGranted > 0
      ? (
          (overview.totalSharesVested / overview.totalSharesGranted) *
          100
        ).toFixed(1)
      : "0.0";
  const unvestedPercent =
    overview?.totalSharesGranted > 0 ? (100 - vestedPercent).toFixed(1) : "0.0";

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Equity & ESOP
          </h1>
          <p className="text-gray-500 font-medium">
            Manage stock options, vesting schedules, and participant grants.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          Issue New Grant
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="Total Shares Granted"
          value={(overview?.totalSharesGranted || 0).toLocaleString()}
          icon={PieIcon}
          color="bg-blue-500"
        />
        <StatCard
          label="Total Vested"
          value={(overview?.totalSharesVested || 0).toLocaleString()}
          icon={Award}
          color="bg-purple-500"
        />
        <StatCard
          label="Active Participants"
          value={(overview?.totalEmployeesWithEquity || 0).toString()}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          label="Total Grants Issued"
          value={grants.length.toString()}
          icon={Calendar}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-[#0a1628] rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white">
              Equity Distribution
            </h3>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Vested vs Unvested
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative flex justify-center py-4">
            <svg viewBox="0 0 32 32" className="w-64 h-64 transform -rotate-90">
              <circle
                r="16"
                cx="16"
                cy="16"
                fill="transparent"
                stroke="#1D4EFF"
                strokeWidth="32"
                strokeDasharray={`${vestedPercent} 100`}
              />
              <circle
                r="16"
                cx="16"
                cy="16"
                fill="transparent"
                stroke="#A855F7"
                strokeWidth="32"
                strokeDasharray={`${unvestedPercent} 100`}
                strokeDashoffset={`-${vestedPercent}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-[#0a1628] w-28 h-28 rounded-full flex flex-col items-center justify-center ring-4 ring-white/5">
                <span className="text-white text-3xl font-black tracking-tight">
                  {vestedPercent}%
                </span>
                <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest mt-1">
                  Vested
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Vested
                  </span>
                </div>
                <span className="text-lg font-black text-white">
                  {(overview?.totalSharesVested || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${vestedPercent}%` }}
                  transition={{ duration: 1.5 }}
                  className="bg-blue-600 h-full"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Unvested
                  </span>
                </div>
                <span className="text-lg font-black text-white">
                  {(overview?.totalSharesUnvested || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unvestedPercent}%` }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                  className="bg-purple-500 h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-8">All Grants</h3>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {grants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">
                No equity grants issued yet.
              </p>
            ) : (
              grants.map((grant) => (
                <motion.div
                  key={grant._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs overflow-hidden">
                      <img
                        src={`https://ui-avatars.com/api/?name=${grant.employee?.user?.firstName}+${grant.employee?.user?.lastName}&background=random`}
                        alt=""
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 leading-none mb-1">
                        {grant.employee?.user?.firstName}{" "}
                        {grant.employee?.user?.lastName}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {grant.employee?.department || "N/A"} ·{" "}
                        {grant.grantType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">
                      {grant.totalShares.toLocaleString()} shares
                    </p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                      {grant.vestingProgress}% vested
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {showModal && (
        <IssueGrantModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onIssued={() => {
            setShowModal(false);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}
