from rest_framework import serializers
from . models import Announcement
from django.utils.timezone import now
from . models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "title",
            "description",
            "target_audience",
            "attachment",
            "expiry_date",
            "is_active",
            "created_at",
        ]

    def get_is_active(self, obj):
        return obj.expiry_date > now()

    def validate_expiry_date(self,value):
        if value <= now():
            raise serializers.ValidationError(
                "Expiry date must be in the future."
            )
        return value
    
    def create(self,validated_data):
        tenant = self.context['request'].user.tenant

        return Announcement.objects.create(
            tenant = tenant,
            **validated_data
        )
    

