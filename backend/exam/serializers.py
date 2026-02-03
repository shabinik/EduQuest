from rest_framework import serializers
from .models import Exam, ExamResult, ExamConcern
from classroom.models import SchoolClass

class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    total_students = serializers.ReadOnlyField()
    results_submitted = serializers.ReadOnlyField()
    class_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'subject', 'subject_name',
            'teacher_name', 'classes', 'class_details', 'exam_date',
            'start_time', 'end_time', 'room', 'max_marks', 'status',
            'total_students', 'results_submitted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['teacher', 'status', 'created_at', 'updated_at']
    
    def get_class_details(self, obj):
        return [
            {'id': cls.id, 'name': cls.name, 'division': cls.division}
            for cls in obj.classes.all()
        ]
    
    def validate(self, attrs):
        # Validate that end_time is after start_time
        if attrs.get('start_time') and attrs.get('end_time'):
            if attrs['end_time'] <= attrs['start_time']:
                raise serializers.ValidationError(
                    "End time must be after start time"
                )
        
        # Validate that exam_date is not in the past (for new exams)
        if not self.instance and attrs.get('exam_date'):
            from datetime import date
            if attrs['exam_date'] < date.today():
                raise serializers.ValidationError(
                    "Exam date cannot be in the past"
                )
        
        return attrs
    
    def create(self, validated_data):
        request = self.context['request']
        classes = validated_data.pop('classes',[])

        exam = Exam.objects.create(
            teacher = request.user.teacher_profile,
            tenant = request.user.tenant,
            **validated_data
        )
        exam.classes.set(classes)
        return exam
    

class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    max_marks = serializers.IntegerField(source='exam.max_marks', read_only=True)
    percentage = serializers.ReadOnlyField()
    grade = serializers.ReadOnlyField()
    has_concern = serializers.SerializerMethodField()

    class Meta:
        model = ExamResult
        fields = [
            'id', 'exam', 'exam_title', 'student', 'student_name',
            'student_roll', 'marks_obtained', 'max_marks', 'percentage',
            'grade', 'status', 'remarks', 'has_concern', 'graded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'graded_at', 'created_at', 'updated_at']

    def get_has_concern(self,obj):
        return obj.concerns.exists()
        
    def validate_marks_obtained(self, value):
        if value is not None:
            exam = self.instance.exam if self.instance else None
            if self.initial_data.get('exam'):
                exam = Exam.objects.get(id = self.initial_data['exam'])

            if exam and value > exam.max_marks:
                raise serializers.ValidationError(
                    f"Marks cannot exceed maximum marks ({exam.max_marks})"
                )
            if value < 0:
                raise serializers.ValidationError("Marks cannot be negative")
        return value
        



class ExamConcernSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    exam_title = serializers.CharField(source='result.exam.title', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.user.full_name', read_only=True)
    
    class Meta:
        model = ExamConcern
        fields = [
            'id', 'result', 'student', 'student_name', 'exam_title',
            'concern_text', 'status', 'response', 'reviewed_by',
            'reviewed_by_name', 'previous_marks', 'revised_marks',
            'created_at', 'reviewed_at', 'updated_at'
        ]
        read_only_fields = [
            'student', 'status', 'response', 'reviewed_by',
            'previous_marks', 'revised_marks', 'reviewed_at',
            'created_at', 'updated_at'
        ]
    
    def validate(self, attrs):
        result = attrs.get('result', self.instance.result if self.instance else None)

        # Check if result is graded
        if result and result.status != 'graded':
            raise serializers.ValidationError(
                "Cannot raise concern for ungraded result"
            )
        
        if not self.instance:
            request = self.context['request']
            existing = ExamConcern.objects.filter(
                result = result,
                student = request.user.student_profile,
            ).exists()

            if existing:
                raise serializers.ValidationError(
                    "You already Used or have a pending concern for this result"
                )
            
        return attrs
    
    def create(self, validated_data):
        request = self.context['request']
        return ExamConcern.objects.create(
            student = request.user.student_profile,
            **validated_data
        )
    


class TeacherReviewConcernSerializer(serializers.Serializer):
    """Serializer for teacher to review concern"""
    status = serializers.ChoiceField(choices=['under_review', 'resolved', 'rejected'])
    response = serializers.CharField(required=True)
    revised_marks = serializers.FloatField(required=False, allow_null=True)
    
    def validate_revised_marks(self, value):
        if value is not None:
            if value < 0:
                raise serializers.ValidationError("Marks cannot be negative")
        return value