import React from 'react'
import { Link } from "react-router-dom"


function SubscriptionRequired({role}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-[450px] text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-3">
          Subscription Required
        </h2>

        {role === "admin" ? (
          <>
            <p className="text-gray-700 mb-4">
              Your school does not have an active subscription plan.
            </p>
            <Link
              to="/admin/plans"
              className="bg-blue-600 text-white px-4 py-2 rounded block mx-auto w-fit"
            >
              View Plans & Subscribe
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-4">
              Your school does not have an active subscription plan.
              <br />
              Please contact your school administrator.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default SubscriptionRequired