import React, { use, useState } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

function AdminLogin() {
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
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
            console.error(err)
            setError("Invalid credentials")
        }
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96">
                <h2 className="text-xl mb-4">Admin Login</h2>
                {error && <div className="text-red-600 mb-2">{error}</div>}

                <label>Username (email)</label>
                <input
                    value={username}
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-2 p-2 border"
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 p-2 border"
                />

                <button className="w-full bg-blue-600 text-white py-2 rounded">
                    Login
                </button>

                {/* Signup link */}
                <p className="text-sm text-gray-600 mt-4 text-center">
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