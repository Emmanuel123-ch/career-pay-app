import React, { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Bell,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard({ user }) {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState("This Month");

  const stats = [
    {
      label: "Hours Worked",
      value: "168h",
      icon: <Clock size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Days Present",
      value: "21",
      icon: <UserCheck size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Net Pay",
      value: "₦245,000",
      icon: <CreditCard size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Next Payday",
      value: "Apr 30",
      icon: <Calendar size={20} />,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const announcements = [
    {
      title: "New Policy Update",
      desc: "Please review the updated remote work policy.",
      time: "2h ago",
    },
    {
      title: "Public Holiday",
      desc: "Office will be closed on Friday for Easter.",
      time: "1d ago",
    },
    {
      title: "Team Lunch",
      desc: "Join us for a team lunch this Wednesday.",
      time: "2d ago",
    },
  ];

  const quickLinks = [
    {
      title: "Request Leave",
      icon: <Calendar className="text-blue-500" />,
      desc: "Apply for vacation or sick leave",
      route: "/leave",
    },
    {
      title: "My Benefits",
      icon: <Award className="text-purple-500" />,
      desc: "View your insurance and perks",
      route: "/benefits",
    },
    {
      title: "Tax Documents",
      icon: <TrendingUp className="text-green-500" />,
      desc: "Download your annual tax forms",
      route: "/tax",
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.firstName || "User"}!
          </h1>

          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Here's a summary of your activities and payroll.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/payslips")}
            className="flex items-center gap-2 bg-[#1D4EFF] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <FileText size={18} />
            View Last Payslip
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 bg-opacity-10 dark:bg-opacity-20`}
            >
              {stat.icon}
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Attendance & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Attendance Overview
            </h3>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 text-[10px] font-bold text-gray-500 border-none rounded-lg py-1.5 px-3 outline-none uppercase tracking-widest cursor-pointer"
            >
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 70, 90, 65, 80, 100, 85, 75, 90, 95, 80, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="w-full bg-[#1D4EFF]/5 rounded-t-lg relative overflow-hidden h-full">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-[#1D4EFF] transition-all duration-1000 ease-out group-hover:brightness-110"
                    style={{ height: `${h}%` }}
                  />
                </div>

                <span className="text-[8px] font-bold text-gray-400 uppercase">
                  W{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-[#0a1628] rounded-[32px] p-8 text-white shadow-xl shadow-[#0a1628]/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bell size={20} className="text-[#1D4EFF]" />
              Announcements
            </h3>

            <span className="bg-[#1D4EFF] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              3 New
            </span>
          </div>

          <div className="space-y-6">
            {announcements.map((ann, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  console.log("Announcement selected:", ann.title);
                }}
                className="w-full text-left group cursor-pointer border-b border-white/5 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold group-hover:text-[#1D4EFF] transition-colors">
                    {ann.title}
                  </p>

                  <span className="text-[10px] text-gray-500 font-medium">
                    {ann.time}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {ann.desc}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/announcements")}
            className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-4 rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-2 group"
          >
            View All Announcements
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link, i) => (
          <button
            key={i}
            type="button"
            onClick={() => navigate(link.route)}
            className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              {link.icon}
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {link.title}
              </p>

              <p className="text-[10px] text-gray-500 font-medium">
                {link.desc}
              </p>
            </div>

            <ArrowUpRight
              size={16}
              className="ml-auto text-gray-300 group-hover:text-[#1D4EFF] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
