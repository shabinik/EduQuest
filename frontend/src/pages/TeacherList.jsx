import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function AddTeacherForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    qualification: '',
    joining_date: '',
    salary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.full_name && !form.full_name.trim()) {
      setError("Full name cannot be empty.");
      setLoading(false);
      return;
    }

    if (form.phone && !/^\d{10,15}$/.test(form.phone)) {
      setError("Phone number must be 10–15 digits.");
      setLoading(false);
      return;
    }

    if (form.qualification && !form.qualification.trim()) {
      setError("Qualification cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("users/teachers/create/", {
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone,
        qualification: form.qualification.trim(),
        joining_date: form.joining_date || null,
        salary: Number(form.salary) || 0,
      });

      setForm({
        email: "",
        full_name: "",
        phone: "",
        qualification: "",
        joining_date: "",
        salary: "",
      });

      onCreated && onCreated();

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.data) {
        const data = err.response.data;
        setError(
          typeof data === "string"
            ? data
            : Object.values(data).flat().join(" ")
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">➕</span>
          Add New Teacher
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
              Email Address *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="teacher@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

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
              Phone Number
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
              Qualification
            </label>
            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g., M.Ed, B.A"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Joining Date
            </label>
            <input
              name="joining_date"
              type="date"
              value={form.joining_date || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary
            </label>
            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              placeholder="Enter salary amount"
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
            {loading ? "Creating..." : "✓ Create Teacher"}
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



// EDIT TEACHER

function EditTeacherForm({ teacher, onUpdated, onCancel }) {
  const [form, setForm] = useState({
    full_name: teacher.full_name || "",
    phone: teacher.phone || "",
    qualification: teacher.qualification || "",
    joining_date: teacher.joining_date
      ? teacher.joining_date.split("T")[0]
      : "",
    salary: teacher.salary || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axiosInstance.put(
        `users/teachers/update/${teacher.id}/`,
        {
          full_name: form.full_name,
          phone: form.phone,
          qualification: form.qualification,
          joining_date: form.joining_date || null,
          salary: form.salary || 0,
        }
      );
      setLoading(false);
      onUpdated && onUpdated();
    } catch (err) {
      setLoading(false);
      setError("Failed to update teacher");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="text-2xl mr-2">✏️</span>
        Edit Teacher Details
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              Phone Number
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
              Qualification
            </label>
            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g., M.Ed, B.A"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Joining Date
            </label>
            <input
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salary
            </label>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="Enter salary amount"
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
            {loading ? "Saving..." : "💾 Save Changes"}
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



// TEACHERS LIST

export default function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [error, setError] = useState("");
  const ITEMS_PER_PAGE = 10
  const [currentPage,setCurrentPage] = useState(1)

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("users/teachers/");
      setTeachers(res.data);
    } catch (err) {
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
      setCurrentPage(1)
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const deleteTeacher = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this teacher?\nThis action cannot be undone."
    );
    if (!confirm) return;

    try {
      await axiosInstance.delete(`users/teachers/delete/${id}/`);
      fetchTeachers();
    } catch (err) {
      alert("Failed to delete teacher");
    }
  };

  const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE)

  const paginatedTeachers = teachers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
  <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">👨‍🏫</span>
              Teacher Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track all faculty members
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            + Add Teacher
          </button>
        </div>
      </div>

      {/* Add Teacher Form */}
      {showAdd && (
        <AddTeacherForm
          onCreated={() => {
            setShowAdd(false);
            fetchTeachers();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Edit Teacher Form */}
      {editingTeacher && (
        <EditTeacherForm
          teacher={editingTeacher}
          onUpdated={() => {
            setEditingTeacher(null);
            fetchTeachers();
          }}
          onCancel={() => setEditingTeacher(null)}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Loading teachers...</p>
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
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {teachers.length}
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
          {paginatedTeachers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
              <p className="text-gray-500 text-lg font-medium">
                No teachers found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Add your first teacher to get started
              </p>
            </div>
          ) : (
            <>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Qualification
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Joining Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {paginatedTeachers.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Profile */}
                        <td className="px-6 py-4">
                          <img
                            src={t.profile_image || "/avatar.png"}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {t.full_name || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm">{t.email}</p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm">
                            {t.phone || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 capitalize">
                            {t.gender || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm">
                            {t.qualification || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm">
                            {t.joining_date
                              ? new Date(t.joining_date).toLocaleDateString()
                              : "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            ₹ {t.salary}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setEditingTeacher(t)}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              onClick={() => deleteTeacher(t.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, teachers.length)}{" "}
                    of {teachers.length} teachers
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
            </>
          )}
        </div>
      )}
    </div>
);
}
