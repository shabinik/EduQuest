import React from "react";
import { Navigate } from "react-router-dom";
import SubscriptionRequired from "../components/SubscriptionRequired";

export default function RequireActiveSubscription({ children }) {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // if no user logged in → redirect login
  if (!user) return <Navigate to="/" />;

  // backend returns tenant_status or subscription info — here expected stored in storage
  // boolean

  if (!user.has_active_subscription) {
    return (
      <SubscriptionRequired role={user.role} />
    );
  }

  return children;
}
