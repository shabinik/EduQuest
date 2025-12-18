import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function StudentChangePassword() {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    await axiosInstance.put("accounts/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    alert("Password changed");
    navigate("/student");
  };

  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h2 className="mb-4 text-xl">Change Password</h2>
      <input type="password" placeholder="Old password" onChange={(e) => setOld(e.target.value)} className="w-full mb-2 p-2 border" />
      <input type="password" placeholder="New password" onChange={(e) => setNew(e.target.value)} className="w-full mb-4 p-2 border" />
      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">Change</button>
    </div>
  );
}
