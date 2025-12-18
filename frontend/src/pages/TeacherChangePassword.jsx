// src/pages/TeacherChangePassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function TeacherChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("accounts/change-password/", { new_password: newPassword });
      // logout to clear cookies/session and force login with new password
      try { await axiosInstance.post("accounts/logout/"); } catch (_) {}
      sessionStorage.removeItem("user");
      alert("Password changed. Please log in with the new password.");
      navigate("/teacher/login");
    } catch (err) {
      console.error("Change password failed:", err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data));
      } else {
        setError("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl mb-4">Set your new password</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
 