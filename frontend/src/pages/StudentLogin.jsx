import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom'

export default function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
        setError("Please enter both email and password");
        return;
    }

      setError("")
      setLoading(true)

    try {
      const res = await axiosInstance.post("accounts/login/", { username, password });
      const user = res.data.user;

      if (user.role !== "student") {
        setError("Not a student account");
        return;
      }

      sessionStorage.setItem("user", JSON.stringify(user));

      if (user.must_change_password) {
        navigate("/student/change-password");
      } else {
        navigate("/student");
      }
    } catch {
      if (err.response?.status === 401) {
          setError("Invalid email or password");
      } else {
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
      <h2 className="text-xl mb-4">Student Login</h2>
      {error && <p className="text-red-600">{error}</p>}
      <input placeholder="Email" onChange={(e) => setUsername(e.target.value)} className="w-full mb-2 p-2 border" />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 border" />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white transition
          ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
        `}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm text-center mt-3">
        Not a Student? <Link to="/" className="text-blue-500 underline">Back</Link>
      </p>
    </form>
    </div>
  );
}
