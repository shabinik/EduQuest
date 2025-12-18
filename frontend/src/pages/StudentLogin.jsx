import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom'

export default function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-24 p-6 bg-white shadow rounded">
      <h2 className="text-xl mb-4">Student Login</h2>
      {error && <p className="text-red-600">{error}</p>}
      <input placeholder="Email" onChange={(e) => setUsername(e.target.value)} className="w-full mb-2 p-2 border" />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 border" />
      <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      <p className="text-sm text-center mt-3">
        Not a Student? <Link to="/" className="text-blue-500 underline">Back</Link>
      </p>
    </form>
  );
}
