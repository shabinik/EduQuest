// src/pages/TeacherList.jsx
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
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-medium mb-2">Add Teacher</h3>
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
        <input name="email" value={form.email} onChange={handleChange} required placeholder="Email" className="p-2 border rounded" />
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" className="p-2 border rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="p-2 border rounded" />
        <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" className="p-2 border rounded" />
        <input name="joining_date" type="date" value={form.joining_date || ""} onChange={handleChange} placeholder='Joining date' className="p-2 border rounded" />
        <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" type="number" className="p-2 border rounded" />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>

          <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
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
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-medium mb-2">Edit Teacher</h3>
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Full name"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Phone"
        />
        <input
          name="qualification"
          value={form.qualification}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Qualification"
        />
        <input
          type="date"
          name="joining_date"
          value={form.joining_date}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="salary"
          value={form.salary}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Salary"
        />

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
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

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("users/teachers/");
      setTeachers(res.data);
    } catch (err) {
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
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

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Teachers</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Teacher
        </button>
      </div>
      {showAdd && (
        <AddTeacherForm
          onCreated={() => {
            setShowAdd(false);
            fetchTeachers();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

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

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : teachers.length === 0 ? (
        <p className="text-gray-500">No teachers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-3 border">Profile</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Gender</th>
                <th className="p-3 border">Qualification</th>
                <th className="p-3 border">Joining Date</th>
                <th className="p-3 border">Salary</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 text-sm">

                  {/* Profile Image */}
                  <td className="p-3 border">
                    <img
                      src={t.profile_image || "/avatar.png"}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>

                  <td className="p-3 border">{t.full_name || "—"}</td>
                  <td className="p-3 border">{t.email}</td>
                  <td className="p-3 border">{t.phone || "—"}</td>
                  <td className="p-3 border capitalize">{t.gender || "—"}</td>

                  <td className="p-3 border">{t.qualification || "—"}</td>

                  <td className="p-3 border">
                    {t.joining_date
                      ? new Date(t.joining_date).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-3 border">₹ {t.salary}</td>

                  <td className="p-3 border text-center space-x-2">
                    <button
                      onClick={() => setEditingTeacher(t)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTeacher(t.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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
