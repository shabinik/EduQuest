from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions,status
from rest_framework.response import Response
from .serializers import LoginSerializer,UserSerializer,AdminSignupSerializer,AdminVerifyEmailSerializer,ChangePasswordSerializer,AdminProfileSerializer,AdminResendOtpSerializer,ForgotPasswordSerializer,ResetPasswordSerializer,ForgotPasswordResendOtpSerializer
from django.conf import settings
from . permissions import IsAdmin
import cloudinary.uploader
from rest_framework.parsers import MultiPartParser,FormParser
from accounts.models import User
from subscription.models import Subscription
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from users.models import Teacher, Student
from classroom.models import SchoolClass
from finance.models import Payment, StudentBill, Expense
from subscription.models import Subscription
from academics.models import Announcement 


# Create your views here.

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = LoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        access_token = data["access"]
        refresh_token = data["refresh"]
        user_data = data["user"]
        user = User.objects.get(id=user_data["id"])

        has_active_subscription = False
        expiry_date = None

        if user.tenant:
            subscription = Subscription.objects.filter(tenant=user.tenant,is_active=True
                                                       ).order_by('-expiry_date').first()
            if subscription:
                has_active_subscription = True
                expiry_date = subscription.expiry_date
        
        response = Response(
            {
                "user": user_data,
                "has_active_subscription": has_active_subscription,
                "expiry_date": expiry_date,
            },
            status=status.HTTP_200_OK
        )

        #Set HTTP-only cookies (access short, refresh longer)
        # In production: secure=True, samesite='Strict' (and send over HTTPS)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,    #True in production
            samesite='Lax',
            domain="localhost",
            path='/',
            max_age= 60 * 60 * 24 * 30, #30 days
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            domain="localhost",
            path='/',
            max_age= 60 * 60 * 24 * 60, # 60 days
        )

        return response
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):

        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        response = Response({"detail":"Logged out Successfully"}, status= status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
    

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class ProfileImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self,request):
        image = request.FILES.get("image")

        if not image:
            return Response({"detail": "No image provided"},status=status.HTTP_400_BAD_REQUEST)
        
        #Upload to cloudinary
        result = cloudinary.uploader.upload(
            image,
            folder = "eduquest/profile_images",
            public_id = f"user_{request.user.id}",
            overwrite = True
        )

        #Save Url
        request.user.profile_image = result["secure_url"]
        request.user.save()

        return Response({"profile_image":result["secure_url"]},status=status.HTTP_200_OK)
    


class AdminSingupView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = AdminSignupSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message":"Signup successful. Please check your email for OTP."},
                status = status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminResendOtpView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = AdminResendOtpSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save() 
            return Response({"message":"OTP resent successfully"})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
          

class AdminVerifyEmailView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = AdminVerifyEmailSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Email verified. You can now login."})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)  
    

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not an admin"}, status=403)

        serializer = AdminProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not an admin"}, status=403)

        serializer = AdminProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


   
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self,request):
        serializer = ChangePasswordSerializer(data = request.data, context={"request":request})

        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.must_change_password = False
            user.save()
            return Response({"detail": "Password changed successfully."})
        return Response(serializer.errors, status=400)
    

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "OTP sent to your email."})
    

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password reset successfully."})
    

class ForgotPasswordResendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordResendOtpSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message":"OTP resent"})




#------------------- ADMIN DASHBOARD--------------------

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        tenant = request.user.tenant
        now = timezone.now()
        today = now.date()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        twelve_months_ago = now - timedelta(days=365)
        current_year = now.year

        # ── People stats ──────────────────────────────────────────────────────
        total_students = Student.objects.filter(user__tenant=tenant).count()
        total_teachers = Teacher.objects.filter(user__tenant=tenant).count()
        total_classes  = SchoolClass.objects.filter(tenant=tenant, is_active=True).count()

        new_students_month = Student.objects.filter(
            user__tenant=tenant,
            created_at__gte=this_month_start
        ).count()

        # ── Fee / Revenue stats ───────────────────────────────────────────────
        bills = StudentBill.objects.filter(tenant=tenant)
        paid_bills = bills.filter(status="paid")
        pending_bills = bills.filter(status="pending")
        overdue_bills = bills.filter(status="overdue")

        month_revenue = paid_bills.filter(
            paid_date__gte=this_month_start.date()
        ).aggregate(t=Sum("amount"))["t"] or Decimal("0")

        last_month_revenue = paid_bills.filter(
            paid_date__gte=last_month_start.date(),
            paid_date__lt=this_month_start.date()
        ).aggregate(t=Sum("amount"))["t"] or Decimal("0")

        total_revenue = paid_bills.aggregate(t=Sum("amount"))["t"] or Decimal("0")

        pending_amount = pending_bills.aggregate(t=Sum("amount"))["t"] or Decimal("0")
        overdue_amount = overdue_bills.aggregate(t=Sum("amount"))["t"] or Decimal("0")

        # ── Expense stats ─────────────────────────────────────────────────────
        expenses = Expense.objects.filter(tenant=tenant, payment_status="paid")
        month_expense = expenses.filter(
            expense_date__year=current_year,
            expense_date__month=now.month
        ).aggregate(t=Sum("amount"))["t"] or Decimal("0")

        total_expense_year = expenses.filter(
            expense_date__year=current_year
        ).aggregate(t=Sum("amount"))["t"] or Decimal("0")

        # Net this month
        net_month = month_revenue - month_expense

        # ── Bill status breakdown ─────────────────────────────────────────────
        bill_status = [
            {"status": "Paid",    "count": paid_bills.count(),    "color": "#10B981"},
            {"status": "Pending", "count": pending_bills.count(), "color": "#F59E0B"},
            {"status": "Overdue", "count": overdue_bills.count(), "color": "#EF4444"},
        ]

        # ── Revenue by month (last 12 months) ─────────────────────────────────
        revenue_by_month = (
            paid_bills
            .filter(paid_date__gte=twelve_months_ago.date())
            .annotate(month=TruncMonth("paid_date"))
            .values("month")
            .annotate(revenue=Sum("amount"), count=Count("id"))
            .order_by("month")
        )
        revenue_chart = [
            {
                "month": r["month"].strftime("%b '%y"),
                "revenue": float(r["revenue"]),
                "collections": r["count"],
            }
            for r in revenue_by_month
        ]

        # ── Expense by month (last 12 months) ─────────────────────────────────
        expense_by_month = (
            expenses
            .filter(expense_date__gte=twelve_months_ago.date())
            .annotate(month=TruncMonth("expense_date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )
        # Merge revenue and expense into one chart list
        expense_map = {
            e["month"].strftime("%b '%y"): float(e["total"])
            for e in expense_by_month
        }
        for r in revenue_chart:
            r["expense"] = expense_map.get(r["month"], 0)

        # ── Expense by category ───────────────────────────────────────────────
        expense_by_cat = (
            expenses
            .filter(expense_date__year=current_year)
            .values("category__name")
            .annotate(total=Sum("amount"))
            .order_by("-total")[:6]
        )
        expense_cat_chart = [
            {"category": e["category__name"], "amount": float(e["total"])}
            for e in expense_by_cat
        ]

        # ── Subscription info ─────────────────────────────────────────────────
        active_sub = (
            Subscription.objects
            .filter(tenant=tenant, is_active=True)
            .select_related("plan")
            .first()
        )
        subscription_info = None
        if active_sub:
            days_left = (active_sub.expiry_date - now).days if active_sub.expiry_date else 0
            subscription_info = {
                "plan_name":    active_sub.plan.plan_name,
                "expiry_date":  active_sub.expiry_date.strftime("%d %b %Y") if active_sub.expiry_date else "—",
                "days_left":    max(days_left, 0),
                "max_students": active_sub.plan.max_students,
            }

        # ── Recent overdue bills ───────────────────────────────────────────────
        recent_overdue = (
            overdue_bills
            .select_related("student__user", "fee_structure__fee_type")
            .order_by("-due_date")[:6]
        )
        overdue_list = [
            {
                "student": b.student.user.full_name,
                "fee_type": b.fee_structure.fee_type.name,
                "amount": float(b.amount),
                "due_date": b.due_date.strftime("%d %b %Y"),
            }
            for b in recent_overdue
        ]

        # ── Recent payments ────────────────────────────────────────────────────
        recent_paid = (
            paid_bills
            .select_related("student__user", "fee_structure__fee_type", "payment")
            .order_by("-paid_date")[:6]
        )
        recent_payments_list = [
            {
                "student": b.student.user.full_name,
                "fee_type": b.fee_structure.fee_type.name,
                "amount": float(b.amount),
                "paid_date": b.paid_date.strftime("%d %b %Y") if b.paid_date else "—",
            }
            for b in recent_paid
        ]

        # ── Active announcements count ────────────────────────────────────────
        try:
            active_announcements = Announcement.objects.filter(
                tenant=tenant,
                expiry_date__gte=now
            ).count()
        except Exception:
            active_announcements = 0

        return Response({
            "kpis": {
                "total_students":      total_students,
                "total_teachers":      total_teachers,
                "total_classes":       total_classes,
                "new_students_month":  new_students_month,
                "month_revenue":       float(month_revenue),
                "last_month_revenue":  float(last_month_revenue),
                "total_revenue":       float(total_revenue),
                "pending_amount":      float(pending_amount),
                "overdue_amount":      float(overdue_amount),
                "month_expense":       float(month_expense),
                "total_expense_year":  float(total_expense_year),
                "net_month":           float(net_month),
                "pending_bills":       pending_bills.count(),
                "overdue_bills":       overdue_bills.count(),
                "active_announcements": active_announcements,
            },
            "subscription":       subscription_info,
            "revenue_chart":      revenue_chart,
            "expense_cat_chart":  expense_cat_chart,
            "bill_status":        bill_status,
            "overdue_list":       overdue_list,
            "recent_payments":    recent_payments_list,
        })
    