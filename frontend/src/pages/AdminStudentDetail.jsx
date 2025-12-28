import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`users/students/${id}/`)
      .then((res) => setStudent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!student) return <div className="p-6">Student not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-indigo-600 font-semibold hover:underline text-sm mb-6"
      >
        ← Back to Students
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>

        {/* Content Container */}
        <div className="px-8 pb-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-10">
            <img
              src={student.profile_image || "/avatar.png"}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white"
            />

            <div>
              <h1 className="text-3xl font-bold text-gray-800">{student.full_name || "—"}</h1>
              <p className="text-gray-500 text-sm">{student.email}</p>
              {student.gender && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs mt-2 bg-indigo-100 text-indigo-700 font-semibold">
                  🧍 {student.gender}
                </span>
              )}
            </div>
          </div>

          {/* Information Sections */}
          <div className="space-y-10">
            
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-bold flex items-center text-gray-800 mb-4">
                <span className="text-xl mr-2">👤</span>
                Personal Details
              </h3>

              <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Detail label="Full Name" value={student.full_name} />
                <Detail label="Phone" value={student.phone} />
                <Detail label="Date of Birth" value={student.DOB} />
                <Detail label="Guardian Name" value={student.guardian_name} />
                <Detail label="Guardian Contact" value={student.guardian_contact} />
              </div>
            </section>

            {/* Academic Info */}
            <section>
              <h3 className="text-lg font-bold flex items-center text-gray-800 mb-4">
                <span className="text-xl mr-2">🎒</span>
                Academic Information
              </h3>

              <div className="bg-indigo-50 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Detail label="Admission No" value={student.admission_number} />
                <Detail label="Admission Date" value={student.admission_date} />
                <Detail label="Roll Number" value={student.roll_number} />
                <Detail label="Class" value={student.class_id} />
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="mt-10 flex gap-4">
            <button
              onClick={() => navigate(`/admin/students/${student.id}/edit`)}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black shadow-md hover:shadow-lg transition-all"
            >
              ✏️ Edit Information
            </button>

            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}