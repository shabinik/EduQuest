import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function EditPlan(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    axiosInstance.get(`subscriptions/plans/${id}/`)
    .then(res => setForm(res.data))
    .catch(() => navigate("/superadmin/plans"));
  }, [id, navigate]);

  if(!form) return <div>Loading...</div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    await axiosInstance.put(`subscriptions/plans/${id}/`, form);
    alert("Updated");
    navigate("/superadmin/plans");
  };

  return (
    <div>
      <h1>Edit Plan</h1>
      <input name="plan_name" value={form.plan_name} placeholder="Plan Name" onChange={handleChange}/>
      <input name="duration_months" value={form.duration_months} placeholder="Duration Months" onChange={handleChange} />
      <input name="price" value={form.price} placeholder="Price" onChange={handleChange} />
      <input name="max_students" value={form.max_students} placeholder="Max students" onChange={handleChange}/>
      <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} />
      <button onClick={save}>Save</button>
    </div>
  );
}
