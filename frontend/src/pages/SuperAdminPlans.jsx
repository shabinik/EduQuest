import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("subscriptions/plans/");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan permanently?")) return;
    try {
      await axiosInstance.delete(`subscriptions/plans/${id}/`);
      fetchPlans();
    } catch {
      alert("Failed to delete plan");
    }
  };

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold">Subscription Plans</h1>

        <Link to="/superadmin/plans/create">
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">
            + Create New Plan
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Loading plans...</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-gray-500">No plans available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col shadow-sm"
            >
              {/* Title */}
              <h2 className="text-xl font-semibold mb-1">
                {plan.plan_name}
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                {plan.description || "Subscription plan details"}
              </p>

              {/* Price */}
              <div className="text-4xl font-bold mb-6">
                ₹{plan.price}
                <span className="text-base font-normal text-gray-500">
                  {" "}
                  / year
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 text-sm mb-8">
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span>
                  {plan.duration_months} Months Duration
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span>
                  Max {plan.max_students} Students
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span>
                  Email Support
                </li>
              </ul>

              {/* Actions */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={() =>
                    navigate(`/superadmin/plans/edit/${plan.id}`)
                  }
                  className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900"
                >
                  Edit Plan
                </button>

                <button
                  onClick={() => deletePlan(plan.id)}
                  className="w-full border border-red-500 text-red-600 py-2 rounded-lg hover:bg-red-50"
                >
                  Delete Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuperAdminPlans;
