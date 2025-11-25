// src/pages/SuperAdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SuperAdminSidebar";

export default function SuperAdminLayout(){
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />  {/* nested route content renders here */}
      </main>
    </div>
  )
}
