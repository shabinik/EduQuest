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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">

        {/* STEP 1 — SIGNUP */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-4">School Admin Signup</h2>

            {message && <p className="text-red-600 text-sm mb-2">{message}</p>}

            <input name="institute_name" placeholder="Institute Name"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange} />

            <input name="email" type="email" placeholder="Institute Email"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange} />

            <input name="phone" placeholder="Phone"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange} />

            <input name="full_name" placeholder="Admin Full Name"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange} />

            <input name="password" type="password" placeholder="Password"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange} />

            <input name="confirm_password" type="password" placeholder="Confirm Password"
              className="w-full mb-4 p-2 border rounded"
              onChange={handleChange} />

            <button
              onClick={submitSignup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Already have an account?{" "}
              <Link to="/admin/login" className="text-blue-500 underline">
                Login
              </Link>
            </p>
          </>
        )}

        {/* STEP 2 — VERIFY OTP */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Verify Email</h2>

            <p className="text-sm text-gray-600 mb-3">
              We sent a 6-digit OTP to <strong>{form.email}</strong>
            </p>

            {message && <p className="text-red-600 text-sm mb-2">{message}</p>}

            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full mb-4 p-2 border rounded"
            />

            <button
              onClick={submitOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-3"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <div className="text-center text-sm">
              {timer > 0 ? (
                <span className="text-gray-500">
                  Resend OTP in {timer}s
                </span>
              ) : (
                <button
                  onClick={resendOtp}
                  disabled={resending}
                  className="text-blue-600 underline"
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminSignup