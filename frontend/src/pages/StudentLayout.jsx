import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import StudentSidebar from "../components/StudentSidebar";

export default function StudentLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("accounts/profile/");
        if (res.data.role !== "student") {
          navigate("/student/login");
        }
      } catch {
        navigate("/student/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}