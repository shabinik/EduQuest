from rest_framework import serializers
from accounts.models import Tenant,User
from subscription.models import Subscription,Payment


class TenantListSerializer(serializers.ModelSerializer):
    current_plan = serializers.SerializerMethodField()
    subscription_expiry = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = [
            "id",
            "institute_name",
            "email",
            "phone",
            "status",
            "created_at",
            "current_plan",
            "subscription_expiry",
        ]

    def get_current_plan(self, obj):
        sub = (
            obj.subscriptions.filter(is_active = True)
            .order_by("start_date").first()
        )
        return sub.plan.plan_name if sub else "-"
    
    def get_subscription_expiry(self, obj):
        sub = (
            obj.subscriptions.filter(is_active = True)
            .order_by("start_date").first()
        )
        return sub.expiry_date if sub else None
    

class TenantBillingSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()
    admin_email = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = ["id", "institute_name", "email", "phone", "status",
                  "created_at", "subscription", "payments", "admin_email"]
        
    def get_admin_email(self, obj):
        admin = User.objects.filter(tenant = obj,role="admin").first()
        return admin.email if admin else None
    
    def get_subscription(self, obj):
        sub = Subscription.objects.filter(tenant=obj).order_by("-start_date").first()
        if not sub:
            return None
        return {
            "plan_name": sub.plan.plan_name,
            "start": sub.start_date,
            "expiry": sub.expiry_date,
            "is_active": sub.is_active
        }
    
    def get_payments(self,obj):
        return [
            {
                "amount": str(p.amount),
                "currency": p.currency,
                "status": p.status,
                "order_id": p.razorpay_order_id,
                "payment_id": p.razorpay_payment_id,
                "created": p.created_at
            }
            for p in obj.payments.all()
        ]
    
    
