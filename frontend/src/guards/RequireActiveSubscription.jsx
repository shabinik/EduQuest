import React from "react";
import { Navigate } from "react-router-dom";
import SubscriptionRequired from "../components/SubscriptionRequired";

export default function RequireActiveSubscription({ children }) {
  const raw = sessionStorage.getItem("user")
  if (!raw) return <Navigate to="/" />

  const user = JSON.parse(raw)

  if (user.has_active_subscription === false) {
    return <SubscriptionRequired role={user.role} />
  }

  return children
}

