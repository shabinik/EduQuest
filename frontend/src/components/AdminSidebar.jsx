import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await axiosInstance.post("accounts/logout/");
      sessionStorage.clear();
      navigate("/admin/login");
    } catch (err) {
      console.error(err);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
            🏫
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">EduQuest</h2>
            <p className="text-xs text-gray-500">School Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/plans"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">💳</span>
          <span>Subscription Plans</span>
        </NavLink>

        <NavLink
          to="/admin/teachers"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">👩‍🏫</span>
          <span>Teachers</span>
        </NavLink>

        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">👨‍🎓</span>
          <span>Students</span>
        </NavLink>

        <NavLink
          to="/admin/classes"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">🏫</span>
          <span>Classes</span>
        </NavLink>

        <NavLink
          to="/admin/announcements"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">📢</span>
          <span>Announcements</span>
        </NavLink>

        <NavLink
          to="/admin/timetable"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">🗓️</span>
          <span>Time Table</span>
        </NavLink>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
            }`
          }
        >
          <span className="text-xl">⚙️</span>
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/admin/change-password"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
            }`
          }
        >
          <span className="text-xl">🔐</span>
          <span>Change Password</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isLoggingOut
              ? "bg-red-300 cursor-not-allowed text-red-800"
              : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
          }`}
        >
          <span className="text-lg">{isLoggingOut ? "⏳" : "🚪"}</span>
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
