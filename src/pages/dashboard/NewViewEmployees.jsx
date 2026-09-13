import { useState, useEffect } from "react";
import {
  Eye,
  Pencil,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  User,
} from "lucide-react";
import { getCompanyEmployees } from "../../services/company";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STYLES = {
  Active: "bg-green-50 text-green-600 ring-1 ring-green-500/20",
  "On Leave": "bg-yellow-50 text-yellow-600 ring-1 ring-yellow-500/20",
  Inactive: "bg-red-50 text-red-600 ring-1 ring-red-500/20",
  Suspended: "bg-orange-50 text-orange-600 ring-1 ring-orange-500/20",
};

const PER_PAGE = 8;

export default function NewViewEmployees({ setActivePage, onEditEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getCompanyEmployees();
        if (res.success) {
          setEmployees(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      (department === "All Departments" || e.department === department) &&
      (e.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const departments = [
    "All Departments",
    ...new Set(employees.map((e) => e.department || "N/A")),
  ];

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Loading Workforce...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-gray-500 font-medium">
            Manage and view all members of your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
            <Download size={18} />
            Export List
          </button>
          <button
            onClick={() => setActivePage("add-employees")}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            Add New Employee
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none pl-11 pr-10 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-gray-700 outline-none cursor-pointer w-full"
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {[
                  "Employee",
                  "Role",
                  "Department",
                  "Join Date",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {paginated.map((emp) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={emp._id}
                    className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform overflow-hidden">
                          <img
                            src={`https://ui-avatars.com/api/?name=${emp.user?.firstName}+${emp.user?.lastName}&background=random`}
                            alt=""
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900 leading-none mb-1">
                            {emp.user?.firstName} {emp.user?.lastName}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium">
                            {emp.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-gray-700">
                        {emp.position || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-gray-500">
                        {emp.department || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                      {emp.createdAt
                        ? new Date(emp.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          STATUS_STYLES[
                            !emp.isActive
                              ? "Inactive"
                              : emp.status === "suspended"
                                ? "Suspended"
                                : emp.status === "on-leave"
                                  ? "On Leave"
                                  : "Active"
                          ]
                        }`}
                      >
                        {!emp.isActive
                          ? "Inactive"
                          : emp.status === "suspended"
                            ? "Suspended"
                            : emp.status === "on-leave"
                              ? "On Leave"
                              : "Active"}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit Employee"
                          onClick={() => onEditEmployee?.(emp._id)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button className="p-2.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Showing{" "}
            <span className="text-gray-900">
              {(page - 1) * PER_PAGE + 1} -{" "}
              {Math.min(page * PER_PAGE, filtered.length)}
            </span>{" "}
            of <span className="text-gray-900">{filtered.length}</span>{" "}
            Employees
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                    page === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-500 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
