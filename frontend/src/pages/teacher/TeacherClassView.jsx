import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

// ── Student Detail Modal ──────────────────────────────────────────────────────
const StudentDetailModal = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`classroom/teacher/student/${studentId}/`)
      .then((res) => setStudent(res.data))
      .catch(() => toast.error("Failed to load student details."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const Detail = ({ label, value }) =>
    value ? (
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-400 uppercase mb-0.5">{label}</span>
        <span className="text-gray-800 font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            👨‍🎓 Student Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500 mt-3">Loading...</p>
          </div>
        ) : !student ? (
          <div className="p-8 text-center text-gray-500">Student details not available.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                <p className="text-gray-500 text-sm">{student.email}</p>
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-3">Academic Info</p>
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Roll Number"      value={student.roll_number} />
                <Detail label="Admission Number" value={student.admission_number} />
                <Detail label="Class"            value={student.class_name} />
                <Detail label="Joined"           value={student.joined_date} />
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">Personal Info</p>
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Date of Birth" value={student.date_of_birth} />
                <Detail label="Gender"        value={student.gender} />
                <Detail label="Phone"         value={student.phone} />
                <Detail label="Address"       value={student.address} />
              </div>
            </div>

            {/* Parent/Guardian Info */}
            {(student.parent_name || student.parent_phone || student.parent_email) && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase mb-3">Parent / Guardian</p>
                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Name"  value={student.parent_name} />
                  <Detail label="Phone" value={student.parent_phone} />
                  <Detail label="Email" value={student.parent_email} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// ── Main Component ────────────────────────────────────────────────────────────
export default function TeacherClassView() {
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("classroom/teacher/class/")
      .then((res) => setCls(res.data))
      .catch(() => toast.error("No class assigned. Please contact admin."))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = cls?.students?.filter((student) => {
    const name       = student.name || "";
    const email      = student.email || "";
    const rollNumber = student.roll_number ? student.roll_number.toString() : "";
    const search     = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      rollNumber.includes(searchTerm)
    );
  }) || [];

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-500 mt-4">Loading your class details...</p>
        </div>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-2xl p-8 shadow-xl">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">⚠️</div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-3">No Class Assigned</h2>
              <p className="text-yellow-700 text-lg mb-4">You are not assigned as a class teacher yet.</p>
              <p className="text-yellow-600 text-sm">Please contact your school administrator for class assignment and further details.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-3xl">👨‍🏫</div>
            <div>
              <p className="text-emerald-100 text-sm font-semibold uppercase mb-1">My Class</p>
              <h1 className="text-4xl font-bold text-white">Class {cls.name} - {cls.division}</h1>
              <p className="text-emerald-100 text-lg mt-1">Academic Year: {cls.academic_year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Students</p>
              <p className="text-4xl font-bold text-emerald-600">{cls.student_count || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Enrolled in your class</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Class Details</p>
              <p className="text-2xl font-bold text-gray-800">{cls.name} - {cls.division}</p>
              <p className="text-sm text-gray-600 mt-1">Academic Year {cls.academic_year}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">📚</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Status</p>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Class in session</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">✓</div>
          </div>
        </div>
      </div>

      {/* STUDENTS LIST */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">👨‍🎓</span> Student List
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {cls.students?.length || 0} student{cls.students?.length !== 1 ? "s" : ""} in your class
              </p>
            </div>
            {cls.students && cls.students.length > 0 && (
              <div className="w-full md:w-96">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!cls.students || cls.students.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg font-medium">No students enrolled</p>
            <p className="text-gray-400 text-sm mt-1">Students will appear here once assigned to your class</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">No students found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                        {s.roll_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-500">Student #{index + 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm flex items-center">
                        <span className="mr-2">📧</span>{s.email}
                      </p>
                    </td>
                    {/* ── View Details Button ── */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStudentId(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200 transition-colors"
                      >
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLASS OVERVIEW */}
      {cls.students && cls.students.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-lg">
            <span className="mr-2">📊</span> Class Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Students:</span>
                <span className="font-semibold text-gray-800">{cls.student_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Currently Viewing:</span>
                <span className="font-semibold text-gray-800">{filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Class Name:</span>
                <span className="font-semibold text-gray-800">{cls.name} - {cls.division}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Academic Year:</span>
                <span className="font-semibold text-gray-800">{cls.academic_year}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudentId && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
}