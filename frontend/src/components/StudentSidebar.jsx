import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function StudentSidebar() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axiosInstance.post("accounts/logout/");
    } catch (err) {
      console.error(err);
    }
    navigate("/student/login");
  };

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "12px 16px",
    textDecoration: "none",
    color: isActive ? "white" : "#111",
    background: isActive ? "#2563eb" : "transparent",
    borderRadius: 6,
    marginBottom: 6
  });

  return (
    <aside style={{ width: 240, padding: 20, borderRight: "1px solid #eee" }}>
      <h2 style={{ marginBottom: 12 }}>Student</h2>

      <nav>
        <NavLink to="/student" end style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/student/profile" style={linkStyle}>
          My Profile
        </NavLink>

        <NavLink to="/student/change-password" style={linkStyle}>
          Change Password
        </NavLink>
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
