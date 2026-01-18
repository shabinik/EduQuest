import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CreatePlan() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    plan_name: "",
    description: "",
    duration_months: "",
    price: "",
    currency: "INR",
    max_students: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Frontend validation (UX only)
  const validate = () => {
    if (!form.plan_name.trim()) {
      return "Plan name cannot be empty.";
    }
    if (Number(form.duration_months) <= 0) {
      return "Duration must be a positive number.";
    }
    if (Number(form.price) <= 0) {
      return "Price must be a positive amount.";
    }
    if (Number(form.max_students) <= 0) {
      return "Max students must be a positive number.";
    }
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await axiosInstance.post("subscriptions/plans/", {
        ...form,
        duration_months: Number(form.duration_months),
        price: Number(form.price),
        max_students: Number(form.max_students),
      });
      navigate("/superadmin/plans");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.plan_name ||
        "Failed to create plan";
      setError(
        typeof msg === "string" ? msg : JSON.stringify(msg)
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Create Subscription Plan</h1>
        <p className="text-gray-500 text-sm">
          Define pricing and limits for a new plan
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow p-8">
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Plan Name
            </label>
            <input
              name="plan_name"
              value={form.plan_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Gold, Platinum, Premium"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (months)
            </label>
            <input
              type="number"
              name="duration_months"
              value={form.duration_months}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Price (INR)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Students
            </label>
            <input
              type="number"
              name="max_students"
              value={form.max_students}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded px-3 py-2"
            placeholder="Describe features of this plan"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => navigate("/superadmin/plans")}
            className="px-6 py-2 rounded border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={saving}
            className="px-6 py-2 rounded bg-black text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
