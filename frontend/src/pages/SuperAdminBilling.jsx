import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance';

function SuperAdminBilling() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchBilling = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await axiosInstance.get("superadmin/tenants/billing/")
            setData(res.data)
        } catch (err) {
            setError("Failed to load billing data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchBilling() }, [])

    // Filter and search logic
    const filteredData = data.filter((item) => {
        const matchesSearch = item.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.admin_email.toLowerCase().includes(searchTerm.toLowerCase());
        const paymentStatus = item.payments?.length ? item.payments[0].status : "no_payment";
        const matchesFilter = filterStatus === "all" || paymentStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    // Stats calculation
    const stats = {
        total: data.length,
        subscribed: data.filter(d => d.subscription).length,
        expired: data.filter(d => d.subscription && new Date(d.subscription.expiry) < new Date()).length,
        paid: data.filter(d => d.payments?.length && d.payments[0].status === "paid").length,
    };

    // Helper function to get payment status styling
    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case "success":
            case "completed":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "failed":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Check if subscription is expired
    const isExpired = (expiryDate) => {
        return expiryDate && new Date(expiryDate) < new Date();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="text-3xl mr-3">💳</span>
                    Billing & Subscriptions
                </h1>
                <p className="text-gray-500 mt-1">
                    Monitor all school subscriptions and payment status
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
                            <div className="text-5xl opacity-50">🏫</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm mb-1">Subscribed</p>
                                <p className="text-4xl font-bold">{stats.subscribed}</p>
                            </div>
                            <div className="text-5xl opacity-50">✅</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm mb-1">Expired</p>
                                <p className="text-4xl font-bold">{stats.expired}</p>
                            </div>
                            <div className="text-5xl opacity-50">⏰</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm mb-1">Paid</p>
                                <p className="text-4xl font-bold">{stats.paid}</p>
                            </div>
                            <div className="text-5xl opacity-50">💰</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            {!loading && !error && data.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search Schools
                            </label>
                            <input
                                type="text"
                                placeholder="Search by school name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Filter */}
                        <div className="md:w-64">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            >
                                <option value="all">All Status</option>
                                <option value="success">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="no_payment">No Payment</option>
                            </select>
                        </div>
                    </div>

                    {searchTerm || filterStatus !== "all" ? (
                        <div className="mt-4 text-sm text-gray-600">
                            Showing {filteredData.length} of {data.length} schools
                        </div>
                    ) : null}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 mt-4">Loading billing data...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
                    <p className="font-semibold mb-2">Error Loading Data</p>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        School Details
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Subscription Plan
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Expiry Date
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <div className="text-gray-400 text-6xl mb-4">🔍</div>
                                            <p className="text-gray-500 text-lg font-medium">
                                                {searchTerm || filterStatus !== "all"
                                                    ? "No schools match your search"
                                                    : "No billing data found"}
                                            </p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {searchTerm || filterStatus !== "all"
                                                    ? "Try adjusting your filters"
                                                    : "Billing information will appear here"}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((t) => {
                                        const expired = isExpired(t.subscription?.expiry);
                                        const paymentStatus = t.payments?.length ? t.payments[0].status : "No Payments";

                                        return (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                {/* School Details */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-gray-800">
                                                            {t.institute_name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <span className="mr-2">📧</span>
                                                            {t.admin_email}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Subscription Plan */}
                                                <td className="px-6 py-4 text-center">
                                                    {t.subscription?.plan_name ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                                                            {t.subscription.plan_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No subscription</span>
                                                    )}
                                                </td>

                                                {/* Expiry Date */}
                                                <td className="px-6 py-4 text-center">
                                                    {t.subscription?.expiry ? (
                                                        <div className="space-y-1">
                                                            <p className={`text-sm font-semibold ${expired ? 'text-red-600' : 'text-gray-800'}`}>
                                                                {new Date(t.subscription.expiry).toLocaleDateString()}
                                                            </p>
                                                            {expired && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                                    Expired
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>

                                                {/* Payment Status */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusStyle(paymentStatus)}`}>
                                                        {paymentStatus === "success" && "✓ "}
                                                        {paymentStatus === "pending" && "⏳ "}
                                                        {paymentStatus === "failed" && "✗ "}
                                                        {paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
                                    {filteredData.length} schools
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
            {!loading && !error && data.length > 0 && (
                <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                        <span className="text-2xl">ℹ️</span>
                        <div>
                            <p className="text-gray-700 font-semibold mb-1">Billing Information</p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• <strong>Success:</strong> Payment completed successfully</li>
                                <li>• <strong>Pending:</strong> Payment is being processed</li>
                                <li>• <strong>Failed:</strong> Payment failed or was declined</li>
                                <li>• <strong>Expired:</strong> Subscription has expired and needs renewal</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SuperAdminBilling