// src/pages/TeacherLayout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import TeacherSidebar from "../components/TeacherSidebar";

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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <TeacherSidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
