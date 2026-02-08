import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

// ==================== EXPENSE CATEGORY MANAGEMENT ====================

const ExpenseCategoryManagement = ({ onClose, onCategoryCreated }) => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('finance/expenses/categories/');
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axiosInstance.put(`finance/expenses/categories/${editingCategory.id}/`, formData);
      } else {
        await axiosInstance.post('finance/expenses/categories/', formData);
      }
      fetchCategories();
      resetForm();
      if (onCategoryCreated) onCategoryCreated();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category: ' + (error.response?.data?.name?.[0] || error.message));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      is_active: category.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axiosInstance.delete(`finance/expenses/categories/${id}/`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Cannot delete category with existing expenses');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', is_active: true });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Expense Categories</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Category'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
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
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingCategory ? 'Update' : 'Create'} Category
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{category.name}</td>
                  <td className="px-6 py-4">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{category.expense_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{category.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== EXPENSE FORM ====================

const ExpenseForm = ({ expense, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: expense?.category || '',
    title: expense?.title || '',
    amount: expense?.amount || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
    payment_date: expense?.payment_date || '',
    payment_method: expense?.payment_method || 'cash',
    payment_status: expense?.payment_status || 'pending',
    approved_by: expense?.approved_by || '',
    notes: expense?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (expense) {
        await axiosInstance.put(`finance/expenses/${expense.id}/`, formData);
      } else {
        await axiosInstance.post('finance/expenses/', formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);
      setError(error.response?.data?.detail || 'Error saving expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{expense ? 'Edit' : 'Create'} Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.filter(c => c.is_active).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
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
              <label className="block text-sm font-medium mb-1">Expense Date *</label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows="2"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (expense ? 'Update' : 'Create')} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== STATISTICS DASHBOARD ====================

const StatisticsDashboard = ({ summary, monthlyData, categoryData, selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-blue-600">₹{parseFloat(summary.total_expenses || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{summary.expense_count} expenses</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-3xl font-bold text-green-600">₹{parseFloat(summary.total_paid || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{summary.paid_count} paid</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">₹{parseFloat(summary.total_pending || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{summary.pending_count} pending</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
          <p className="text-sm text-gray-600 mb-1">This Month</p>
          <p className="text-3xl font-bold text-purple-600">₹{parseFloat(summary.monthly_total || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Current month</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData && categoryData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Expense by Category</h3>
          <div className="space-y-3">
            {categoryData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.category__name}</span>
                  <span>₹{parseFloat(item.total).toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {monthlyData && monthlyData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Monthly Breakdown - {selectedYear}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthlyData.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600">{item.month_name}</p>
                <p className="text-lg font-bold text-blue-600">₹{parseFloat(item.total).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PAGINATION COMPONENT ====================

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, totalCount }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-600">
          entries (Total: {totalCount})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Last
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

// ==================== MAIN EXPENSE MANAGEMENT COMPONENT ====================

export default function SchoolExpenseManagement() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [filters, setFilters] = useState({
    category: '',
    payment_status: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    search: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchSummary();
    fetchMonthlyBreakdown();
    fetchCategoryBreakdown();
  }, [filters.year, filters.month]);

  useEffect(() => {
    fetchExpenses(1); // Reset to page 1 when filters change
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('finance/expenses/categories/');
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExpenses = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pagination.pageSize);
      
      if (filters.category) params.append('category', filters.category);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.search) params.append('search', filters.search);

      const response = await axiosInstance.get(`finance/expenses/?${params.toString()}`);
      
      // Handle paginated response
      setExpenses(response.data.results || response.data);
      
      if (response.data.count !== undefined) {
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: page,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(response.data.count / pagination.pageSize)
        });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axiosInstance.get(`finance/expenses/summary/?year=${filters.year}&month=${filters.month}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchMonthlyBreakdown = async () => {
    try {
      const response = await axiosInstance.get(`finance/expenses/monthly-breakdown/?year=${filters.year}`);
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
    }
  };

  const fetchCategoryBreakdown = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      
      const response = await axiosInstance.get(`finance/expenses/category-breakdown/?${params.toString()}`);
      setCategoryData(response.data);
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/expenses/${id}/`);
        fetchExpenses();
        fetchSummary();
        fetchMonthlyBreakdown();
        fetchCategoryBreakdown();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  const handleExpenseSuccess = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    fetchExpenses(pagination.currentPage);
    fetchSummary();
    fetchMonthlyBreakdown();
    fetchCategoryBreakdown();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchExpenses(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination({ ...pagination, pageSize: newPageSize });
    fetchExpenses(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const viewExpenseDetail = async (id) => {
    try {
      const response = await axiosInstance.get(`finance/expenses/${id}/`);
      setSelectedExpense(response.data);
    } catch (error) {
      console.error('Error fetching expense detail:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <div className="space-x-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Manage Categories
            </button>
            <button
              onClick={handleCreateExpense}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Create Expense
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <StatisticsDashboard
          summary={summary}
          monthlyData={monthlyData}
          categoryData={categoryData}
          selectedYear={filters.year}
          selectedMonth={filters.month}
          onYearChange={(year) => setFilters({ ...filters, year })}
          onMonthChange={(month) => setFilters({ ...filters, month })}
        />

        {/* Filters */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <select
                value={filters.payment_status}
                onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by title, category, notes..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Expense List</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No expenses found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {expense.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{expense.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">₹{parseFloat(expense.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(expense.payment_status)}`}>
                            {expense.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => viewExpenseDetail(expense.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
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
            )}

            {/* Pagination */}
            {!loading && expenses.length > 0 && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                pageSize={pagination.pageSize}
                onPageSizeChange={handlePageSizeChange}
                totalCount={pagination.count}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {showCategoryModal && (
          <ExpenseCategoryManagement
            onClose={() => setShowCategoryModal(false)}
            onCategoryCreated={fetchCategories}
          />
        )}

        {showExpenseForm && (
          <ExpenseForm
            expense={editingExpense}
            categories={categories}
            onClose={() => {
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
            onSuccess={handleExpenseSuccess}
          />
        )}

        {selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Expense Details</h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold">{selectedExpense.category_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-semibold">{selectedExpense.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-bold text-lg text-blue-600">₹{parseFloat(selectedExpense.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expense Date</p>
                    <p className="font-semibold">{new Date(selectedExpense.expense_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedExpense.payment_status)}`}>
                      {selectedExpense.payment_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold">{selectedExpense.payment_method}</p>
                  </div>
                  {selectedExpense.approved_by_name && (
                    <div>
                      <p className="text-sm text-gray-600">Approved By (Vendor)</p>
                      <p className="font-semibold">{selectedExpense.approved_by_name}</p>
                    </div>
                  )}
                  {selectedExpense.payment_date && (
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-semibold">{new Date(selectedExpense.payment_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="font-semibold">{selectedExpense.created_by_name}</p>
                  </div>
                </div>
                {selectedExpense.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="mt-1">{selectedExpense.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}