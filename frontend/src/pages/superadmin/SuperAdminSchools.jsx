import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
    try {
      await axiosInstance.post(`superadmin/tenants/${id}/status/`, { status });
      fetchSchools();
    } catch (err) {
      toast.error("Failed to change status");
    }
  };

  const deleteSchool = async (id) => {
    if (!window.confirm("This will permanently delete the school. Continue?")) return;
    try {
      await axiosInstance.delete(`superadmin/tenants/${id}/delete/`);
      fetchSchools();
    } catch (err) {
      toast.error("Failed to delete school");
    }
  };

  // Filter and search logic
  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || school.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Stats calculation
  const stats = {
    total: schools.length,
    active: schools.filter(s => s.status === "active").length,
    suspended: schools.filter(s => s.status === "suspended").length,
    inactive: schools.filter(s => s.status === "inactive").length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="text-3xl mr-3">🏫</span>
          Registered Schools
        </h1>
        <p className="text-gray-500 mt-1">
          Manage all registered educational institutions
        </p>
      </div>

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Schools</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="text-5xl opacity-50">🏢</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Active</p>
                <p className="text-4xl font-bold">{stats.active}</p>
              </div>
              <div className="text-5xl opacity-50">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Suspended</p>
                <p className="text-4xl font-bold">{stats.suspended}</p>
              </div>
              <div className="text-5xl opacity-50">🚫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm mb-1">Inactive</p>
                <p className="text-4xl font-bold">{stats.inactive}</p>
              </div>
              <div className="text-5xl opacity-50">⏸️</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {!loading && !error && schools.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Schools
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Filter */}
            <div className="md:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="all">All Schools</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {searchTerm || filterStatus !== "all" ? (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredSchools.length} of {schools.length} schools
            </div>
          ) : null}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Loading schools...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
          <p className="font-semibold mb-2">Error Loading Schools</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Institute
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedSchools.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-6xl mb-4">🔍</div>
                      <p className="text-gray-500 text-lg font-medium">
                        {searchTerm || filterStatus !== "all" 
                          ? "No schools match your search"
                          : "No schools found"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your filters"
                          : "Schools will appear here once registered"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      {/* Institute */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {s.institute_name}
                        </p>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-2">📧</span>
                            {s.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-2">📞</span>
                            {s.phone}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            s.status === "active"
                              ? "bg-green-100 text-green-700"
                              : s.status === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              s.status === "active"
                                ? "bg-green-500"
                                : s.status === "suspended"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          {s.status}
                        </span>
                      </td>

                      {/* Subscription */}
                      <td className="px-6 py-4">
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {s.current_plan || "No Plan"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.subscription_expiry ? (
                              <>
                                Expires:{" "}
                                {new Date(s.subscription_expiry).toLocaleDateString()}
                              </>
                            ) : (
                              "—"
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {s.status !== "active" && (
                            <button
                              onClick={() => changeStatus(s.id, "active")}
                              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm hover:shadow-md"
                              title="Activate School"
                            >
                              ✅ Activate
                            </button>
                          )}

                          {s.status !== "suspended" && (
                            <button
                              onClick={() => changeStatus(s.id, "suspended")}
                              className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm hover:shadow-md"
                              title="Suspend School"
                            >
                              ⚠️ Suspend
                            </button>
                          )}

                          <button
                            onClick={() => deleteSchool(s.id)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm hover:shadow-md"
                            title="Delete School"
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
          {filteredSchools.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredSchools.length)} of{" "}
                  {filteredSchools.length} schools
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

      {/* Info Section */}
      {!loading && !error && schools.length > 0 && (
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-gray-700 font-semibold mb-1">School Management Guidelines</p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• <strong>Active:</strong> School has full access to the platform</li>
                <li>• <strong>Suspended:</strong> Temporarily blocked from accessing the platform</li>
                <li>• <strong>Delete:</strong> Permanently removes the school and all associated data</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}