import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

// Student Bills List Component
const StudentBillsList = ({ onPayBill }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid, overdue

  useEffect(() => {
    fetchMyBills();
  }, []);

  const fetchMyBills = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('finance/student/bills/');
      setBills(response.data);
    } catch (error) {
      toast.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      overdue: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    return bill.status === filter;
  });

  const totalPending = bills.filter(b => b.status === 'pending' || b.status === 'overdue')
    .reduce((sum, b) => sum + parseFloat(b.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Total Bills</p>
          <p className="text-2xl font-bold">{bills.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold">{bills.filter(b => b.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold">{bills.filter(b => b.status === 'paid').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-600">
          <p className="text-sm text-gray-600">Total Pending Amount</p>
          <p className="text-2xl font-bold">₹{totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Bills
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded ${filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No bills found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{bill.fee_type}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                      {bill.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Amount:</span> ₹{bill.amount}
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span> {new Date(bill.due_date).toLocaleDateString()}
                    </div>
                    {bill.paid_date && (
                      <div>
                        <span className="font-medium">Paid On:</span> {new Date(bill.paid_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  {(bill.status === 'pending' || bill.status === 'overdue') && (
                    <button
                      onClick={() => onPayBill(bill)}
                      className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  {bill.status === 'paid' && (
                    <span className="inline-block px-6 py-2 bg-gray-100 text-gray-600 rounded">
                      ✓ Paid
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



// Payment Component
const PaymentComponent = ({ bill, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setProcessing(false);
        return;
      }

      // Create order
      const orderResponse = await axiosInstance.post(`finance/student/bills/${bill.id}/create-order/`);
      const orderData = orderResponse.data;

      // Razorpay options
      const options = {
        key: orderData.razorpay_key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'School Fee Payment',
        description: `${bill.fee_type} - ${bill.admission_number}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axiosInstance.post('finance/student/bills/verify-payment/', {
              bill_id: bill.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              onSuccess(verifyResponse.data);
            } else {
              setError('Payment verification failed. Please contact support.');
              toast.error('Payment verification failed. Please contact support.')
            }
          } catch (err) {
            setError('Payment verification failed: ' + (err.response?.data?.error || err.message));
            toast.error('Payment verification failed: ' + (err.response?.data?.error || err.message))
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: bill.student_name,
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setError('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      setError('Failed to initiate payment: ' + (err.response?.data?.error || err.message));
      toast.error('Failed to initiate payment: ' + (err.response?.data?.error || err.message))
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Payment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={processing}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Fee Type:</span>
                <span className="font-semibold">{bill.fee_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admission Number:</span>
                <span className="font-semibold">{bill.admission_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-semibold">{new Date(bill.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600 font-medium">Amount to Pay:</span>
                <span className="font-bold text-lg text-blue-600">₹{bill.amount}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">{data.message}</p>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm text-gray-600">Receipt Number</p>
            <p className="font-mono font-bold text-lg">{data.receipt_number}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};



// Main Student Fee Management Component
export default function StudentFeeManagement() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setShowPayment(true);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setSelectedBill(null);
  };

  const handlePaymentSuccess = (data) => {
    setShowPayment(false);
    setSelectedBill(null);
    setSuccessData(data);
    setRefreshKey(prev => prev + 1); // Refresh the bills list
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Fee Bills</h1>
          <p className="text-gray-600 mt-1">View and pay your pending bills</p>
        </div>

        <StudentBillsList key={refreshKey} onPayBill={handlePayBill} />

        {showPayment && selectedBill && (
          <PaymentComponent
            bill={selectedBill}
            onClose={handleClosePayment}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {successData && (
          <SuccessModal
            data={successData}
            onClose={handleCloseSuccess}
          />
        )}
      </div>
    </div>
  );
}