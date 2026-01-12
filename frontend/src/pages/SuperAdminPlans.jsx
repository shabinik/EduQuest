import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("subscriptions/plans/");
      setPlans(res.data);
    } catch (err) {
      setError("Failed to load plans. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const deletePlan = async (id) => {
    if (!window.confirm("Deactivate this plan? Existing schools won't be affected.")) return;

    try {
      await axiosInstance.delete(`subscriptions/plans/${id}/`);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate plan");
    }
  };

  // Helper to get plan color scheme
  const getPlanStyle = (index) => {
    const styles = [
      {
        gradient: "from-blue-500 to-indigo-600",
        badge: "bg-blue-100 text-blue-700",
        icon: "💼"
      },
      {
        gradient: "from-purple-500 to-pink-600",
        badge: "bg-purple-100 text-purple-700",
        icon: "⭐"
      },
      {
        gradient: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-100 text-emerald-700",
        icon: "🚀"
      },
      {
        gradient: "from-orange-500 to-red-600",
        badge: "bg-orange-100 text-orange-700",
        icon: "👑"
      }
    ];
    return styles[index % 4];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">💎</span>
              Subscription Plans Management
            </h1>
            <p className="text-gray-500 mt-1">
              Create and manage subscription plans for schools
            </p>
          </div>
          <Link to="/superadmin/plans/create">
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              + Create New Plan
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && !error && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Plans</p>
                <p className="text-3xl font-bold text-indigo-600">{plans.length}</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Plans</p>
                <p className="text-3xl font-bold text-green-600">{plans.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 mt-4">Loading plans...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
          <p className="font-semibold mb-2">Error Loading Plans</p>
          <p>{error}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg font-medium mb-2">No plans available</p>
          <p className="text-gray-400 text-sm mb-6">Create your first subscription plan to get started</p>
          <Link to="/superadmin/plans/create">
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              + Create First Plan
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const style = getPlanStyle(index);

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200"
              >
                {/* Plan Header */}
                <div className={`bg-gradient-to-r ${style.gradient} px-6 py-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="text-4xl">{style.icon}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                      Active
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2 relative z-10">
                    {plan.plan_name}
                  </h2>
                  <p className="text-white text-opacity-90 text-sm relative z-10">
                    {plan.description || "Premium subscription plan"}
                  </p>
                </div>

                {/* Plan Body */}
                <div className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-800">
                        ₹{plan.price}
                      </span>
                      <span className="text-gray-500 ml-2 text-base">
                        / {plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Per subscription period
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''} Duration
                        </p>
                        <p className="text-gray-500 text-sm">
                          Full access period
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          Up to {plan.max_students} Students
                        </p>
                        <p className="text-gray-500 text-sm">
                          Maximum capacity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          Email Support
                        </p>
                        <p className="text-gray-500 text-sm">
                          Priority assistance
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/superadmin/plans/edit/${plan.id}`)}
                      className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-black shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      ✏️ Edit Plan
                    </button>

                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="w-full py-3 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all duration-200"
                    >
                      🗑️ Deactivate Plan
                    </button>
                  </div>
                </div>

                {/* Plan Footer with ID */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Plan ID: <span className="font-mono font-semibold text-gray-700">{plan.id}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      {!loading && !error && plans.length > 0 && (
        <div className="mt-10 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-gray-700 font-semibold mb-1">Plan Management Info</p>
              <p className="text-gray-600 text-sm">
                Deactivating a plan will prevent new subscriptions but won't affect existing subscribers. 
                Schools with active subscriptions can continue using their current plan until it expires.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminPlans;