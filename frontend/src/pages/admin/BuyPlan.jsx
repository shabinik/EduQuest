import axios from 'axios'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { Link } from "react-router-dom";

function BuyPlan() {
    const [plans,setPlans] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [processingPlan,setProcessingPlan] = useState(null)

    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    const hasActiveSub = user?.has_active_subscription === true
    const expiryDate = user?.expiry_date
        ? new Date(user.expiry_date).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric"
          })
        : null

    useEffect(() => {
      if (hasActiveSub) return

      setLoading(true)
      setError('')
      axiosInstance.get("subscriptions/active-plans/")
        .then((res) => setPlans(res.data))
        .catch(() => setError("Failed to load plans. Please try again."))
        .finally(() => setLoading(false))
    },[])

    function downloadInvoice(paymentId) {
        return axiosInstance
            .get(`subscriptions/invoice/${paymentId}/`, { responseType: "blob" })
            .then((invoiceRes) => {
                const url  = window.URL.createObjectURL(
                    new Blob([invoiceRes.data], { type: "application/pdf" })
                )
                const link = document.createElement("a")
                link.href  = url
                link.setAttribute("download", `EduQuest_Invoice_${String(paymentId).padStart(5, "0")}.pdf`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
            })
    }

    function buy(planId){
        setProcessingPlan(planId)
        axiosInstance.post(`subscriptions/create-order/${planId}/`)
            .then((res) => {
                const { order, payment_id, razorpay_key } = res.data

                const options = {
                    key: razorpay_key,
                    amount: order.amount,
                    currency: order.currency,
                    name: "EduQuest",
                    order_id: order.id,
                    handler: function(response) {
                        axiosInstance.post("subscriptions/verify-payment/", {
                            payment_id: payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                        .then((res) => {
                            // 1. Update session
                            const user = JSON.parse(sessionStorage.getItem("user"))
                            sessionStorage.setItem("user", JSON.stringify({
                                ...user,
                                has_active_subscription: res.data.has_active_subscription,
                                expiry_date: res.data.expiry_date,
                            }))

                            toast.success("Payment Successful! Subscription Activated 🎉")

                            const paymentId = res.data.payment_id

                            // 2. Download invoice, THEN redirect
                            downloadInvoice(paymentId)
                                .catch(() => {
                                    toast.error("Invoice download failed. Re-download from your dashboard.")
                                })
                                .finally(() => {
                                    setProcessingPlan(null)
                                    window.location.href = "/admin"
                                })
                        })
                        .catch(() => {
                            toast.error("Payment verification failed. Please contact support.")
                            setProcessingPlan(null)
                        })
                    },
                    modal: {
                        ondismiss: function () {
                            setProcessingPlan(null)
                        }
                    }
                }

                const rz = new window.Razorpay(options)
                rz.open()
            })
            .catch(() => {
                toast.error("Failed to create order. Please try again.")
                setProcessingPlan(null)
            })
    }

    const getPlanStyle = (index) => {
        const styles = [
            {
                gradient: "from-blue-500 to-indigo-600",
                button: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            },
            {
                gradient: "from-purple-500 to-pink-600",
                button: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            },
            {
                gradient: "from-emerald-500 to-teal-600",
                button: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            }
        ]
        return styles[index % 3]
    }

    if (hasActiveSub) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                            💎
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Choose Your Perfect Plan</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Select the subscription plan that best fits your institution's needs and unlock powerful features
                    </p>
                </div>

                <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                        <div className="text-5xl mb-3 relative z-10">✅</div>
                        <h2 className="text-2xl font-bold relative z-10">You're All Set!</h2>
                        <p className="text-white text-opacity-90 text-sm mt-1 relative z-10">
                            Your subscription is currently active
                        </p>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-gray-600 text-base leading-relaxed mb-6">
                            You already have an active subscription plan. You can explore new plans once your current plan expires.
                        </p>
                        {expiryDate && (
                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-3 rounded-xl font-medium text-sm mb-6">
                                <span>📅</span>
                                <span>Expires on <strong>{expiryDate}</strong></span>
                            </div>
                        )}
                        <div className="border-t border-gray-100 pt-6">
  <Link
    to="/admin"
    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
  >
    🏠 Go to Dashboard
  </Link>
</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                        💎
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Choose Your Perfect Plan</h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Select the subscription plan that best fits your institution's needs and unlock powerful features
                </p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 mt-4">Loading available plans...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg text-center">
                    <p className="font-semibold mb-2">Error Loading Plans</p>
                    <p>{error}</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <p className="text-gray-500 text-lg font-medium">No plans available</p>
                    <p className="text-gray-400 text-sm mt-1">Please check back later</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {plans.map((p, index) => {
                        const style = getPlanStyle(index)
                        const isProcessing = processingPlan === p.id

                        return (
                            <div
                                key={p.id}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200"
                            >
                                <div className={`bg-gradient-to-r ${style.gradient} px-6 py-8 text-white relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                                    <h3 className="text-2xl font-bold mb-2 relative z-10">{p.plan_name}</h3>
                                    <p className="text-white text-opacity-90 text-sm relative z-10">
                                        {p.description || "Perfect for growing institutions"}
                                    </p>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="flex items-baseline">
                                            <span className="text-5xl font-bold text-gray-800">₹{p.price}</span>
                                            <span className="text-gray-500 ml-2 text-lg">
                                                / {p.duration_months} {p.duration_months === 1 ? 'month' : 'months'}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">One-time payment, no hidden fees</p>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {[
                                            {
                                                title: `${p.duration_months} Month${p.duration_months > 1 ? 's' : ''} Access`,
                                                sub: "Full platform access"
                                            },
                                            {
                                                title: p.max_students ? `Up to ${p.max_students} Students` : 'Unlimited Students',
                                                sub: "Add and manage students"
                                            },
                                            { title: "24/7 Support",       sub: "Priority customer service" },
                                            { title: "Regular Updates",    sub: "New features included" },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-start">
                                                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                    <span className="text-green-600 text-sm">✓</span>
                                                </div>
                                                <div>
                                                    <p className="text-gray-700 font-medium">{f.title}</p>
                                                    <p className="text-gray-500 text-sm">{f.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => buy(p.id)}
                                        disabled={isProcessing}
                                        className={`w-full py-4 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 ${
                                            isProcessing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : `bg-gradient-to-r ${style.button} hover:shadow-xl transform hover:-translate-y-0.5`
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            <>🛒 Subscribe to {p.plan_name}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default BuyPlan