import React, { useState, useEffect } from "react";
import {
  Briefcase,
  ChevronRight,
  Loader2,
  AlertCircle,
  Save,
  ArrowLeft,
} from "lucide-react";
import {
  getEmployeeById,
  updateEmployee,
  getNigerianBanks,
} from "../../services/company";

const inputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl bg-gray-50 border outline-none transition-all ${
    hasError
      ? "border-red-300 ring-2 ring-red-100 focus:ring-red-200"
      : "border-transparent focus:ring-2 focus:ring-[#1D4EFF]"
  }`;

const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 mt-1">
      <AlertCircle size={12} /> {message}
    </p>
  );
};

export default function EditEmployee({ employeeId, onBack, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [banks, setBanks] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [formData, setFormData] = useState({
    department: "",
    position: "",
    employmentType: "full-time",
    status: "active",
    salaryAmount: "",
    salaryCurrency: "NGN",
    payFrequency: "monthly",
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });

  // Load the employee's current data and the bank list in parallel
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [empRes, banksRes] = await Promise.all([
          getEmployeeById(employeeId),
          getNigerianBanks(),
        ]);

        if (cancelled) return;

        setBanks(banksRes.data || []);

        const emp = empRes.data;
        setEmployeeName(
          `${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`.trim(),
        );
        setFormData({
          department: emp.department || "",
          position: emp.position || "",
          employmentType: emp.employmentType || "full-time",
          status: emp.status || "active",
          salaryAmount: emp.salary?.amount ?? "",
          salaryCurrency: emp.salary?.currency || "NGN",
          payFrequency: emp.salary?.payFrequency || "monthly",
          bankName: emp.bankDetails?.bankName || "",
          bankCode: emp.bankDetails?.bankCode || "",
          accountNumber: emp.bankDetails?.accountNumber || "",
          accountName: emp.bankDetails?.accountName || "",
        });
      } catch (err) {
        console.error("Failed to load employee:", err);
        setErrors({
          _load: "Failed to load employee data. Please go back and try again.",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBankSelect = (e) => {
    const selectedName = e.target.value;
    const match = banks.find((b) => b.name === selectedName);
    setFormData((prev) => ({
      ...prev,
      bankName: selectedName,
      bankCode: match ? match.code : "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.salaryAmount)
      newErrors.salaryAmount = "Salary amount is required";
    if (formData.accountNumber && !/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be exactly 10 digits";
    }
    if (formData.bankCode && !/^\d{3}$/.test(formData.bankCode)) {
      newErrors.bankCode = "Bank code must be exactly 3 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        department: formData.department,
        position: formData.position,
        employmentType: formData.employmentType,
        status: formData.status,
        salary: {
          amount: Number(formData.salaryAmount) || 0,
          currency: formData.salaryCurrency,
          payFrequency: formData.payFrequency,
        },
        bankDetails: {
          bankName: formData.bankName,
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
      };

      const res = await updateEmployee(employeeId, payload);
      if (res.success) {
        alert("Employee updated successfully!");
        if (res.warnings?.length) {
          alert(res.warnings.join("\n"));
        }
        onSaved ? onSaved() : onBack?.();
      }
    } catch (err) {
      console.error("Failed to update employee:", err);
      setErrors({
        _save:
          err.response?.data?.message ||
          "Failed to update employee. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          Loading employee...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn p-8">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          <ArrowLeft size={14} /> Employees
        </button>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-bold">
          Edit {employeeName || "Employee"}
        </span>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-[#1D4EFF]/5 border border-gray-50 relative overflow-hidden space-y-8">
        {errors._load && <FieldError message={errors._load} />}
        {errors._save && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <FieldError message={errors._save} />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Employment Details
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Update role, salary, and payment information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`${inputClass(false)} appearance-none cursor-pointer`}
            >
              <option value="">Select department</option>
              <option value="finance">Finance</option>
              <option value="engineering">Engineering</option>

              <option value="finance">Finance</option>

              <option value="Management">Management</option>

              <option value="sales">Sales</option>

              <option value="human-resources">Human Resources</option>

              <option value="operation">Operation</option>

              <option value="admin">Admin</option>

              <option value="quality-assurance">Quality Assurance</option>

              <option value="it">IT</option>

              <option value="legal">Legal</option>

              <option value="operations">Operations</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Position*
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={inputClass(!!errors.position)}
            />
            <FieldError message={errors.position} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className={`${inputClass(false)} appearance-none cursor-pointer`}
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`${inputClass(false)} appearance-none cursor-pointer`}
            >
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Salary Amount*
            </label>
            <input
              type="number"
              min="0"
              name="salaryAmount"
              value={formData.salaryAmount}
              onChange={handleChange}
              className={inputClass(!!errors.salaryAmount)}
            />
            <FieldError message={errors.salaryAmount} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Currency
            </label>
            <select
              name="salaryCurrency"
              value={formData.salaryCurrency}
              onChange={handleChange}
              className={`${inputClass(false)} appearance-none cursor-pointer`}
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Pay Frequency
            </label>
            <select
              name="payFrequency"
              value={formData.payFrequency}
              onChange={handleChange}
              className={`${inputClass(false)} appearance-none cursor-pointer`}
            >
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Bank details */}
        <div className="pt-6 mt-2 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
            Bank Details (for salary payment)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Bank Name
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleBankSelect}
                className={`${inputClass(!!errors.bankName)} appearance-none cursor-pointer`}
              >
                <option value="">Select bank</option>
                {banks.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Bank Code
              </label>
              <input
                type="text"
                name="bankCode"
                value={formData.bankCode}
                readOnly
                className={`${inputClass(!!errors.bankCode)} bg-gray-100 cursor-not-allowed`}
              />
              <FieldError message={errors.bankCode} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                className={inputClass(!!errors.accountNumber)}
              />
              <FieldError message={errors.accountNumber} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className={inputClass(!!errors.accountName)}
              />
              <FieldError message={errors.accountName} />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1D4EFF] text-white font-bold px-10 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
