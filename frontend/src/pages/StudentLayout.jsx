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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <StudentSidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
