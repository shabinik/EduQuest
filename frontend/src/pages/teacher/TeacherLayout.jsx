import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import TeacherSidebar from "../../components/TeacherSidebar";

export default function TeacherLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("accounts/profile/");
        const user = res.data;

        if (user.role !== "teacher") {
          navigate("/teacher/login");
        }
      } catch (err) {
        navigate("/teacher/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
      <TeacherSidebar />
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