import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function EditPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get(`subscriptions/plans/${id}/`)
      .then((res) => setForm(res.data))
      .catch(() => navigate("/superadmin/plans"));
  }, [id, navigate]);

  if (!form) {
    return <div className="p-10">Loading plan...</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await axiosInstance.put(`subscriptions/plans/${id}/`, form);
      navigate("/superadmin/plans");
    } catch (err) {
      setError("Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Edit Subscription Plan</h1>
        <p className="text-gray-500 text-sm">
          Update plan details and save changes
        </p>
      </div>

      {/* Form Card */}
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
              placeholder="Plan Name"
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
              Price
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
            value={form.description || ""}
            onChange={handleChange}
            rows="4"
            className="w-full border rounded px-3 py-2"
            placeholder="Describe this plan"
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
            onClick={save}
            disabled={saving}
            className="px-6 py-2 rounded bg-black text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
