import React, { useEffect,useState } from 'react'
import axiosInstance from '../api/axiosInstance';

function SuperAdminBilling() {
    const [data,setData] = useState([])
    const [loading, setLoading] = useState(false);

    const fetchBilling = async () => {
        setLoading(true)
        try {
            const res = await axiosInstance.get("superadmin/tenants/billing/")
            setData(res.data)
        } finally {
            setLoading(false)     
        }
    }
    
    useEffect(() =>{ fetchBilling() },[])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Schools Billing & Subscriptions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No schools found.</p>
      ) : (
        <table className="w-full bg-white rounded shadow border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 border">School Name</th>
              <th className="p-3 border">Admin Email</th>
              <th className="p-3 border">Subscription</th>
              <th className="p-3 border">Expiry</th>
              <th className="p-3 border">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 text-sm">
                <td className="p-3 border">{t.institute_name}</td>
                <td className="p-3 border">{t.admin_email}</td>
                <td className="p-3 border">
                  {t.subscription?.plan_name ?? "No subscription"}
                </td>
                <td className="p-3 border">
                  {t.subscription?.expiry
                    ? new Date(t.subscription.expiry).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3 border">
                  {t.payments?.length
                    ? t.payments[0].status
                    : "No Payments"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SuperAdminBilling