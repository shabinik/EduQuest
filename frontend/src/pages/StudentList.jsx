// src/pages/StudentList.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

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
    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("users/students/create/", form);
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
        <input name="roll_number" placeholder="Roll No" onChange={handleChange} required className="border p-2 rounded" />

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

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Students</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Student
        </button>
      </div>

      {showAdd && (
        <AddStudentForm
          onCreated={() => {
            setShowAdd(false);
            fetchStudents();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3">Admission No</th>
                <th className="p-3">Class</th>
                <th className="p-3">Roll</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}

              {students.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{s.full_name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.admission_number}</td>
                  <td className="p-3">{s.class_id}</td>
                  <td className="p-3">{s.roll_number}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteStudent(s.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
