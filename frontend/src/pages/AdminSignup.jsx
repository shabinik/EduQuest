import React, { useState } from 'react'
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
    const navigate = useNavigate()

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm((prev) => ({...prev, [name]:value}))
    }

    const submitSignup = async () => {
        setMessage("")
        try {
            await axiosInstance.post("accounts/admin/signup/",form)
            setMessage("Signup success. Check your email for OTP.")
            setStep(2)
        }catch(err){
            console.error(err)
            if (err.response && err.response.data){
                setMessage(JSON.stringify(err.response.data))
            }else{
                setMessage("signup failed")
            }
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
        }
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        {step === 1 && (
          <>
            <h2 className="text-xl mb-4">School Admin Signup</h2>
            {message && <div className="mb-2 text-red-500 text-sm">{message}</div>}

            <input
              name="institute_name"
              placeholder="Institute Name"
              className="w-full mb-2 p-2 border"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Institute Email"
              className="w-full mb-2 p-2 border"
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone"
              className="w-full mb-2 p-2 border"
              onChange={handleChange}
            />
            <input
              name="full_name"
              placeholder="Admin Full Name"
              className="w-full mb-2 p-2 border"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full mb-2 p-2 border"
              onChange={handleChange}
            />
            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              className="w-full mb-4 p-2 border"
              onChange={handleChange}
            />
            <button
              onClick={submitSignup}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Sign Up
            </button>
            <p className="text-sm text-gray-600 mt-4 text-center">
                    Already Have an Account?{" "}
                    <Link to="/admin/login" className="text-blue-500 underline">
                        Login
                    </Link>
                </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl mb-4">Verify Email</h2>
            <p className="mb-2 text-sm text-gray-600">
              We sent an OTP to <strong>{form.email}</strong>
            </p>
            {message && <div className="mb-2 text-red-500 text-sm">{message}</div>}
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full mb-4 p-2 border"
            />
            <button
              onClick={submitOtp}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Verify
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminSignup