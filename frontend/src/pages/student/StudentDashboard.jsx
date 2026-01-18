import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AnnouncementCard from "../../cards/AnnouncementCard";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [announcements,setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axiosInstance.get("users/students/profile/").then(res => {
      setProfile(res.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true)
    axiosInstance.get('academics/announcement/audience/')
    .then(res => setAnnouncements(res.data || []))
    .catch(() => setAnnouncements([]))
    .finally(() => setLoading(false))

  },[])

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>
        Student Dashboard
      </h1>

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

      <div style={{ background: "#fff", padding: 20, borderRadius: 6 }}>
        <p><b>Name:</b> {profile.full_name}</p>
        <p><b>Class:</b> {profile.class_id}</p>
        <p><b>Roll No:</b> {profile.roll_number}</p>
        <p><b>Admission No:</b> {profile.admission_number}</p>
      </div>
    </div>
  );
}
