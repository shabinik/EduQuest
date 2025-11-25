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
    <div>
        <h1>Availble Plans</h1>

        {plans.map((p) => (
        <div key={p.id} style={{ border: "1px solid black", padding: 10 }}>
          <h3>{p.plan_name}</h3>
          <p>{p.duration_months} months</p>
          <p>₹ {p.price}</p>

          <button onClick={() => buy(p.id)}>Buy</button>
        </div>
      ))}
    </div>
  )
}

export default BuyPlan