// src/pages/TeacherProfile.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("users/teachers/profile/");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please login again.");
        // redirect to login if unauthorized
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate("/teacher/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // build nested payload to match serializer with source='user.xxx'
      const payload = {
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        gender:profile.gender || null,
        DOB: profile.DOB || null,
        qualification: profile.qualification || "",
        // sending YYYY-MM-DD if available, or null
        joining_date: profile.joining_date ? profile.joining_date.split("T")[0] : null,
        salary: profile.salary || 0,
      };

      const res = await axiosInstance.put("users/teachers/profile/", payload);
      setProfile(res.data);
      setEditing(false);
      alert("Profile saved successfully");
    } catch (err) {
      console.error("Save failed:", err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data));
      } else {
        setError("Save failed. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!profile) return <div className="p-6 text-red-600">Teacher profile not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded">
              Edit
            </button>
          ) : null}
        </div>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      {!editing ? (
        <div className="space-y-2">
          <div><strong>Name:</strong> {profile.full_name || "—"}</div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Phone:</strong> {profile.phone || "—"}</div>
          <div><strong>gender:</strong> {profile.gender || "—"}</div>
          <div><strong>Date of Birth:</strong> {profile.DOB || "—"}</div>
          <div><strong>Qualification:</strong> {profile.qualification || "—"}</div>
          <div><strong>Joining date:</strong> {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : "—"}</div>
          <div><strong>Salary:</strong> {profile.salary ?? "—"}</div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-3">
          <label>
            Name
            <input name="full_name" value={profile.full_name || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          <label>
            Phone
            <input name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>


          <label>
            Qualification
            <input name="qualification" value={profile.qualification || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          <label>
            Gender
            <select name="gender" value={profile.gender || ""} onChange={handleChange}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Date of Birth
            <input
              type="date"
              name="DOB"
              value={profile.DOB || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Joining date
            <input
              name="joining_date"
              type="date"
              value={profile.joining_date ? profile.joining_date.split("T")[0] : ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </label>

          <label>
            Salary
            <input name="salary" type="number" value={profile.salary || ""} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
