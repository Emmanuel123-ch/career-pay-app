import React, { useState, useEffect } from "react";

import {
  Users,
  Download,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Plus,
  CreditCard,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { getCurrentPayroll } from "../../services/payroll";
import { getCompanyStats } from "../../services/company";
import { motion } from "framer-motion";
import { exportToCSV } from "../../utils/exportCSV";

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const MetricCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between relative z-10">
      <div
        className={`p-3.5 rounded-2xl ${color} bg-opacity-10 text-${
          color.split("-")[1]
        }-600 group-hover:scale-110 transition-transform duration-500`}
      >
        <Icon size={20} />
      </div>

      <ArrowUpRight
        size={16}
        className="text-gray-300 group-hover:text-blue-500 transition-colors"
      />
    </div>

    <div className="mt-5 relative z-10">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
        {title}
      </p>

      <h3 className="text-2xl font-black text-gray-900 tracking-tight">
        {value}
      </h3>

      <p className="text-gray-400 text-[9px] mt-1.5 font-bold uppercase tracking-wider opacity-60">
        {subValue}
      </p>
    </div>

    <div
      className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}
    ></div>
  </div>
);

const CompanyDashboard = ({ user, setActivePage }) => {
  const [payrollData, setPayrollData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const [payroll, stats] = await Promise.all([
        getCurrentPayroll(),
        getCompanyStats(),
      ]);

      console.log("Dashboard payroll:", payroll);
      console.log("Dashboard stats:", stats);

      setPayrollData(payroll?.data || null);
      setStatsData(stats?.data || stats || null);

      setDepartments(stats?.data?.departments || stats?.departments || []);
    } catch (error) {
      console.error(
        "Failed to fetch dashboard data:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportReport = () => {
    const rows = [
      {
        Metric: "Total Employees",
        Value: totalEmployees,
      },
      {
        Metric: "Active Employees",
        Value: activeEmployees,
      },
      {
        Metric: "Total Payroll (Gross)",
        Value: totalGross,
      },
      {
        Metric: "Total Deductions",
        Value: totalDeductions,
      },
      {
        Metric: "Net Payroll",
        Value: totalNet,
      },
      {
        Metric: "Current Payroll Status",
        Value: payrollStatus,
      },
      ...normalizedDepartments.map((dept) => ({
        Metric: `Department: ${dept.name}`,
        Value: dept.count,
      })),
    ];

    exportToCSV(
      `company-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`,
      rows,
    );
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center max-w-md">
          <h2 className="text-xl font-black text-gray-900 mb-2">
            Dashboard unavailable
          </h2>

          <p className="text-sm text-red-500 mb-6">{error}</p>

          <button
            onClick={() => fetchData()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // REAL BACKEND VALUES
  // ==============================

  const totalEmployees = Number(statsData?.totalEmployees || 0);

  const activeEmployees = Number(
    statsData?.activeEmployees ?? statsData?.active ?? totalEmployees,
  );

  const totalGross = Number(payrollData?.summary?.totalGross || 0);

  const totalDeductions = Number(payrollData?.summary?.totalDeductions || 0);

  const totalNet = Number(payrollData?.summary?.totalNet || 0);

  const payrollStatus =
    payrollData?.status || payrollData?.payrollStatus || "No payroll";

  // Real percentages based on current payroll
  const payrollTotal = totalNet + totalDeductions;

  const netPercentage =
    payrollTotal > 0 ? Math.round((totalNet / payrollTotal) * 100) : 0;

  const deductionPercentage =
    payrollTotal > 0 ? Math.round((totalDeductions / payrollTotal) * 100) : 0;

  // Normalize department response
  const normalizedDepartments = departments
    .map((dept) => {
      if (typeof dept === "string") {
        return {
          name: dept,
          count: 0,
        };
      }

      return {
        name: dept?.name || dept?.department || dept?._id || "Unknown",
        count: Number(
          dept?.count ?? dept?.employeeCount ?? dept?.totalEmployees ?? 0,
        ),
      };
    })
    .filter((dept) => dept.name);

  const departmentTotal = normalizedDepartments.reduce(
    (total, dept) => total + dept.count,
    0,
  );

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto animate-fadeIn">
      {/* ==============================
          WELCOME SECTION
      ============================== */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Dashboard Overview
          </h1>

          <p className="text-gray-500 font-medium">
            Welcome back, {user?.firstName || "User"}. Here's your company's
            current performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white text-gray-700 px-5 py-4 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-4 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <Download size={18} />
            Export Report
          </button>

          <button
            onClick={() => setActivePage("payroll")}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            Run New Payroll
          </button>
        </div>
      </div>

      {/* ==============================
          PRIMARY METRICS
      ============================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard
          title="Total Employees"
          value={totalEmployees.toLocaleString()}
          subValue={`${activeEmployees} Active Workforce`}
          icon={Users}
          color="bg-blue-500"
        />

        <MetricCard
          title="Total Payroll"
          value={formatCurrency(totalGross)}
          subValue="Current Gross Liability"
          icon={CreditCard}
          color="bg-purple-500"
        />

        <MetricCard
          title="Total Deductions"
          value={formatCurrency(totalDeductions)}
          subValue="Current Payroll Deductions"
          icon={Zap}
          color="bg-orange-500"
        />

        <MetricCard
          title="Net Payroll"
          value={formatCurrency(totalNet)}
          subValue="Current Net Payable"
          icon={ShieldCheck}
          color="bg-green-500"
        />
      </div>

      {/* ==============================
          MAIN CONTENT
      ============================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ==============================
            CURRENT PAYROLL
        ============================== */}

        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  Current Payroll
                </h3>

                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                  Real-time payroll information
                </p>
              </div>

              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                {payrollStatus}
              </span>
            </div>

            {payrollData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Gross
                  </p>

                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {formatCurrency(totalGross)}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Deductions
                  </p>

                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {formatCurrency(totalDeductions)}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Net Payable
                  </p>

                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {formatCurrency(totalNet)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
                <CreditCard size={42} className="text-gray-200 mb-4" />

                <h4 className="font-black text-gray-700">
                  No Payroll Available
                </h4>

                <p className="text-sm text-gray-400 mt-2">
                  Create your first monthly payroll to see payroll data here.
                </p>

                <button
                  onClick={() => setActivePage("payroll")}
                  className="mt-5 flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest"
                >
                  Create Payroll
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==============================
            PAYROLL BREAKDOWN
        ============================== */}

        <div className="bg-[#0a1628] p-10 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-10">Payroll Breakdown</h3>

            <div className="relative flex justify-center py-6">
              <svg
                viewBox="0 0 32 32"
                className="w-48 h-48 transform -rotate-90"
              >
                {/* Net */}
                <circle
                  r="16"
                  cx="16"
                  cy="16"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="32"
                  strokeDasharray={`${netPercentage} 100`}
                />

                {/* Deductions */}
                <circle
                  r="16"
                  cx="16"
                  cy="16"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="32"
                  strokeDasharray={`${deductionPercentage} 100`}
                  strokeDashoffset={`-${netPercentage}`}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-[#0a1628] w-24 h-24 rounded-full flex flex-col items-center justify-center ring-4 ring-white/5">
                  <span className="text-xl font-black tracking-tight">
                    {formatCurrency(totalGross)}
                  </span>

                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">
                    Total Gross
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />

                  <span className="text-xs font-bold text-gray-400">
                    Net Salary
                  </span>
                </div>

                <span className="text-xs font-black text-white">
                  {netPercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />

                  <span className="text-xs font-bold text-gray-400">
                    Deductions
                  </span>
                </div>

                <span className="text-xs font-black text-white">
                  {deductionPercentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full"></div>
        </div>
      </div>

      {/* ==============================
          DEPARTMENT DISTRIBUTION
      ============================== */}

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              Department-wise Distribution
            </h3>

            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
              Staff allocation by department
            </p>
          </div>

          <button
            onClick={() => setActivePage("view-employees")}
            className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
          >
            Manage Teams
            <ArrowRight size={14} />
          </button>
        </div>

        {departments.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-gray-200 mb-4" />

            <p className="text-gray-400 font-medium">
              No department data available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10">
            {departments.map((dept, i) => {
              const percentage =
                departmentTotal > 0
                  ? Math.round((dept.count / departmentTotal) * 100)
                  : 0;

              const barColors = [
                "bg-blue-600",
                "bg-purple-500",
                "bg-orange-500",
                "bg-green-500",
                "bg-red-500",
                "bg-yellow-500",
              ];

              const barColor = barColors[i % barColors.length];

              return (
                <div
                  key={`${dept.department}-${i}`}
                  className="space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-6 rounded-full ${barColor}`} />

                      <span className="text-sm font-black text-gray-900">
                        {dept.department}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {dept.count} Staff
                    </span>
                  </div>

                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${percentage}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                      }}
                      className={`h-full ${barColor} rounded-full`}
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 font-bold">
                    {percentage}% of workforce
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
