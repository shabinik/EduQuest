import React, { useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useNavigate,Link } from "react-router-dom"


function SuperAdminLogin() {
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username || !password) {
          setError("Please enter both email and password");
          return;
        }

        setError("")
        setLoading(true)
        try {
            const res = await axiosInstance.post("accounts/login/",{
                username,
                password,
            })
            // server sets HTTP-only cookies; response body contains user
            const user = res.data.user
        
            sessionStorage.setItem("user",JSON.stringify(user))
            
            if (user.role === "superadmin" || user.is_superuser) {
                navigate("/superadmin")
            }else{
                setError("Sorry, You are not a Super Admin")
            }
        } catch (err) {
            if (err.response?.status === 401) {
              setError("Invalid email or password");
            } else {
              setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false)
        }

    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
            <h2 className="text-xl mb-4">Super Admin Login</h2>
            {error && (
             <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
             </div>
            )}
            <label>Username</label>
            <input value={username} type="text" onChange={(e) => setUsername(e.target.value)} disabled={loading} className="w-full mb-3 p-2 border rounded"/>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="w-full mb-4 p-2 border rounded" />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded text-white transition
                ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-sm text-center mt-3">
              Not a Super Admin? <Link to="/" className="text-blue-500 underline">Back</Link>
            </p>
        </form>

    </div>
  )
}

export default SuperAdminLogin