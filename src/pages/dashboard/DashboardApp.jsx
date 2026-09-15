import React, { useState, useEffect } from "react";

import NewSidebar from "../../components/dashboard/NewSidebar";
import NewHeader from "../../components/dashboard/NewHeader";

import CompanyDashboard from "./CompanyDashboard";
import NewViewEmployees from "./NewViewEmployees";
import AddEmployee from "./AddEmployee";
import EditEmployee from "./EditEmployee.jsx";
import Payroll from "./Payroll.jsx";
import PaymentGateway from "./PaymentGateway.jsx";
import AuditLog from "./AuditLog.jsx";
import Payslip from "./payslips.jsx";
import Notification from "./Notification.jsx";
import CompanySettings from "./CompanySettings";
import PayrollApproval from "./payrollApproval.jsx";
import ESOP from "./ESOP";
import Financing from "./Financing";
import EmployeeDashboard from "./EmployeeDashboard";

import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";

const ComingSoon = ({ title }) => (
  <div className="p-6">
    <h1 className="text-xl font-semibold text-gray-900 mb-4">{title}</h1>

    <div className="bg-white rounded-xl border border-gray-100 p-12 flex items-center justify-center text-gray-400 text-sm">
      This section is coming soon
    </div>
  </div>
);

export default function DashboardApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Stores the payroll currently being reviewed/approved
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const renderPage = () => {
    console.log("Current activePage:", activePage);
    console.log("Selected payroll:", selectedPayrollId);

    const isEmployee = user?.role === "employee";

    switch (activePage) {
      // DASHBOARD

      case "dashboard":
        return isEmployee ? (
          <EmployeeDashboard user={user} />
        ) : (
          <CompanyDashboard user={user} setActivePage={setActivePage} />
        );

      // EMPLOYEES

      case "view-employees":
        return isEmployee ? (
          <ComingSoon title="My Profile" />
        ) : (
          <NewViewEmployees
            setActivePage={setActivePage}
            onEditEmployee={(id) => {
              setSelectedEmployeeId(id);
              setActivePage("edit-employee");
            }}
          />
        );

      case "add-employees":
        return isEmployee ? (
          <ComingSoon title="Attendance" />
        ) : (
          <AddEmployee
            setActivePage={setActivePage}
            onBack={() => setActivePage("view-employees")}
            onNext={() => setActivePage("view-employees")}
          />
        );
      case "edit-employee":
        return isEmployee ? (
          <ComingSoon title="Edit Employee" />
        ) : (
          <EditEmployee
            employeeId={selectedEmployeeId}
            onBack={() => setActivePage("view-employees")}
            onSaved={() => setActivePage("view-employees")}
          />
        );

      // PAYROLL

      case "payroll":
        return isEmployee ? (
          <ComingSoon title="My Payslips" />
        ) : (
          <Payroll
            user={user}
            setActivePage={setActivePage}
            onBack={() => setActivePage("dashboard")}
            // IMPORTANT:
            // Payroll sends the real payroll ID here
            onNext={(payrollId) => {
              console.log("Opening payroll approval:", payrollId);

              setSelectedPayrollId(payrollId);
              setActivePage("payroll-approval");
            }}
            onPaymentStarted={(payrollId) => {
              setSelectedPayrollId(payrollId);
              setActivePage("payment-gateway");
            }}
          />
        );

      // PAYROLL APPROVAL

      case "payroll-approval":
        return isEmployee ? (
          <ComingSoon title="Payroll Approval" />
        ) : (
          <PayrollApproval
            payrollId={selectedPayrollId}
            onBack={() => {
              setActivePage("payroll");
            }}
            onApproved={() => {
              // After approval return to payroll
              setActivePage("payment-gateway");
            }}
          />
        );

      // ESOP

      case "esop":
        return <ESOP user={user} />;

      // FINANCING

      case "financing":
        return <Financing user={user} />;

      // NOTIFICATION

      case "notification":
        return <Notification setActivePage={setActivePage} />;

      // SETTINGS

      case "settings":
        return <CompanySettings user={user} />;

      // PAYMENT GATEWAY

      case "payment-gateway":
        return isEmployee ? (
          <ComingSoon title="Payment Gateway" />
        ) : (
          <PaymentGateway
            payrollId={selectedPayrollId}
            onBack={() => setActivePage("payroll")}
            onNext={() => setActivePage("payroll")}
          />
        );

      // AUDIT LOG

      case "audit-log":
        return isEmployee ? <ComingSoon title="Audit Log" /> : <AuditLog />;

      //PAY SLIP
      case "payslip":
        return isEmployee ? <ComingSoon title="My Payslips" /> : <Payslip />;

      case "overtime":
        return isEmployee ? <ComingSoon title="Overtime" /> : <Overtime />;

      // DEFAULT

      default:
        return isEmployee ? (
          <ComingSoon title="Employee Dashboard" />
        ) : (
          <CompanyDashboard user={user} />
        );
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <NewSidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NewHeader
          toggleSidebar={() => setSidebarOpen((o) => !o)}
          user={user}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
