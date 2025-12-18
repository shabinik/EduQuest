// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("accounts/profile/");
        setUser(res.data);
      } catch (err) {
        console.error(err);
        navigate("/teacher/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("accounts/logout/");
    } catch (err) {
      console.error(err);
    }
    sessionStorage.removeItem("user");
    navigate("/teacher/login");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <div>
          <button onClick={() => navigate("/teacher/profile")} className="mr-2 bg-blue-600 text-white px-3 py-1 rounded">My Profile</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <p><strong>Name:</strong> {user.full_name || user.email}</p>
        <p><strong>School:</strong> {user.tenant_name || "—"}</p>
        <p><strong>Role:</strong> {user.role}</p>

        {/* Add dashboard widgets: timetable, announcements, classes, etc. */}
      </div>
    </div>
  );
}
