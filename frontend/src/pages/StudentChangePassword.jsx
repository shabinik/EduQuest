import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function StudentChangePassword() {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.put("accounts/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      alert("Password changed successfully!");
      navigate("/student");
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid old password");
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
                🔐
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Change Password</h2>
            <p className="text-indigo-100 text-sm text-center mt-1">
              Update your account password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="px-8 py-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm">
                <div className="flex items-start">
                  <span className="text-xl mr-2">⚠️</span>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Old Password */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={"password"}
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOld(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={"password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNew(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={"password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing Password...
                </span>
              ) : (
                "🔒 Change Password"
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate("/student")}
              disabled={loading}
              className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </form>

          {/* Security Tips */}
          <div className="bg-blue-50 px-8 py-6 border-t border-blue-100">
            <div className="flex items-start space-x-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Password Tips</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Use a mix of letters, numbers, and symbols</li>
                  <li>• Avoid using common words or personal info</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}