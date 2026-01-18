import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {useNavigate} from "react-router-dom"
import toast from "react-hot-toast";


export function CreateClassForm({ onCreated, onCancel }){

    const [form,setForm] = useState({
        name:"",
        division: "",
        class_teacher: "",
        max_student: 30,
        academic_year: "2025-2026",
    })
    const [teachers,setTeachers] = useState([])
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState("")

    const extractErrorMessage = (error) => {
      const data = error.response?.data;
      if (!data) return "Failed to create Class, Something went wrong";

      if (typeof data === "string") return data;

      const firstKey = Object.keys(data)[0];
      return Array.isArray(data[firstKey])
        ? data[firstKey][0]
        : data[firstKey];
    };


    useEffect(() => {
        axiosInstance.get("users/teachers/")
          .then(res => setTeachers(res.data))
          .catch(() => toast.error("Failed to load teachers"));
    },[])

    const handleChange = (e) => {
        setForm((p) => ({...p, [e.target.name]: e.target.value }))
    }

    const submit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        if (!form.name.trim()) {
          setError("Class name required");
          setLoading(false);
          return;
        }
        
        if (!form.division.trim()) {
          setError("Class Division required");
          setLoading(false);
          return;
        }

        try {
            await axiosInstance.post("classroom/create/class/", {
              ...form,
              name: form.name.trim(),
              division: form.division.trim(),
              class_teacher: form.class_teacher || null,
              max_student: Number(form.max_student),
            })
            toast.success("Class created successfully.")
            onCreated()
        } catch (error) {
            toast.error(extractErrorMessage(error) || "Failed to create class")
        } finally {
            setLoading(false)
        }

    }

    return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">➕</span>
          Create New Class
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., 10"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Division <span className="text-red-500">*</span>
            </label>
            <input
              name="division"
              value={form.division}
              onChange={handleChange}
              placeholder="e.g., A"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class Teacher (Optional)
            </label>
            <select
              name="class_teacher"
              value={form.class_teacher}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Students
            </label>
            <input
              type="number"
              name="max_student"
              value={form.max_student}
              onChange={handleChange}
              min="1"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              name="academic_year"
              value={form.academic_year}
              onChange={handleChange}
              placeholder="e.g., 2025-2026"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
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
            {loading ? "Creating..." : "✓ Create Class"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            ✕ Cancel
          </button>
        </div>
      </form>
    </div>
  )
}


export function EditClassForm({ cls, onUpdated, onCancel}){

  const [form, setForm] = useState({
    name: cls.name,
    division: cls.division,
    class_teacher: cls.class_teacher || "",
    max_student: cls.max_student,
    academic_year: cls.academic_year,
  })
  const [teachers,setTeachers] = useState([])
  const [loading,setLoading] = useState(false)

  const extractErrorMessage = (error) => {
      const data = error.response?.data;
      if (!data) return "Failed to update Class, Something went wrong";

      if (typeof data === "string") return data;

      const firstKey = Object.keys(data)[0];
      return Array.isArray(data[firstKey])
        ? data[firstKey][0]
        : data[firstKey];
    };

  useEffect(() => {
    axiosInstance.get("users/teachers/")
      .then(res => setTeachers(res.data))
      .catch(() => toast.error("Failed to load teachers"));
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const save = async () => {
    setLoading(true)
    try {
      await axiosInstance.put(`classroom/update/class/${cls.id}/`,{
        ...form,
        class_teacher: form.class_teacher || null,
        max_student: Number(form.max_student),
      })
      toast.success("Class updated successfully")
      onUpdated()
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="text-2xl mr-2">✏️</span>
        Edit Class Details
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Division
            </label>
            <input
              name="division"
              value={form.division}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class Teacher
            </label>
            <select
              name="class_teacher"
              value={form.class_teacher}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Students
            </label>
            <input
              type="number"
              name="max_student"
              value={form.max_student}
              onChange={handleChange}
              min="1"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              name="academic_year"
              value={form.academic_year}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
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
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}



export default function ClassList() {

  const [classes,setClasses] = useState([])
  const [showAdd,setShowAdd] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [loading,setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const navigate = useNavigate()

  const ITEMS_PER_PAGE = 10

  const fetchClasses = async () => {
    setLoading(true)
    try{
      const res = await axiosInstance.get("classroom/classes/")
      setClasses(res.data)
    } catch (error) {
      toast.error("Failed to load classes")
    } finally {
      setLoading(false)
      setCurrentPage(1)
    }
  }

  useEffect (() => {
    fetchClasses()
  },[])

  const deleteClass = async (id) => {
    if (!window.confirm("Deactivate this class? This action cannot be undone.")) return
    try {
      await axiosInstance.delete(`classroom/delete/class/${id}/`)
      toast.success("Class Deactivated Successfully")
      fetchClasses()
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to deactivate class"
      toast.error(message)
    }
  }

  const totalPages = Math.ceil(classes.length / ITEMS_PER_PAGE)
  const paginatedClasses = classes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">🎓</span>
              Class Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all classes and divisions
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            + Create Class
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border border-indigo-100">
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-3xl font-bold text-indigo-600">{classes.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Form */}
      {showAdd && (
        <CreateClassForm
          onCreated={() => {
            setShowAdd(false);
            fetchClasses();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Edit Class Form */}
      {editingClass && (
        <EditClassForm
          cls={editingClass}
          onUpdated={() => {
            setEditingClass(null);
            fetchClasses();
          }}
          onCancel={() => setEditingClass(null)}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Loading classes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class & Division
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class Teacher
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedClasses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-6xl mb-4">📚</div>
                      <p className="text-gray-500 text-lg font-medium">No classes found</p>
                      <p className="text-gray-400 text-sm mt-1">Create your first class to get started</p>
                    </td>
                  </tr>
                ) : (
                  paginatedClasses.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {c.name} - {c.division}
                          </p>
                          {c.class_teacher_name && (
                            <p className="text-sm text-gray-500">
                              Teacher: {c.class_teacher_name}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                          {c.academic_year}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                          {c.current_students} / {c.max_student} students
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                          {c.teacher}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">

                          <button
                            onClick={() => navigate(`/admin/classes/${c.id}`)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold"
                          >
                            👁 View
                          </button>


                          <button
                            onClick={() => setEditingClass(c)}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => deleteClass(c.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            🗑️ Deactivate
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
          {paginatedClasses.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, classes.length)} of{" "}
                  {classes.length} classes
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
  )
}
