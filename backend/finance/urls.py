from django.urls import path
from .views import (
    # Admin – Fee setup
    AdminFeeTypeListCreateView,
    AdminFeeTypeDetailView,
    AdminFeeStructureListCreateView,
    AdminFeeStructureDetailView,

    # Admin – Bills & Payments
    AdminStudentBillListView,
    AdminStudentBillDetailView,
    PaymentListView,
    PaymentDetailView,

    # Student
    StudentMyBillListView,
    CreateStudentBillOrderView,
    VerifyStudentBillPaymentView,
    
    # Expense Categories
    ExpenseCategoryListCreateView,
    ExpenseCategoryDetailView,
    
    # Expenses
    ExpenseListCreateView,
    ExpenseDetailView,
    
    # Statistics & Analytics
    ExpenseSummaryView,
    MonthlyBreakdownView,
    CategoryBreakdownView,
    
    # Bulk Operations & Utilities
    bulk_update_payment_status,
    expense_years,
)

urlpatterns = [
    path("admin/fee-types/",AdminFeeTypeListCreateView.as_view(),name="admin-fee-type-list-create"),
    path("admin/fee-types/<int:pk>/",AdminFeeTypeDetailView.as_view(),name="admin-fee-type-detail"),
    path("admin/fee-structures/",AdminFeeStructureListCreateView.as_view(),name="admin-fee-structure-list-create"),
    path("admin/fee-structures/<int:pk>/", AdminFeeStructureDetailView.as_view(),name="admin-fee-structure-detail"),
    path("admin/bills/",AdminStudentBillListView.as_view(),name="admin-student-bill-list"),
    path("admin/bills/<int:pk>/",AdminStudentBillDetailView.as_view(),name="admin-student-bill-detail"),
    path("admin/payments/", PaymentListView.as_view(), name="admin-payment-list"),
    path( "admin/payments/<int:pk>/", PaymentDetailView.as_view(), name="admin-payment-detail" ),
    
    path("student/bills/",StudentMyBillListView.as_view(),name="student-my-bills"),
    path("student/bills/<int:bill_id>/create-order/",CreateStudentBillOrderView.as_view(),name="student-create-bill-order"),
    path("student/bills/verify-payment/",VerifyStudentBillPaymentView.as_view(),name="student-verify-bill-payment"),

    #School Expense
    path('expenses/categories/',ExpenseCategoryListCreateView.as_view(),name='expense-category-list-create'),
    path('expenses/categories/<int:pk>/',ExpenseCategoryDetailView.as_view(),name='expense-category-detail'),
    path('expenses/',ExpenseListCreateView.as_view(),name='expense-list-create'),
    path('expenses/<int:pk>/',ExpenseDetailView.as_view(),name='expense-detail'),
    path('expenses/summary/',ExpenseSummaryView.as_view(),name='expense-summary' ),
    path('expenses/monthly-breakdown/',MonthlyBreakdownView.as_view(),name='monthly-breakdown'),
    path('expenses/category-breakdown/',CategoryBreakdownView.as_view(),name='category-breakdown'),
    path('expenses/bulk-update-payment-status/',bulk_update_payment_status,name='bulk-update-payment-status'),
    path('expenses/years/',expense_years,name='expense-years'),
]

