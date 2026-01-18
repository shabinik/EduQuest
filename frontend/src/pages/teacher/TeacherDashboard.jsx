// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import AnnouncementCard from "../../cards/AnnouncementCard";

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements,setAnnouncements] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("accounts/profile/");
        setUser(res.data);
      } catch (err) {
        console.error(err);
        navigate("/teacher/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    setLoading(true)
    axiosInstance.get('academics/announcement/audience/')
    .then(res => setAnnouncements(res.data || []))
    .catch(() => setAnnouncements([]))
    .finally(() => setLoading(false))

  },[])

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <div>
          <button onClick={() => navigate("/teacher/profile")} className="mr-2 bg-blue-600 text-white px-3 py-1 rounded">My Profile</button>
        </div>
      </div>

      {/* ANNOUNCEMENTS SECTION */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">
                📢 Announcements
              </h2>
      
              {loading ? (
                <p className="text-gray-500">Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-yellow-700 font-semibold">
                    No announcements at the moment.
                  </p>
                </div>
              ) : (
                announcements.map(a => (
                  <AnnouncementCard key={a.id} a={a} />
                ))
              )}
            </div>

      <div className="bg-white p-6 rounded shadow">
        <p><strong>Name:</strong> {user.full_name || user.email}</p>
        <p><strong>School:</strong> {user.tenant_name || "—"}</p>
        <p><strong>Role:</strong> {user.role}</p>

        {/* Add dashboard widgets: timetable, announcements, classes, etc. */}
      </div>
    </div>
  );
}
