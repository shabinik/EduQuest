import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

function AdminLogin() {
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const navigate = useNavigate()
    const [loading,setLoading] = useState(false)

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
            const user = res.data.user
            sessionStorage.setItem("user",JSON.stringify(user))

            if (user.role === "admin") {
                navigate("/admin")
            }else{
                setError("You are not a school admin")
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
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Admin Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm mb-1">Username (Email)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          placeholder="admin@example.com"
          disabled={loading}
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="********"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition
            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-4">
          Not a School Admin?{" "}
          <Link to="/" className="text-blue-500 underline">
            Back
          </Link>
        </p>

        <p className="text-sm text-gray-600 mt-3 text-center">
          Don’t have an account?{" "}
          <Link to="/admin/signup" className="text-blue-500 underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}

export default AdminLogin