// src/pages/AdminLayout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axiosInstance from "../api/axiosInstance";

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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet /> {/* AdminDashboard, BuyPlan, etc. render here */}
      </main>
    </div>
  );
}
