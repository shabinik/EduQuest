from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin, HasActiveSubscription
from django.shortcuts import get_object_or_404
from .models import FeeType, FeeStructure, StudentBill, Payment
from .serializers import (
    FeeTypeSerializer, 
    FeeStructureSerializer,
    StudentBillListSerializer,
    StudentBillDetailSerializer,
    PaymentSerializer
)
from django.conf import settings
from subscription.razorpay_client import get_razorpay_client
from rest_framework.views import APIView
from django.utils import timezone

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
    permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAuthenticated]
    
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

        # ✅ Create FINAL payment record (success only)
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
