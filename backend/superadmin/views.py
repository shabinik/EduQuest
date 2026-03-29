from django.shortcuts import render,get_object_or_404
from rest_framework.views import APIView
from accounts.permissions import IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from accounts.models import Tenant
from . seralizers import TenantListSerializer,TenantBillingSerializer
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from accounts.models import Tenant, User
from subscription.models import Payment, Subscription, SubscriptionPlan
 

# Create your views here.

class SuperAdminTenantListView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def get(self,request):
        tenants = Tenant.objects.all().order_by("-created_at")
        serializer = TenantListSerializer(tenants, many=True)
        return Response(serializer.data)
    

# Block OR Suspend
class SuperAdminTenantStatusView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def post(self,request,tenant_id):
        status_value = request.data.get("status")

        if status_value not in ["active","inactive","suspended"]:
            return Response({"error":"Invalid status"},status=400)
        
        tenant = get_object_or_404(Tenant, id = tenant_id)
        tenant.status = status_value
        tenant.save()

        return Response({"success":True, "status":tenant.status})


class SuperAdminTenantDeleteView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def delete(self, request, tenant_id):
        tenant = get_object_or_404(Tenant,id = tenant_id)
        tenant.delete()
        return Response({"success": True, "message": "Tenant deleted successfully"},
            status=status.HTTP_204_NO_CONTENT)
    


class SuperAdminBillingView(APIView):
    permission_classes = [IsAuthenticated,IsSuperAdmin]

    def get(self, request):
        tenants = Tenant.objects.all().order_by('-created_at')
        serializer = TenantBillingSerializer(tenants, many = True)
        return Response(serializer.data)


#---------- SUPER ADMIN DASHBOARD ------------

class SuperAdminDashboardView(APIView):

    permission_classes = [IsAuthenticated,IsSuperAdmin]
 
    def get(self, request):
 
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
 
        # ── Tenant stats ──────────────────────────────────────────────────────
        tenants = Tenant.objects.all()
        tenant_total    = tenants.count()
        tenant_active   = tenants.filter(status="active").count()
        tenant_inactive = tenants.filter(status="inactive").count()
        tenant_suspended= tenants.filter(status="suspended").count()
        tenant_trial    = tenants.filter(status="trial").count()
        tenant_new_month= tenants.filter(created_at__gte=this_month_start).count()
 
        # ── User stats ────────────────────────────────────────────────────────
        users = User.objects.all()
        total_admins   = users.filter(role="admin").count()
        total_teachers = users.filter(role="teacher").count()
        total_students = users.filter(role="student").count()
        total_users    = total_admins + total_teachers + total_students
 
        # ── Revenue stats ─────────────────────────────────────────────────────
        paid_payments  = Payment.objects.filter(status="paid")
        total_revenue  = paid_payments.aggregate(t=Sum("amount"))["t"] or 0
        month_revenue  = paid_payments.filter(
            created_at__gte=this_month_start
        ).aggregate(t=Sum("amount"))["t"] or 0
        recent_revenue = paid_payments.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(t=Sum("amount"))["t"] or 0
 
        # ── Subscription stats ────────────────────────────────────────────────
        active_subs  = Subscription.objects.filter(is_active=True).count()
        expired_subs = Subscription.objects.filter(
            is_active=False, expiry_date__lt=now
        ).count()
 
        # ── Revenue by month (last 12 months) ─────────────────────────────────
        twelve_months_ago = now - timedelta(days=365)
        revenue_by_month = (
            paid_payments
            .filter(created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month")
        )
        revenue_chart = [
            {
                "month": r["month"].strftime("%b %Y"),
                "revenue": float(r["total"]),
                "payments": r["count"],
            }
            for r in revenue_by_month
        ]
 
        # ── New tenants by month (last 12 months) ─────────────────────────────
        tenants_by_month = (
            tenants
            .filter(created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        tenant_chart = [
            {"month": r["month"].strftime("%b %Y"), "count": r["count"]}
            for r in tenants_by_month
        ]
 
        # ── Plan popularity ───────────────────────────────────────────────────
        plan_stats = (
            Subscription.objects
            .values("plan__plan_name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        plan_chart = [
            {"plan": p["plan__plan_name"], "count": p["count"]}
            for p in plan_stats
        ]
 
        # ── Tenant status breakdown ───────────────────────────────────────────
        status_chart = [
            {"status": "Active",    "count": tenant_active,    "color": "#10B981"},
            {"status": "Inactive",  "count": tenant_inactive,  "color": "#6B7280"},
            {"status": "Suspended", "count": tenant_suspended, "color": "#EF4444"},
            {"status": "Trial",     "count": tenant_trial,     "color": "#F59E0B"},
        ]
 
        # ── Recent tenants ────────────────────────────────────────────────────
        recent_tenants = (
            tenants
            .order_by("-created_at")[:8]
            .values("id", "institute_name", "email", "status", "created_at", "phone")
        )
        recent_tenants_list = [
            {
                "id": str(t["id"]),
                "institute_name": t["institute_name"],
                "email": t["email"],
                "status": t["status"],
                "phone": t["phone"],
                "created_at": t["created_at"].strftime("%d %b %Y"),
            }
            for t in recent_tenants
        ]
 
        # ── Recent payments ───────────────────────────────────────────────────
        recent_payments = (
            paid_payments
            .select_related("tenant")
            .order_by("-created_at")[:8]
        )
        recent_payments_list = [
            {
                "id": p.id,
                "institute": p.tenant.institute_name,
                "amount": float(p.amount),
                "currency": p.currency,
                "created_at": p.created_at.strftime("%d %b %Y"),
            }
            for p in recent_payments
        ]
 
        return Response({
            # KPI cards
            "kpis": {
                "tenant_total":     tenant_total,
                "tenant_active":    tenant_active,
                "tenant_new_month": tenant_new_month,
                "total_revenue":    float(total_revenue),
                "month_revenue":    float(month_revenue),
                "active_subs":      active_subs,
                "expired_subs":     expired_subs,
                "total_users":      total_users,
                "total_admins":     total_admins,
                "total_teachers":   total_teachers,
                "total_students":   total_students,
            },
            # Charts
            "revenue_chart":  revenue_chart,
            "tenant_chart":   tenant_chart,
            "plan_chart":     plan_chart,
            "status_chart":   status_chart,
            # Tables
            "recent_tenants":  recent_tenants_list,
            "recent_payments": recent_payments_list,
        })