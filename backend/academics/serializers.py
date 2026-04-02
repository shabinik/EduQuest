from rest_framework import serializers
from . models import Announcement
from django.utils.timezone import now
from . models import Announcement, StudentDailyAttendance,ClassDailyAttendance,MonthlyAttendanceSummary,LeaveRequest

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
    


# --------- Attendance -------------

class StudentDailyAttendanceSerializer(serializers.Serializer):
    student_name = serializers.CharField(source = 'student.user.full_name', read_only = True)
    student_roll = serializers.CharField(source = 'student.roll_number', read_only = True)

    class Meta:
        model = StudentDailyAttendance
        fields = [
            'id',
            'student',
            'student_name',
            'student_roll',
            'status',
            'created_at'
        ]
        read_only_fields = ['created_at']

    
class ClassDailyAttendanceSerializer(serializers.ModelSerializer):
    student_attendances = StudentDailyAttendanceSerializer(many = True, read_only = True)
    class_name = serializers.CharField(source = 'school_class.name', read_only = True)
    division = serializers.CharField(source='school_class.division', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.user.full_name', read_only=True)

    class Meta:
        model = ClassDailyAttendance
        fields = [
            'id',
            'school_class',
            'class_name',
            'division',
            'date',
            'marked_by',
            'marked_by_name',
            'is_completed',
            'marked_at',
            'total_students',
            'present_count',
            'absent_count',
            'student_attendances',
            'created_at'
        ]

        read_only_fields = [
            'marked_by',
            'is_completed',
            'marked_at',
            'total_students',
            'present_count',
            'absent_count',
            'created_at'
        ]


class AttendanceMarkSerializer(serializers.Serializer):
    """Serializer for marking attendance in bulk"""
    school_class = serializers.IntegerField()
    date = serializers.DateField()
    attendance_data = serializers.ListField(
        child = serializers.DictField(
            child = serializers.CharField()
        )
    ) 
    
    def validate_attendance_data(self, value):
        for item in value:
            if 'student_id' not in item or 'status' not in item:
                raise serializers.ValidationError(
                    "Each attendance record must have 'student_id' and 'status'"
                )
            
            if item['status'] not in ['present', 'absent', 'leave']:
                raise serializers.ValidationError(
                    "Status must be 'present', 'absent', or 'leave'"
                )
            
        return value
        
    
class MonthlyAttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    class_name = serializers.CharField(source='school_class.name', read_only=True)
    
    class Meta:
        model = MonthlyAttendanceSummary
        fields = [
            'id',
            'student',
            'student_name',
            'student_roll',
            'school_class',
            'class_name',
            'month',
            'year',
            'total_days',
            'present_days',
            'absent_days',
            'attendance_percentage',
            'last_calculated_at'
        ]

        read_only_fields = ['last_calculated_at']



class LeaveRequestSerializer(serializers.ModelSerializer):
    student_name  = serializers.CharField(source="student.user.full_name",    read_only=True)
    roll_number   = serializers.CharField(source="student.roll_number",        read_only=True)
    class_name    = serializers.CharField(source="student.school_class.__str__", read_only=True)
    days_count    = serializers.ReadOnlyField()
    reviewed_by_name = serializers.CharField(source="reviewed_by.user.full_name", read_only=True, default=None)
 
    class Meta:
        model  = LeaveRequest
        fields = [
            "id", "student_name", "roll_number", "class_name",
            "from_date", "to_date", "days_count", "reason",
            "status", "teacher_remark", "reviewed_by_name", "reviewed_at",
            "created_at",
        ]
        read_only_fields = ["id", "status", "teacher_remark", "reviewed_by_name", "reviewed_at", "created_at"]
 
 
class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LeaveRequest
        fields = ["from_date", "to_date", "reason"]
 
    def validate(self, data):
        from django.utils import timezone
        if data["from_date"] > data["to_date"]:
            raise serializers.ValidationError("From date must be before or equal to To date.")
        if data["from_date"] < timezone.now().date():
            raise serializers.ValidationError("Leave cannot be requested for past dates.")
        return data
 
 
class LeaveReviewSerializer(serializers.Serializer):
    status         = serializers.ChoiceField(choices=["approved", "rejected"])
    teacher_remark = serializers.CharField(required=True, allow_blank=False)
 