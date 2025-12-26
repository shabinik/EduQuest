import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchools = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("superadmin/tenants/");
      setSchools(res.data);
    } catch (err) {
      setError("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const changeStatus = async (id, status) => {
    if (!window.confirm(`Change school status to "${status}"?`)) return;
    await axiosInstance.post(`superadmin/tenants/${id}/status/`, { status });
    fetchSchools();
  };

  const deleteSchool = async (id) => {
    if (!window.confirm("This will permanently delete the school. Continue?")) return;
    await axiosInstance.delete(`superadmin/tenants/${id}/delete/`);
    fetchSchools();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Registered Schools</h1>

      {loading ? (
        <p>Loading schools...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-3 text-left">Institute</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Current Plan</th>
                <th className="p-3">Expiry</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {schools.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No schools found
                  </td>
                </tr>
              )}

              {schools.map((s) => (
                <tr key={s.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-3">{s.institute_name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 text-center">{s.phone}</td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : s.status === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    {s.current_plan || "—"}
                  </td>

                  <td className="p-3 text-center">
                    {s.subscription_expiry
                      ? new Date(s.subscription_expiry).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-3 text-center space-x-2">
                    {s.status !== "active" && (
                      <button
                        onClick={() => changeStatus(s.id, "active")}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Activate
                      </button>
                    )}

                    {s.status !== "suspended" && (
                      <button
                        onClick={() => changeStatus(s.id, "suspended")}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Block
                      </button>
                    )}

                    <button
                      onClick={() => deleteSchool(s.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
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
