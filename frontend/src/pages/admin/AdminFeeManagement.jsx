import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import toast from "react-hot-toast";

// Fee Type Management Component
const FeeTypeManagement = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const fetchFeeTypes = async () => {
    try {
      const response = await axiosInstance.get('finance/admin/fee-types/');
      setFeeTypes(response.data);
    } catch (error) {
      toast.error('Error fetching fee types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await axiosInstance.put(`finance/admin/fee-types/${editingType.id}/`, formData);
      } else {
        await axiosInstance.post('finance/admin/fee-types/', formData);
      }
      fetchFeeTypes();
      resetForm();
    } catch (error) {
      toast.error('Error saving fee type:', error);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description,
      is_active: type.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee type?')) {
      try {
        await axiosInstance.delete(`finance/admin/fee-types/${id}/`);
        fetchFeeTypes();
      } catch (error) {
        toast.error('Error deleting fee type:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', is_active: true });
    setEditingType(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Fee Types</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Fee Type'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">Active</label>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {editingType ? 'Update' : 'Create'} Fee Type
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feeTypes.map((type) => (
              <tr key={type.id}>
                <td className="px-6 py-4 whitespace-nowrap">{type.name}</td>
                <td className="px-6 py-4">{type.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fee Structure Management Component
const FeeStructureManagement = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formData, setFormData] = useState({
    fee_type: '',
    amount: '',
    school_classes: [],
    due_date: '',
    billing_period: '',
    is_active: true
  });

  useEffect(() => {
    fetchFeeStructures();
    fetchFeeTypes();
    fetchClasses();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await axiosInstance.get('finance/admin/fee-structures/');
      setFeeStructures(response.data);
    } catch (error) {
      toast.error('Error fetching fee structures:', error);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const response = await axiosInstance.get('finance/admin/fee-types/');
      setFeeTypes(response.data);
    } catch (error) {
      toast.error('Error fetching fee types:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get('classroom/classes/dropdown/');
      setClasses(response.data);
    } catch (error) {
      toast.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStructure) {
        await axiosInstance.put(`finance/admin/fee-structures/${editingStructure.id}/`, formData);
      } else {
        await axiosInstance.post('finance/admin/fee-structures/', formData);
      }
      fetchFeeStructures();
      resetForm();
    } catch (error) {
      toast.error('Error saving fee structure:', error);
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      fee_type: structure.fee_type,
      amount: structure.amount,
      school_classes: structure.school_classes || [],
      due_date: structure.due_date,
      billing_period: structure.billing_period,
      is_active: structure.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await axiosInstance.delete(`finance/admin/fee-structures/${id}/`);
        fetchFeeStructures();
      } catch (error) {
        toast.error('Error deleting fee structure:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fee_type: '',
      amount: '',
      school_classes: [],
      due_date: '',
      billing_period: '',
      is_active: true
    });
    setEditingStructure(null);
    setShowForm(false);
  };

  const handleClassSelection = (classId) => {
    const selected = [...formData.school_classes];
    const index = selected.indexOf(classId);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(classId);
    }
    setFormData({ ...formData, school_classes: selected });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Fee Structures</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Structure'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fee Type</label>
              <select
                value={formData.fee_type}
                onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Fee Type</option>
                {feeTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Billing Period</label>
              <input
                type="text"
                value={formData.billing_period}
                onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., March 2026, Term 1"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Select Classes (Leave empty for all)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
              {classes.map((cls) => (
                <label key={cls.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.school_classes.includes(cls.id)}
                    onChange={() => handleClassSelection(cls.id)}
                  />
                  <span className="text-sm">{cls.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">Active</label>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {editingStructure ? 'Update' : 'Create'} Fee Structure
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feeStructures.map((structure) => (
              <tr key={structure.id}>
                <td className="px-6 py-4 whitespace-nowrap">{structure.fee_type_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{structure.amount}</td>
                <td className="px-6 py-4">
                  {structure.class_names?.length > 0 ? structure.class_names.join(', ') : 'All Classes'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{structure.due_date}</td>
                <td className="px-6 py-4">{structure.billing_period}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(structure)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(structure.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



// Student Bills Management Component
const StudentBillsManagement = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    class_id: '',
    student: ''
  });

  useEffect(() => {
    fetchBills();
  }, [filters]);

  const fetchBills = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.class_id) params.append('class_id', filters.class_id);
      if (filters.student) params.append('student', filters.student);

      const response = await axiosInstance.get(`finance/admin/bills/?${params.toString()}`);
      setBills(response.data);
    } catch (error) {
      toast.error('Error fetching bills:', error);
    }
  };

  const fetchBillDetail = async (id) => {
    try {
      const response = await axiosInstance.get(`finance/admin/bills/${id}/`);
      setSelectedBill(response.data);
    } catch (error) {
      toast.error('Error fetching bill detail:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Student Bills</h2>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Class ID</label>
          <input
            type="text"
            value={filters.class_id}
            onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Filter by class"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Student ID</label>
          <input
            type="text"
            value={filters.student}
            onChange={(e) => setFilters({ ...filters, student: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Filter by student"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td className="px-6 py-4 whitespace-nowrap">{bill.student_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.admission_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.fee_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{bill.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.due_date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(bill.status)}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => fetchBillDetail(bill.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Bill Details</h3>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-semibold">{selectedBill.student_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-semibold">{selectedBill.admission_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-semibold">{selectedBill.class_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fee Type</p>
                  <p className="font-semibold">{selectedBill.fee_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold">₹{selectedBill.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{selectedBill.due_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedBill.status)}`}>
                    {selectedBill.status}
                  </span>
                </div>
                {selectedBill.paid_date && (
                  <div>
                    <p className="text-sm text-gray-600">Paid Date</p>
                    <p className="font-semibold">{selectedBill.paid_date}</p>
                  </div>
                )}
              </div>
              {selectedBill.payment && (
                <div className="mt-4 p-4 bg-green-50 rounded">
                  <h4 className="font-semibold mb-2">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Receipt Number</p>
                      <p className="font-semibold">{selectedBill.payment.receipt_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold">{selectedBill.payment.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-semibold">{selectedBill.payment.transaction_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-semibold">{new Date(selectedBill.payment.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// Payments Management Component
const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get('finance/admin/payments/');
      setPayments(response.data);
    } catch (error) {
      toast.error('Error fetching payments:', error);
    }
  };

  const fetchPaymentDetail = async (id) => {
    try {
      const response = await axiosInstance.get(`finance/admin/payments/${id}/`);
      setSelectedPayment(response.data);
    } catch (error) {
      toast.error('Error fetching payment detail:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Payments</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{payment.receipt_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.bill_details?.student_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.bill_details?.fee_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{payment.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.payment_method}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(payment.payment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => fetchPaymentDetail(payment.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">Payment Receipt</h3>
              <p className="text-gray-600">Receipt #{selectedPayment.receipt_number}</p>
            </div>
            <div className="space-y-3 border-t border-b py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-semibold">{selectedPayment.bill_details?.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admission No:</span>
                <span className="font-semibold">{selectedPayment.bill_details?.admission_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee Type:</span>
                <span className="font-semibold">{selectedPayment.bill_details?.fee_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg">₹{selectedPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{selectedPayment.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm">{selectedPayment.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(selectedPayment.payment_date).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPayment(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};




// ----------------Main Admin Dashboard Component ----------------------

export default function AdminFeeManagement() {
  const [activeTab, setActiveTab] = useState('fee-types');

  const tabs = [
    { id: 'fee-types', label: 'Fee Types' },
    { id: 'fee-structures', label: 'Fee Structures' },
    { id: 'bills', label: 'Student Bills' },
    { id: 'payments', label: 'Payments' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fee Management System</h1>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {activeTab === 'fee-types' && <FeeTypeManagement />}
          {activeTab === 'fee-structures' && <FeeStructureManagement />}
          {activeTab === 'bills' && <StudentBillsManagement />}
          {activeTab === 'payments' && <PaymentsManagement />}
        </div>
      </div>
    </div>
  );
}