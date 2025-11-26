import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import axiosInstance from '../api/axiosInstance'

function SuperAdminDash() {
    const [user,setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get("accounts/profile/")
                setUser(res.data)
            } catch (err) {
                navigate("/login")
            }
        }
        fetchProfile()
    },[navigate])

    if (!user) return <div>Loading...</div>
  return (
    <div className="p-8">
        <h1 className="text-2xl mb-4">Super Admin Dashboard</h1>
      <div>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Full name:</strong> {user.full_name}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Tenant:</strong> {user.tenant_name || "System (SuperAdmin)"}</p>
      </div>
      <button onClick={async () => {
        await axiosInstance.post("accounts/logout/");
        sessionStorage.clear();
        navigate("/login");
      }} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  )
}

export default SuperAdminDash