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
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={student.profile_image || "/avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border"
          />

          <div>
            <h1 className="text-2xl font-semibold">
              {student.full_name || "—"}
            </h1>
            <p className="text-gray-600">{student.email}</p>
            <p className="text-sm text-gray-500 capitalize">
              {student.gender || "—"}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <Detail label="Phone" value={student.phone} />
          <Detail label="Date of Birth" value={student.DOB} />
          <Detail label="Admission No" value={student.admission_number} />
          <Detail label="Admission Date" value={student.admission_date} />
          <Detail label="Class" value={student.class_id} />
          <Detail label="Roll Number" value={student.roll_number} />
          <Detail label="Guardian Name" value={student.guardian_name} />
          <Detail label="Guardian Contact" value={student.guardian_contact} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
