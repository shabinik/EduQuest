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

    def validate_plan_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Plan name cannot be empty or spaces only.")
        return value

    def validate_duration_months(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be a positive number.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive amount.")
        return value

    def validate_max_students(self, value):
        if value <= 0:
            raise serializers.ValidationError("Max students must be a positive number.")
        return value


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

