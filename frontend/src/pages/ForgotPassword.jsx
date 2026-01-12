import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [step, setStep] = useState(1)
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [timer, setTimer] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (timer === 0) return
        const interval = setInterval(() => {
            setTimer((t) => t - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [timer])

    const sendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setLoading(true)
        try {
            await axiosInstance.post("accounts/forgot-password/", { email })
            setStep(2)
            setTimer(60)
            toast.success("OTP sent to your email")
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to send OTP"
            )
        } finally {
            setLoading(false)
        }
    }

    const resendOtp = async () => {
        setLoading(true)
        try {
            await axiosInstance.post("accounts/forgot/resend-otp/", { email })
            setTimer(60)
            toast.success("OTP resent successfully")
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to resend OTP"
            )
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async () => {
        if (!otp) {
            toast.error("Please enter the OTP")
            return
        }

        if (!password) {
            toast.error("Please enter a new password")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setLoading(true)
        try {
            await axiosInstance.post("accounts/reset-password/", {
                email,
                otp,
                new_password: password,
            })
            toast.success("Password reset successful")
            setTimeout(() => {
                window.location.href = "/"
            }, 1200)
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Password reset failed"
            )
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
                    {/* STEP 1: Email Entry */}
                    {step === 1 ? (
                        <>
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
                                        🔑
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-white text-center">Forgot Password</h2>
                                <p className="text-indigo-100 text-sm text-center mt-1">
                                    Enter your email to receive a reset code
                                </p>
                            </div>

                            <div className="px-8 py-8">
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        We'll send a verification code to this email
                                    </p>
                                </div>

                                <button
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 ${loading
                                        ? "bg-indigo-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        "📧 Send Reset Code"
                                    )}
                                </button>

                                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-600">
                                        Remember your password?{" "}
                                        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition">
                                            Back to Login
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* STEP 2: Reset Password */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
                                        🔐
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-white text-center">Reset Password</h2>
                                <p className="text-indigo-100 text-sm text-center mt-1">
                                    Enter the code and your new password
                                </p>
                            </div>

                            <div className="px-8 py-8">
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mb-6">
                                    <p className="text-sm text-indigo-800">
                                        Code sent to <strong>{email}</strong>
                                    </p>
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        name="otp-code"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center text-2xl tracking-widest"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={"password"}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must be at least 6 characters long
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={"password"}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            placeholder="Re-enter new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                        />

                                    </div>
                                </div>

                                <button
                                    onClick={resetPassword}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 mb-4 ${loading
                                        ? "bg-green-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting...
                                        </span>
                                    ) : (
                                        "✓ Reset Password"
                                    )}
                                </button>

                                <div className="text-center">
                                    {timer > 0 ? (
                                        <p className="text-sm text-gray-600">
                                            Resend code in <span className="font-semibold text-indigo-600">{timer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={resendOtp}
                                            disabled={loading}
                                            className={`text-sm font-semibold transition ${loading
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-indigo-600 hover:text-indigo-700 hover:underline"
                                                }`}
                                        >
                                            {loading ? "Resending..." : "Resend Code"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    Need help? Contact support@eduquest.com
                </p>
            </div>
        </div>
    )
}

export default ForgotPassword