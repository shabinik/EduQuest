import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function AddStudentForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    admission_number: "",
    class_id: "",
    roll_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.full_name.trim()) {
      setError("Full name cannot be empty");
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(form.roll_number)) {
      setError("Roll number must contain only digits");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("users/students/create/", {...form,
        full_name: form.full_name.trim(),
        admission_number: form.admission_number.trim(),
        class_id: form.class_id.trim(),
        roll_number: Number(form.roll_number),
      });
      onCreated();
    } catch (err) { 
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to create student"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">➕</span>
          Add New Student
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="student@example.com"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              name="full_name"
              placeholder="Enter full name"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admission Number
            </label>
            <input
              name="admission_number"
              placeholder="Enter admission number"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class
            </label>
            <input
              name="class_id"
              placeholder="Enter class"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              name="roll_number"
              placeholder="Enter roll number"
              onChange={handleChange}
              inputMode="numeric"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading
                ? "bg-green-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Creating..." : "✓ Create Student"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
          >
            ✕ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Edid Student Page
function EditStudentForm({ student, onUpdated, onCancel }) {
  const [form, setForm] = useState({
    full_name: student.full_name || "",
    phone: student.phone || "",
    guardian_name: student.guardian_name || "",
    guardian_contact: student.guardian_contact || "",
    class_id: student.class_id || "",
    roll_number: student.roll_number || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await axiosInstance.put(`users/students/update/${student.id}/`, form);
      onUpdated();
    } catch (err) {
      setError("Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="text-2xl mr-2">✏️</span>
        Edit Student Details
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Guardian Name
            </label>
            <input
              name="guardian_name"
              value={form.guardian_name}
              onChange={handleChange}
              placeholder="Enter guardian name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Guardian Contact
            </label>
            <input
              name="guardian_contact"
              value={form.guardian_contact}
              onChange={handleChange}
              placeholder="Enter guardian contact"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class
            </label>
            <input
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              placeholder="Enter class"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              name="roll_number"
              value={form.roll_number}
              onChange={handleChange}
              placeholder="Enter roll number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              saving
                ? "bg-green-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Student List
export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("users/students/list/");
      setStudents(res.data);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await axiosInstance.delete(`users/students/delete/${id}/`);
      fetchStudents();
    } catch {
      alert("Failed to delete student");
    }
  };

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);

  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">👨‍🎓</span>
              Student Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track all student records
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Add Student Form */}
      {showAdd && (
        <AddStudentForm
          onCreated={() => {
            setShowAdd(false);
            fetchStudents();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Edit Student Form */}
      {editingStudent && (
        <EditStudentForm
          student={editingStudent}
          onUpdated={() => {
            setEditingStudent(null);
            fetchStudents();
          }}
          onCancel={() => setEditingStudent(null)}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Loading students...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Stats Bar */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {students.length}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <p className="text-sm text-gray-600">Current Page</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentPage} / {totalPages}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-6xl mb-4">📚</div>
                      <p className="text-gray-500 text-lg font-medium">
                        No students found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Add your first student to get started
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Profile */}
                      <td className="px-6 py-4">
                        <img
                          src={s.profile_image || "/avatar.png"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                          alt="Profile"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {s.full_name}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-gray-600 text-sm">{s.email}</p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                          {s.class_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                          {s.roll_number}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/students/${s.id}`)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            👁️ View
                          </button>

                          <button
                            onClick={() => setEditingStudent(s)}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => deleteStudent(s.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedStudents.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, students.length)} of{" "}
                  {students.length} students
                </p>

                <div className="flex items-center space-x-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <span className="text-sm font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
);
}
