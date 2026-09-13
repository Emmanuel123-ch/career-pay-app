import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Landmark,
  Info,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  getCurrentPayroll,
  getPayrollById,
  calculatePayroll,
  payrollApproval,
  processPayroll,
} from "../../services/payroll.js";

const GATEWAYS = [
  {
    id: "flutterwave",
    label: "Gateway A",
    name: "Flutterwave",
    status: "Active",
    statusColor: "bg-white/20 text-white",
    description: "Supports all banks, 2 min processing, Fee: ₦50/transfer",
    selectable: true,
  },
  {
    id: "monnify",
    label: "Gateway B",
    name: "Monnify",
    status: "Standby",
    statusColor: "bg-blue-100 text-blue-700",
    description: "Supports all banks, 3 min processing, Fee: ₦45/transfer",
    selectable: true,
  },
  {
    id: "coming-soon",
    label: "Gateway C",
    name: "More providers",
    status: "Coming Soon",
    statusColor: "bg-gray-200 text-gray-500",
    description: "Additional gateway options are on the way.",
    selectable: false,
  },
];

const ACTION_LABEL = {
  draft: "Calculate Payroll",
  calculated: "Approve Payroll",
  approved: "Process Payment",
};

export default function PaymentGateway({ payrollId, onBack }) {
  const [selected, setSelected] = useState("flutterwave");
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [processed, setProcessed] = useState(false);

  const fetchPayroll = async () => {
    try {
      const res = payrollId
        ? await getPayrollById(payrollId)
        : await getCurrentPayroll();
      setPayroll(res?.data || res || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payroll.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [payrollId]);

  const employeeCount =
    payroll?.summary?.totalEmployees ?? payroll?.payrollItems?.length ?? 0;
  const totalAmount = payroll?.summary?.totalNet ?? 0;
  const status = payroll?.status || "draft";

  const handleAction = async () => {
    if (!payroll?._id) return;
    setActionLoading(true);
    setError("");
    try {
      if (status === "draft") {
        await calculatePayroll(payroll._id);
      } else if (status === "calculated") {
        await payrollApproval(payroll._id);
      } else if (status === "approved") {
        const res = await processPayroll(payroll._id, false, selected);
        if (res.success) {
          setProcessed(true);
          return;
        }
      }
      await fetchPayroll();
    } catch (err) {
      setError(
        err.response?.data?.message || "Action failed. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Payroll...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Top bar */}
      <div className="bg-white rounded-b-3xl shadow-sm border border-gray-100 px-8 py-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-2"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-gray-900">
          Select Payment Gateway
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {payroll?.payrollPeriod?.month
            ? `${payroll.payrollPeriod.month}/${payroll.payrollPeriod.year} payroll run`
            : "Current payroll run"}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {processed ? (
          <div className="flex flex-col items-center text-center py-14 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-gray-600 font-medium max-w-sm">
              Payments are being disbursed via{" "}
              {GATEWAYS.find((g) => g.id === selected)?.name}. Track individual
              transaction status from the payroll transactions page.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-700 font-medium mt-6 mb-6">
              Choose which gateway processes this disbursement.{" "}
              <span className="font-bold">{employeeCount} employees</span> ·{" "}
              <span className="font-bold">₦{totalAmount.toLocaleString()}</span>{" "}
              total.
            </p>

            {status !== "approved" && (
              <div className="mb-6 flex items-center gap-2 bg-orange-50 text-orange-700 rounded-xl px-4 py-3 text-sm font-bold">
                <AlertTriangle size={16} />
                <span className="uppercase">{status}</span>. Click the button
                below to move it forward before you can process payment.
              </div>
            )}

            {/* Gateway cards */}
            <div className="space-y-4">
              {GATEWAYS.map((gw) => {
                const isSelected = selected === gw.id;
                return (
                  <button
                    key={gw.id}
                    type="button"
                    disabled={!gw.selectable}
                    onClick={() => gw.selectable && setSelected(gw.id)}
                    className={`w-full text-left rounded-2xl p-6 flex items-start gap-4 transition-all ${
                      !gw.selectable
                        ? "bg-gray-50 opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "bg-[#1D4EFF] shadow-lg shadow-blue-500/20"
                          : "bg-gray-100 hover:bg-gray-150"
                    }`}
                  >
                    <div
                      className={isSelected ? "text-white" : "text-gray-700"}
                    >
                      <Landmark size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3
                          className={`text-lg font-black ${isSelected ? "text-white" : "text-gray-900"}`}
                        >
                          {gw.label} — {gw.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${gw.statusColor}`}
                        >
                          {gw.status}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium mt-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}
                      >
                        {gw.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info banner */}
            <div className="mt-6 flex items-start gap-3 bg-[#0a1628] text-white rounded-2xl px-6 py-4">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">
                If a transfer fails, you can retry it through a different
                gateway from the confirmation screen — no need to restart the
                whole run.
              </p>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={onBack}
                className="text-gray-500 font-bold text-sm hover:text-gray-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading || !payroll?._id}
                className="flex items-center gap-2 bg-[#1D4EFF] hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  ACTION_LABEL[status] || "Continue"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
