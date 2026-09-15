import React, { useState, useEffect } from "react";
import { Clock, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getCurrentPayroll, correctPayrollItem } from "../../services/payroll";

export default function Overtime({ setActivePage }) {
  const [payroll, setPayroll] = useState(null);
  const [overtimeInputs, setOvertimeInputs] = useState({});
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await getCurrentPayroll();
      if (res.success) {
        setPayroll(res.data);
        const initial = {};
        (res.data.payrollItems || []).forEach((item) => {
          initial[item.employee?._id] = item.additions?.overtime || 0;
        });
        setOvertimeInputs(initial);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payroll.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const canEdit =
    payroll?.status === "draft" || payroll?.status === "calculated";

  const handleSave = async (employeeId) => {
    setSaving(employeeId);
    setError("");
    setSuccess("");
    try {
      const overtime = Number(overtimeInputs[employeeId]) || 0;
      const res = await correctPayrollItem(payroll._id, employeeId, {
        overtime,
      });
      if (res.success) {
        setSuccess(
          "Overtime saved. Payroll reset to draft — click Run Payroll again to include it.",
        );
        await fetchPayroll();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save overtime.");
    } finally {
      setSaving(null);
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

  const payrollItems = payroll?.payrollItems || [];

  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-4xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Overtime
        </h1>
        <p className="text-gray-500 font-medium">
          Add overtime pay per employee for this payroll run. Overtime is not
          taxed — it's added directly to net pay.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm font-bold">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {!canEdit && (
        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 rounded-xl px-4 py-3 text-sm font-bold">
          <AlertCircle size={16} />
          Overtime can only be added while payroll is in Draft or Calculated
          status. Current status: {payroll?.status}.
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {payrollItems.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">
            No employees in this payroll run.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payrollItems.map((item) => {
              const employeeId = item.employee?._id;
              return (
                <div
                  key={employeeId}
                  className="flex items-center justify-between p-6"
                >
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {item.employee?.user?.firstName}{" "}
                      {item.employee?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.employee?.position}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-400">₦</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!canEdit}
                        value={overtimeInputs[employeeId] ?? 0}
                        onChange={(e) =>
                          setOvertimeInputs((prev) => ({
                            ...prev,
                            [employeeId]: e.target.value,
                          }))
                        }
                        className="w-28 bg-transparent outline-none text-sm font-bold text-gray-900 disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={() => handleSave(employeeId)}
                      disabled={!canEdit || saving === employeeId}
                      className="flex items-center gap-2 bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving === employeeId ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
