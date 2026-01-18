import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../api/axiosInstance";

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: check authentication & role on layout mount
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("accounts/profile/");
        const user = res.data;
        if (user.role !== "admin") {
          navigate("/admin/login");
        }
      } catch (err) {
        navigate("/admin/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden">
      <AdminSidebar />
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