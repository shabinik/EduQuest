from rest_framework import serializers
from django.utils import timezone
from .models import Meeting


class MeetingSerializer(serializers.ModelSerializer):
    jitsi_url = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()
    school_class_name = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = [
            "id",
            "title",
            "description",
            "meeting_type",
            "school_class", 
            "school_class_name", 
            "room_name",
            "jitsi_url",
            "scheduled_at",
            "duration_minutes",
            "status",
            "created_by",
            "created_by_name",
            "tenant",
            "created_at",
            "updated_at"
        ]
        read_only_fields = [
            "id",
            "meeting_type",
            "room_name",
            "jitsi_url",
            "created_by",
            "created_by_name",
            "school_class_name",
            "tenant",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        if isinstance(obj, dict):
            return None
        return obj.created_by.full_name or obj.created_by.email
    
    def get_school_class_name(self, obj):
        if isinstance(obj, dict):
            return None
        if obj.school_class:
            return str(obj.school_class)   # uses SchoolClass.__str__
        return None
    
    def validate_scheduled_at(self, value):
        if value < timezone.now():
            raise serializers.ValidationError(
                "Meeting cannot be scheduled in the past."
            )
        return value
    
    def validate(self, attrs):
        request = self.context.get("request")
        meeting_type = None

        if request:
            role = getattr(request.user,"role",None)
            if role == "admin":
                meeting_type = "staff_meeting"
            elif role == "teacher":
                meeting_type = "class_meeting"
        
        if meeting_type == "class_meeting":
            if not attrs.get("school_class"):
                raise serializers.ValidationError(
                    {"school_class": "Please select a class for this meeting."}
                )
        
        if meeting_type == "staff_meeting":
            attrs.pop("school_class", None)
        
        return attrs 
    

class MeetingListSerializer(serializers.ModelSerializer):
    jitsi_url = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()
    school_class_name = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = [
            "id",
            "title",
            "description",
            "meeting_type",
            "school_class_name",
            "jitsi_url",
            "scheduled_at",
            "duration_minutes",
            "status",
            "created_by",
            "created_by_name",
            "created_at",
        ]

    def get_created_by_name(self, obj):
        if isinstance(obj, dict):
            return None
        return obj.created_by.full_name or obj.created_by.email

    def get_school_class_name(self, obj):
        if isinstance(obj, dict):
            return None
        if obj.school_class:
            return str(obj.school_class)
        return None