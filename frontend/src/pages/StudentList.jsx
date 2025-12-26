// src/pages/StudentList.jsx
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
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-3">Add Student</h3>

      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <input name="email" placeholder="Email" onChange={handleChange} required className="border p-2 rounded" />
        <input name="full_name" placeholder="Full Name" onChange={handleChange} required className="border p-2 rounded" />
        <input name="admission_number" placeholder="Admission No" onChange={handleChange} required className="border p-2 rounded" />
        <input name="class_id" placeholder="Class" onChange={handleChange} required className="border p-2 rounded" />
        <input name="roll_number" placeholder="Roll No" onChange={handleChange} inputMode="numeric" required className="border p-2 rounded" />

        <div className="col-span-2 flex gap-2 mt-2">
          <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? "Creating..." : "Create"}
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


// Edit Student

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
      await axiosInstance.put(
        `users/students/update/${student.id}/`,
        form
      );
      onUpdated();
    } catch (err) {
      setError("Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Edit Student</h3>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          className="input"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="input"
        />

        <input
          name="guardian_name"
          value={form.guardian_name}
          onChange={handleChange}
          placeholder="Guardian Name"
          className="input"
        />
        <input
          name="guardian_contact"
          value={form.guardian_contact}
          onChange={handleChange}
          placeholder="Guardian Contact"
          className="input"
        />

        <input
          name="class_id"
          value={form.class_id}
          onChange={handleChange}
          placeholder="Class"
          className="input"
        />
        <input
          name="roll_number"
          value={form.roll_number}
          onChange={handleChange}
          placeholder="Roll Number"
          className="input"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

//Student List

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null)
  const [error, setError] = useState("");
  const navigate = useNavigate()
  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)

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
      setCurrentPage(1)
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await axiosInstance.delete(`users/students/delete/${id}/`);
      fetchStudents();
    } catch {
      alert("Failed to delete student");
    }
  };

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE)

  const paginatedStudents = students.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
  <div>
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-semibold">Students</h1>
      <button
        onClick={() => setShowAdd(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add Student
      </button>
    </div>

    {/* Add Student */}
    {showAdd && (
      <AddStudentForm
        onCreated={() => {
          setShowAdd(false);
          fetchStudents();
        }}
        onCancel={() => setShowAdd(false)}
      />
    )}

    {/* Edit Student */}
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
      <div>Loading...</div>
    ) : error ? (
      <div className="text-red-600">{error}</div>
    ) : (
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Profile</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Class</th>
              <th className="p-3">Roll</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              paginatedStudents.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50 text-sm">
                  {/* Profile */}
                  <td className="p-3">
                    <img
                      src={s.profile_image || "/avatar.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="Profile"
                    />
                  </td>

                  <td className="p-3">{s.full_name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 text-center">{s.class_id}</td>
                  <td className="p-3 text-center">{s.roll_number}</td>

                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                    >
                      View
                    </button>

                    <button
                      onClick={() => setEditingStudent(s)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteStudent(s.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    )}
  </div>
);
}
