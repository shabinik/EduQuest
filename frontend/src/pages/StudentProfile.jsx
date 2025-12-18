import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [editing,setEditing] = useState(false)

  useEffect(() => {
    axiosInstance.get("users/students/profile/").then(res => setProfile(res.data));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const save = async () => {
    await axiosInstance.put("users/students/profile/",{
      full_name: profile.full_name,
      phone: profile.phone,
      guardian_name: profile.guardian_name,
      guardian_contact: profile.guardian_contact,
    });
    alert("Profile updated");
    setEditing(false)
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Edit
        </button>
      )}
    </div>

    <div className="bg-white p-6 rounded shadow">
      {!editing ? (
        <>
          <p><strong>Name:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || "—"}</p>
          <p><strong>Guardian Name:</strong> {profile.guardian_name || "—"}</p>
          <p><strong>Guardian Contact:</strong> {profile.guardian_contact || "—"}</p>

          <hr style={{ margin: "16px 0" }} />

          <p><strong>Class:</strong> {profile.class_id}</p>
          <p><strong>Roll No:</strong> {profile.roll_number}</p>
          <p><strong>Admission No:</strong> {profile.admission_number}</p>
        </>
      ) : (
        <>
          <input
            name="full_name"
            value={profile.full_name || ""}
            onChange={handleChange}
            placeholder="Full Name"
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            name="guardian_name"
            value={profile.guardian_name || ""}
            onChange={handleChange}
            placeholder="Guardian Name"
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            name="guardian_contact"
            value={profile.guardian_contact || ""}
            onChange={handleChange}
            placeholder="Guardian Contact"
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          />

          <button
            onClick={save}
            className="bg-green-600 text-white px-3 py-1 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  </div>
  );
}
