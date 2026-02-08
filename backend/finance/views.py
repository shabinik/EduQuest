from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin, HasActiveSubscription
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from datetime import datetime
from .models import FeeType, FeeStructure, StudentBill, Payment , ExpenseCategory, Expense
from .serializers import (
    FeeTypeSerializer, 
    FeeStructureSerializer,
    StudentBillListSerializer,
    StudentBillDetailSerializer,
    PaymentSerializer,

    # Expense
    ExpenseCategorySerializer,
    ExpenseListSerializer,
    ExpenseDetailSerializer,
    ExpenseCreateUpdateSerializer,
    ExpenseSummarySerializer,
    MonthlyBreakdownSerializer,
    CategoryBreakdownSerializer
)
from django.conf import settings
from subscription.razorpay_client import get_razorpay_client
from rest_framework.views import APIView
from django.utils import timezone
from decimal import Decimal
from rest_framework.pagination import PageNumberPagination

# Create your views here.

# ----ADMIN BILL VIEWS----

class AdminFeeTypeListCreateView(generics.ListCreateAPIView):
    serializer_class = FeeTypeSerializer
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get_queryset(self):
        return FeeType.objects.filter(tenant = self.request.user.tenant)
    
    def perform_create(self, serializer):
        serializer.save(tenant = self.request.user.tenant)


class AdminFeeTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FeeTypeSerializer
    permission_classes = [IsAdmin,IsAuthenticated,HasActiveSubscription]

    def get_queryset(self):
        return FeeType.objects.filter(tenant = self.request.user.tenant)


class AdminFeeStructureListCreateView(generics.ListCreateAPIView):
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get_queryset(self):
        qs = FeeStructure.objects.filter(
            tenant = self.request.user.tenant
        ).prefetch_related('school_classes')

        class_id = self.request.query_params.get('class_id')
        if class_id:
            qs = qs.filter(school_classes__id = class_id)
        
        return qs.distinct()
    
    def perform_create(self, serializer):
        serializer.save(tenant = self.request.user.tenant)


class AdminFeeStructureDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]
    
    def get_queryset(self):
        return FeeStructure.objects.filter(
            tenant=self.request.user.tenant
        ).prefetch_related('school_classes')
    


# ADMIN STUDENT'S BILL VIEWS

class AdminStudentBillListView(generics.ListAPIView):
    serializer_class = StudentBillListSerializer
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get_queryset(self):
        qs = StudentBill.objects.filter(
            tenant = self.request.user.tenant
        ).select_related(
            'student__user',
            'student__school_class',
            'fee_structure__fee_type'
        )

        student_id = self.request.query_params.get('student')
        status_filter = self.request.query_params.get('status')
        class_id = self.request.query_params.get('class_id')

        if student_id:
            qs = qs.filter(student_id = student_id)
        if status_filter:
            qs = qs.filter(status = status_filter)
        if class_id:
            qs = qs.filter(student__school_class_id = class_id)

        return qs



class AdminStudentBillDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve bill details with payment info
    PATCH: Update bill (admin can add notes, etc.)
    """
    serializer_class = StudentBillDetailSerializer
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]
    
    def get_queryset(self):
        return StudentBill.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('payment', 'student__user', 'fee_structure__fee_type')



class PaymentListView(generics.ListAPIView):
    """
    GET: List all payments
    
    Query params:
    - bill_id: Filter by bill
    - student_id: Filter by student
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAdmin,IsAuthenticated,HasActiveSubscription]

    
    def get_queryset(self):
        qs = Payment.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('bill__student__user', 'bill__fee_structure__fee_type')
        
        # Filters
        bill_id = self.request.query_params.get('bill_id')
        student_id = self.request.query_params.get('student_id')
        
        if bill_id:
            qs = qs.filter(bill_id=bill_id)
        if student_id:
            qs = qs.filter(bill__student_id=student_id)
        
        return qs
    


class PaymentDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve payment details (for receipt viewing)
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]
    
    def get_queryset(self):
        return Payment.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('bill__student__user', 'bill__fee_structure__fee_type')



# STUDENT'S VIEWS

class StudentMyBillListView(generics.ListAPIView):
    serializer_class = StudentBillListSerializer
    permission_classes = [IsAuthenticated, HasActiveSubscription]

    def get_queryset(self):
        return StudentBill.objects.filter(
            student=self.request.user.student_profile,
            tenant=self.request.user.tenant
        )
    


class CreateStudentBillOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, bill_id):
        bill = get_object_or_404(
            StudentBill,
            id=bill_id,
            tenant=request.user.tenant,
            student=request.user.student_profile,
            status__in=["pending", "overdue"]
        )

        # Prevent double payment
        if hasattr(bill, "payments"):
            return Response(
                {"error": "Bill already paid"},
                status=400
            )

        client = get_razorpay_client()

        amount_paise = int(bill.amount * 100)
        receipt = f"bill_{bill.id}_{int(timezone.now().timestamp())}"

        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
        })

        return Response({
            "order_id": order["id"],
            "amount": bill.amount,
            "currency": "INR",
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "bill_id": bill.id
        })


class VerifyStudentBillPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        bill = get_object_or_404(
            StudentBill,
            id=data.get("bill_id"),
            tenant=request.user.tenant,
            student=request.user.student_profile
        )

        # Prevent double payment
        if hasattr(bill, "payments"):
            return Response(
                {"error": "Bill already paid"},
                status=400
            )

        client = get_razorpay_client()

        params = {
            "razorpay_order_id": data.get("razorpay_order_id"),
            "razorpay_payment_id": data.get("razorpay_payment_id"),
            "razorpay_signature": data.get("razorpay_signature"),
        }

        try:
            client.utility.verify_payment_signature(params)
        except Exception:
            return Response(
                {"error": "Signature verification failed"},
                status=400
            )

        # Create FINAL payment record (success only)
        payment = Payment.objects.create(
            tenant=request.user.tenant,
            bill=bill,
            amount=bill.amount,
            payment_method="upi",
            transaction_id=data.get("razorpay_payment_id"),
            collected_by=request.user,
            notes=f"Razorpay Order: {params['razorpay_order_id']}"
        )

        return Response({
            "success": True,
            "message": "Fee payment successful",
            "receipt_number": payment.receipt_number
        })




# EXPENSES OF A SCHOOL

# ==================== PAGINATION ====================

class ExpensePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==================== EXPENSE CATEGORY VIEWS ====================

class ExpenseCategoryListCreateView(generics.ListCreateAPIView):
    """List all categories or create new one"""
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]
    pagination_class = ExpensePagination

    def get_queryset(self):
        return ExpenseCategory.objects.filter(
            tenant=self.request.user.tenant
        ).prefetch_related('expenses')

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class ExpenseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a category"""
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get_queryset(self):
        return ExpenseCategory.objects.filter(tenant=self.request.user.tenant)


# ==================== EXPENSE VIEWS ====================

class ExpenseListCreateView(generics.ListCreateAPIView):
    """List all expenses with filters or create new expense"""
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]
    pagination_class = ExpensePagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateUpdateSerializer
        return ExpenseListSerializer

    def get_queryset(self):
        queryset = Expense.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('category', 'created_by', 'approved_by')

        # Apply filters
        category_id = self.request.query_params.get('category')
        payment_status = self.request.query_params.get('payment_status')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        search = self.request.query_params.get('search')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        if year:
            queryset = queryset.filter(expense_date__year=year)
        
        if month:
            queryset = queryset.filter(expense_date__month=month)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(notes__icontains=search) |
                Q(category__name__icontains=search)
            )

        return queryset.order_by('-expense_date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an expense"""
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExpenseCreateUpdateSerializer
        return ExpenseDetailSerializer

    def get_queryset(self):
        return Expense.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('category', 'created_by', 'approved_by')


# ==================== EXPENSE STATISTICS & ANALYTICS ====================

class ExpenseSummaryView(APIView):
    """Get expense summary and statistics"""
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get(self, request):
        tenant = request.user.tenant
        current_date = timezone.now().date()
        current_year = int(request.query_params.get('year', current_date.year))
        current_month = int(request.query_params.get('month', current_date.month))

        # Get all expenses for the tenant
        all_expenses = Expense.objects.filter(tenant=tenant)

        # Total statistics
        total_stats = all_expenses.aggregate(
            total_amount=Sum('amount'),
            total_count=Count('id')
        )

        # Paid expenses statistics
        paid_stats = all_expenses.filter(payment_status='paid').aggregate(
            paid_amount=Sum('amount'),
            paid_count=Count('id')
        )

        # Pending expenses statistics
        pending_stats = all_expenses.filter(payment_status='pending').aggregate(
            pending_amount=Sum('amount'),
            pending_count=Count('id')
        )

        # Monthly total (current month)
        monthly_total = Expense.get_monthly_total(tenant, current_year, current_month)

        # Yearly total (current year)
        yearly_total = Expense.get_yearly_total(tenant, current_year)

        # Category breakdown
        category_breakdown = Expense.get_category_totals(tenant, current_year)
        total_for_percentage = sum(item['total'] for item in category_breakdown)
        
        for item in category_breakdown:
            if total_for_percentage > 0:
                item['percentage'] = (float(item['total']) / float(total_for_percentage)) * 100
            else:
                item['percentage'] = 0.0

        summary_data = {
            'total_expenses': total_stats['total_amount'] or Decimal('0.00'),
            'total_paid': paid_stats['paid_amount'] or Decimal('0.00'),
            'total_pending': pending_stats['pending_amount'] or Decimal('0.00'),
            'expense_count': total_stats['total_count'] or 0,
            'paid_count': paid_stats['paid_count'] or 0,
            'pending_count': pending_stats['pending_count'] or 0,
            'monthly_total': monthly_total,
            'yearly_total': yearly_total,
            'category_breakdown': list(category_breakdown)
        }

        serializer = ExpenseSummarySerializer(summary_data)
        return Response(serializer.data)


class MonthlyBreakdownView(APIView):
    """Get month-by-month breakdown for a year"""
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get(self, request):
        tenant = request.user.tenant
        year = int(request.query_params.get('year', timezone.now().year))

        breakdown = Expense.get_monthly_breakdown(tenant, year)
        
        # Format the data with month names
        formatted_breakdown = []
        for item in breakdown:
            formatted_breakdown.append({
                'month': item['month'],
                'total': item['total'],
                'month_name': item['month'].strftime('%B %Y')
            })

        serializer = MonthlyBreakdownSerializer(formatted_breakdown, many=True)
        return Response(serializer.data)


class CategoryBreakdownView(APIView):
    """Get category-wise expense breakdown"""
    permission_classes = [IsAuthenticated, IsAdmin, HasActiveSubscription]

    def get(self, request):
        tenant = request.user.tenant
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        category_totals = Expense.get_category_totals(
            tenant, 
            year=int(year) if year else None,
            month=int(month) if month else None
        )

        # Calculate percentages
        total = sum(item['total'] for item in category_totals)
        for item in category_totals:
            if total > 0:
                item['percentage'] = (float(item['total']) / float(total)) * 100
            else:
                item['percentage'] = 0.0

        serializer = CategoryBreakdownSerializer(category_totals, many=True)
        return Response(serializer.data)


# ==================== BULK OPERATIONS ====================

@api_view(['POST'])
def bulk_update_payment_status(request):
    """Bulk update payment status for multiple expenses"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    expense_ids = request.data.get('expense_ids', [])
    payment_status = request.data.get('payment_status')
    payment_date = request.data.get('payment_date')

    if not expense_ids or not payment_status:
        return Response(
            {'error': 'expense_ids and payment_status are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    updated_count = Expense.objects.filter(
        id__in=expense_ids,
        tenant=request.user.tenant
    ).update(
        payment_status=payment_status,
        payment_date=payment_date if payment_date else timezone.now().date()
    )

    return Response({
        'success': True,
        'updated_count': updated_count,
        'message': f'{updated_count} expense(s) updated successfully'
    })


@api_view(['GET'])
def expense_years(request):
    """Get list of years that have expenses"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    years = Expense.objects.filter(
        tenant=request.user.tenant
    ).dates('expense_date', 'year').values_list('expense_date__year', flat=True)
    
    unique_years = sorted(set(years), reverse=True)

    return Response({'years': unique_years})