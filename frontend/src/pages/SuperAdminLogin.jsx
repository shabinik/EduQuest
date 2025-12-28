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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden">
            {/* School themed background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-white text-6xl">📚</div>
                <div className="absolute top-20 right-20 text-white text-5xl">🎓</div>
                <div className="absolute bottom-20 left-20 text-white text-5xl">✏️</div>
                <div className="absolute bottom-10 right-10 text-white text-6xl">📖</div>
                <div className="absolute top-1/2 left-1/4 text-white text-4xl">🎒</div>
                <div className="absolute top-1/3 right-1/3 text-white text-5xl">🏫</div>
                <div className="absolute bottom-1/3 right-1/4 text-white text-4xl">📝</div>
            </div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white text-center">Super Admin Access</h2>
                        <p className="text-indigo-100 text-sm text-center mt-1">Educational Management Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-8">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-5">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Username
                            </label>
                            <input
                                value={username}
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 ${loading
                                ? "bg-indigo-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                                }`}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-center text-gray-600">
                                Not a Super Admin?{" "}
                                <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
                                    Back to Home
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    Unauthorized access is prohibited and monitored
                </p>
            </div>
        </div>
  )
}

export default SuperAdminLogin