import React, { useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'

function CreatePlan() {
    const [form,setForm] = useState({
        plan_name : "",
        description: "",
        duration_months: 1,
        price: 0,
        currency: "INR",
        max_students: 0,
    })
    const navigate = useNavigate()

    const handleChange = (e) => {
      const { name,value} = e.target
      setForm(prev => ({ ...prev,[name]:value}))
    }

    const submit = async() => {
        try {
            await axiosInstance.post("subscriptions/plans/",form)
                alert("plan created")
                navigate("/superadmin/plans")
            
        }catch (err) {
            console.error(err);
            alert("Failed to create plan")
        }
    }            
        
    
  return (
    <div>
      <h1>Create Plan</h1>
      <div style={{ maxWidth: 600 }}>
        <input name="plan_name" placeholder="Plan name" onChange={handleChange}/>
        <input name="duration_months" placeholder="Duration (months)" onChange={handleChange} type="number" />
        <input name="price" placeholder="Price" onChange={handleChange} type="number" />
        <input name="max_students" placeholder="Max students" onChange={handleChange} type="number" />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <button onClick={submit}>Save</button>
      </div>
    </div>
  )
}

export default CreatePlan