import axios from 'axios'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

function BuyPlan() {
    const [plans,setPlans] = useState([])

    useEffect(() => {
        axiosInstance.get("subscriptions/active-plans")
        .then((res) => {
            setPlans(res.data)
        })
    },[])

    function buy(planId){
        axiosInstance.post(`subscriptions/create-order/${planId}/`)
        .then((res) => {
            const { order, subscription_id, payment_id, razorpay_key} = res.data

            const options = {
                key : razorpay_key,
                amount : order.amount,
                currency:order.currency, 
                name: "EduQuest",
                order_id:order.id,
                handler: function(response) {
                    axiosInstance.post("subscriptions/verify-payment/",{
                        payment_id:payment_id,
                        razorpay_order_id:response.razorpay_order_id,
                        razorpay_payment_id:response.razorpay_payment_id,
                        razorpay_signature:response.razorpay_signature,
                    })
                    .then(() => {
                        alert("Payment Success and Subscription Activated!")
                    })
                }
            }
            
            const rz = new window.Razorpay(options)
            rz.open()
        })
    }
  return (
    <div className="p-8 max-w-7xl mx-auto">
    {/* Header */}
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold">Available Plans</h1>
      <p className="text-gray-500 mt-2">
        Choose the best plan for your institution
      </p>
    </div>

    {/* Pricing Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl border shadow-sm p-6 flex flex-col"
        >
          {/* Plan Name */}
          <h3 className="text-xl font-semibold mb-1">
            {p.plan_name}
          </h3>

          <p className="text-gray-500 mb-4">
            {p.description || "Best plan for institutions"}
          </p>

          {/* Price */}
          <div className="text-4xl font-bold mb-1">
            ₹{p.price}
            <span className="text-base font-medium text-gray-500">
              {" "} / {p.duration_months} months
            </span>
          </div>

          <hr className="my-4" />

          {/* Features */}
          <ul className="space-y-3 text-sm text-gray-700 mb-6">
            <li className="flex items-center gap-2">
              ✅ {p.duration_months} Months Duration
            </li>
            <li className="flex items-center gap-2">
              ✅ Student Limit: {p.max_students || "Unlimited"}
            </li>
            <li className="flex items-center gap-2">
              ✅ Support Included
            </li>
          </ul>

          {/* Buy Button */}
          <button
            onClick={() => buy(p.id)}
            className="mt-auto py-2 rounded text-white font-medium bg-gray-900 hover:bg-black"
          >
            Buy {p.plan_name}
          </button>
        </div>
      ))}
    </div>
  </div>
  )
}

export default BuyPlan