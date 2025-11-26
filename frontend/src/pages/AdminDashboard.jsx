import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import BuyPlan from "./BuyPlan";

function AdminDashboard() {
    const [user,setUser] = useState(null)
    const [subs,setSubs] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () =>{
            try {
                const profileRes = await axiosInstance.get("accounts/profile/")
                setUser(profileRes.data)

                const subsRes = await axiosInstance.get("subscriptions/tenant-subscriptions/")
                setSubs(subsRes.data)
            } catch (err) {
                console.error(err)
                navigate('/admin/login')
            }finally{
                setLoading(false)
            }
        }
        fetchData()
    },[navigate])

    if (loading) return <div>Loading dashboard...</div>;

    const hasActiveSub = Array.isArray(subs) && subs.some((s) => s.is_active === true)
    
    if(!hasActiveSub) {
        return (
          <div>
            <h1 className="text-2xl mb-4">Dashboard</h1>
            {user && (
              <p className="mb-4">
                Welcome, <strong>{user.full_name || user.username}</strong>.{" "}
                Your institute has no active subscription yet.
              </p>
            )}

            <h2 className="text-xl mb-2">Choose a subscription plan to get started</h2>
            <BuyPlan />
          </div>
        )
      }

    const activeSub = subs.find((s) => s.is_active === true)

    return (
    <div>
      <h1 className="text-2xl mb-4">Dashboard</h1>

      {user && (
        <div className="mb-4">
          <p>
            <strong>Admin:</strong> {user.full_name || user.username}
          </p>
          <p>
            <strong>Institute:</strong> {user.tenant_name || "N/A"}
          </p>
        </div>
      )}

      {activeSub && (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h2 className="text-xl mb-2">Current Subscription</h2>
          <p>
            <strong>Plan:</strong> {activeSub.plan?.plan_name}
          </p>
          <p>
            <strong>Duration:</strong> {activeSub.plan?.duration_months} months
          </p>
          <p>
            <strong>Valid From:</strong>{" "}
            {new Date(activeSub.start_date).toLocaleDateString()}
          </p>
          <p>
            <strong>Valid Until:</strong>{" "}
            {new Date(activeSub.expiry_date).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Later you can add more dashboard sections here */}
    </div>
  );

    
}

export default AdminDashboard