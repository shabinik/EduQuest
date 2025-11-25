import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

function SuperAdminSidebar() {
    const navigate = useNavigate()

    const logout = async () => {
        try{
            await axiosInstance.post("accounts/logout")
            sessionStorage.clear()
            navigate("/login")
        } catch (err) {
            console.error(err)
            navigate("/login")
        }
    }
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
      <h2 style={{ marginBottom: 12 }}>EduQuest Admin</h2>

      <nav>
        <NavLink to="/superadmin" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/superadmin/plans" style={linkStyle}>Subscription Plans</NavLink>
        <NavLink to="/superadmin" style={linkStyle}>Profile</NavLink>
        {/* add more links here */}
      </nav>

      <div style={{ marginTop: 24 }}>
        <button onClick={logout} style={{ padding: "8px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6 }}>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default SuperAdminSidebar