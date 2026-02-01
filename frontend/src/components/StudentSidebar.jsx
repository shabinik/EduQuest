import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User, 
  Lock, 
  LogOut,
  Backpack,
  ClipboardCheck
} from "lucide-react";

export default function StudentSidebar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await axiosInstance.post("accounts/logout/");
      sessionStorage.clear();
      navigate("/student/login");
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
            <Backpack className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">EduQuest</h2>
            <p className="text-xs text-gray-500">Student Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/student"
          end
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/student/timetable"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          <Calendar size={20} />
          <span>Time Table</span>
        </NavLink>

        <NavLink
          to="/student/attendance"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          <ClipboardCheck size={20} />
          <span>My Attendance</span>
        </NavLink>

        <NavLink
          to="/student/assignment"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          <FileText size={20} />
          <span>Assignments</span>
        </NavLink>

        <NavLink
          to="/student/profile"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          <User size={20} />
          <span>My Profile</span>
        </NavLink>

        <NavLink
          to="/student/change-password"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-semibold"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`
          }
        >
          <Lock size={20} />
          <span>Change Password</span>
        </NavLink>
      </nav>

      {/* Footer - Logout */}
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
          <LogOut size={20} />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}