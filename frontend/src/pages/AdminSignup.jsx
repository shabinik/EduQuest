import React, { useEffect, useState } from 'react'
import { useNavigate,Link } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"

function AdminSignup() {
    const [step,setStep] = useState(1)
    const [form,setForm] = useState({
        institute_name: "",
        email: "",
        phone: "",
        full_name: "",
        password: "",
        confirm_password: "",
    })
    const [otp,setOtp] = useState("")
    const [message,setMessage] = useState("")
    const [timer, setTimer] = useState(60)
    const [resending, setResending] = useState(false)
    const [loading,setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
      if (step === 2 && timer > 0){
        const interval = setInterval(() => {
          setTimer((t) => t - 1)
        },1000)
        return () => clearInterval(interval)
      }
    },[step,timer])

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm((prev) => ({...prev, [name]:value}))
    }

    const submitSignup = async () => {
        setMessage("")
        setLoading(true)
        try {
            await axiosInstance.post("accounts/admin/signup/",form)
            setMessage("Signup success. Check your email for OTP.")
            setStep(2)
            setTimer(60)
        }catch(err){
            console.error(err)
            if (err.response && err.response.data){
                setMessage(JSON.stringify(err.response.data))
            }else{
                setMessage("Signup failed")
            }
        } finally {
          setLoading(false)
        }
    }

    const submitOtp = async () => {
        setMessage("")
        try{
            await axiosInstance.post("accounts/admin/verify-email/",{
                email:form.email,
                otp,
            })
            alert("Email verified! you can login now.")
            navigate("/admin/login")
        } catch (err) {
            console.error(err)
            if (err.response && err.response.data){
                setMessage(JSON.stringify(err.response.data))
            }else{
                setMessage("OTP  verification failed")
            }
        } finally {
          setLoading(false)
        }
    }

    const resendOtp = async () => {
      setResending(true)
      setMessage("")
      try{
        await axiosInstance.post("accounts/admin/resend-otp/",{
          email:form.email,
        })
        setMessage("OTP resent successfully. ")
        setTimer(60)
      } catch {
        setMessage("Failed to resend OTP.")
      } finally {
        setResending(false)
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
                    {/* STEP 1 — SIGNUP */}
                    {step === 1 && (
                        <>
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                                <h2 className="text-2xl font-bold text-white text-center">School Admin Signup</h2>
                                <p className="text-indigo-100 text-sm text-center mt-1">Create your school account</p>
                            </div>

                            <div className="px-8 py-8">
                                {message && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm">
                                        {message}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Institute Name
                                        </label>
                                        <input
                                            name="institute_name"
                                            placeholder="Enter institute name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Institute Email
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="school@example.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            name="phone"
                                            placeholder="Enter phone number"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Admin Full Name
                                        </label>
                                        <input
                                            name="full_name"
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Password
                                        </label>
                                        <input
                                            name="password"
                                            type="password"
                                            placeholder="Create a password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            name="confirm_password"
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={submitSignup}
                                    disabled={loading}
                                    className={`w-full mt-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 ${loading
                                        ? "bg-indigo-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                                        }`}
                                >
                                    {loading ? "Signing up..." : "Sign Up"}
                                </button>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-center text-gray-600">
                                        Already have an account?{" "}
                                        <Link to="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition">
                                            Login
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* STEP 2 — VERIFY OTP */}
                    {step === 2 && (
                        <>
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                                <h2 className="text-2xl font-bold text-white text-center">Verify Your Email</h2>
                                <p className="text-indigo-100 text-sm text-center mt-1">Enter the code we sent</p>
                            </div>

                            <div className="px-8 py-8">
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mb-6">
                                    <p className="text-sm text-indigo-800">
                                        We sent a 6-digit OTP to <strong>{form.email}</strong>
                                    </p>
                                </div>

                                {message && (
                                    <div className={`border-l-4 p-3 rounded mb-6 text-sm ${message.includes('success') 
                                        ? 'bg-green-50 border-green-500 text-green-700' 
                                        : 'bg-red-50 border-red-500 text-red-700'
                                    }`}>
                                        {message}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Enter OTP
                                    </label>
                                    <input
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center text-2xl tracking-widest"
                                        maxLength="6"
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    onClick={submitOtp}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 ${loading
                                        ? "bg-green-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                                        }`}
                                >
                                    {loading ? "Verifying..." : "Verify Email"}
                                </button>

                                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                    {timer > 0 ? (
                                        <p className="text-sm text-gray-600">
                                            Resend OTP in <span className="font-semibold text-indigo-600">{timer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={resendOtp}
                                            disabled={resending}
                                            className={`text-sm font-semibold transition ${resending
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-indigo-600 hover:text-indigo-700 hover:underline"
                                                }`}
                                        >
                                            {resending ? "Resending..." : "Resend OTP"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    By signing up, you agree to our Terms of Service
                </p>
            </div>
        </div>
  )
}

export default AdminSignup