import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useNavigate,Link } from 'react-router-dom'

function SuperAdminPlans() {
    const [plans,setPlans] = useState([])
    const navigate = useNavigate()
    const [loading,setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        axiosInstance.get("subscriptions/plans/")
        .then((res) => {
            if(mounted) setPlans(res.data)
        }).catch(err => {
            console.error(err)})
          .finally(() => {
            setLoading(false)
          })
        
        return () => { mounted = false}
    },[navigate])
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Subscription Plans</h1>
        <Link to="/superadmin/plans/create">
          <button style={{ padding: "8px 12px", background: "#10b981", color: "white", border: "none", borderRadius: 6 }}>
            Create New Plan
          </button>
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
  
        {loading && <p>Loading plans...</p>}

        {!loading && plans.length === 0 && <p>No plans yet.</p>}

        {!loading && plans.length > 0 && plans.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd",padding: 12, borderRadius: 8,marginBottom: 12 }}>
            <h3>{p.plan_name}</h3>
            <p>Duration: {p.duration_months} months</p>
            <p>Max Students: {p.max_students}</p>
            <p>Price: {p.price} {p.currency}</p>

            <div style={{ marginTop: 8 }}>
              <button onClick={() => navigate(`/superadmin/plans/edit/${p.id}`)} style={{ marginRight: 8 }}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default SuperAdminPlans