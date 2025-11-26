from rest_framework import serializers
from . models import SubscriptionPlan,Subscription,Payment

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id","plan_name","description","is_active","duration_months",
            "price","currency","max_students","created_at","updated_at",
        ]
        read_only_fields = ["id","created_at","updated_at"]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only = True)

    class Meta:
        model = Subscription
        fields = [
            "id","plan","start_date","expiry_date","is_active","payment_reference",
        ]


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id","created_at","updated_at"]

