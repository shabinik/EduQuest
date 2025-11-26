// src/components/AdminSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axiosInstance.post("accounts/logout/");
    } catch (err) {
      console.error(err);
    }
    sessionStorage.clear();
    navigate("/admin/login");
  };

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "12px 16px",
    textDecoration: "none",
    color: isActive ? "white" : "#111",
    background: isActive ? "#16a34a" : "transparent",
    borderRadius: 6,
    marginBottom: 6
  });

  return (
    <aside style={{ width: 240, padding: 20, borderRight: "1px solid #eee" }}>
      <h2 style={{ marginBottom: 12 }}>School Admin</h2>

      <nav>
        <NavLink to="/admin" style={linkStyle} end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/plans" style={linkStyle}>
          Subscription Plans
        </NavLink>
        {/* later: add Profile, Teachers, Students, etc. */}
      </nav>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={logout}
          style={{
            padding: "8px 12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
