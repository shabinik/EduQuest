import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axiosInstance.get("users/students/profile/").then(res => {
      setProfile(res.data);
    });
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>
        Student Dashboard
      </h1>

      <div style={{ background: "#fff", padding: 20, borderRadius: 6 }}>
        <p><b>Name:</b> {profile.full_name}</p>
        <p><b>Class:</b> {profile.class_id}</p>
        <p><b>Roll No:</b> {profile.roll_number}</p>
        <p><b>Admission No:</b> {profile.admission_number}</p>
      </div>
    </div>
  );
}
