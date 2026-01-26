from rest_framework import serializers
from . models import Assignment,AssignmentSubmission
from classroom.models import TimeTableEntry


class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    attachment = serializers.FileField(required=False, allow_null=True)
    subject_name = serializers.CharField(source = 'subject.name', read_only = True)
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only = True)
    student_submission = serializers.SerializerMethodField()
    
    # Add this to properly serialize classes in responses
    class Meta:
        model = Assignment
        fields = [
            "id", 
            "subject", 
            "subject_name",
            "teacher_name",
            "classes", 
            "title", 
            "description", 
            "attachment",                 
            "due_date", 
            "total_marks",
            "submission_count", 
            "is_overdue",
            "created_at",
            "student_submission",
        ]

    def get_student_submission(self, obj):
        request = self.context.get('request')

        if request and hasattr(request.user,'student_profile'):
            try:
                submission = AssignmentSubmission.objects.get(
                    assignment = obj,
                    student = request.user.student_profile
                )
                return {
                    'id': submission.id,
                    'status': submission.status,
                    'marks_obtained': submission.marks_obtained,
                    'feedback': submission.feedback,
                    'submitted_at': submission.submitted_at,
                    'attachment': submission.attachment.url if submission.attachment else None,
                    'description': submission.description,
                    'percentage': submission.percentage,
                    'is_late': submission.is_late
                }
            except AssignmentSubmission.DoesNotExist:
                return None
        return None

    def validate(self, attrs):
        request = self.context["request"]
        
        if not hasattr(request.user, "teacher_profile"):
            raise serializers.ValidationError("Teacher profile not found.")

        teacher = request.user.teacher_profile
        subject = attrs.get("subject", getattr(self.instance, "subject", None))
        classes = attrs.get("classes")

        # Handle classes validation
        check_classes = classes if classes is not None else (
            self.instance.classes.all() if self.instance else []
        )
        
        if subject and check_classes:
            if not TimeTableEntry.objects.filter(
                teacher=teacher,
                subject=subject,
                timetable__school_class__in=check_classes
            ).exists():
                raise serializers.ValidationError(
                    "You are not assigned to this subject for the selected classes."
                )
        
        return attrs
        
    def create(self, validated_data):
        request = self.context["request"]
        classes = validated_data.pop("classes", [])

        assignment = Assignment.objects.create(
            teacher=request.user.teacher_profile,
            tenant=request.user.tenant,
            **validated_data
        )
        assignment.classes.set(classes)
        return assignment
    
    def update(self, instance, validated_data):
        classes = validated_data.pop("classes", None)
        
        # Update all fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update classes if provided
        if classes is not None:
            instance.classes.set(classes)
        
        return instance


class StudentAssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    percentage = serializers.ReadOnlyField()
    is_late = serializers.ReadOnlyField()
    attachment = serializers.FileField(required = True)
    assignment_title = serializers.CharField(source = 'assignment.title', read_only = True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
            "description",
            "attachment",
            "marks_obtained",
            "feedback",
            "status",
            "percentage",
            "is_late",
            "submitted_at",
            "graded_at",
        ]

        read_only_fields = [
            "student",
            "marks_obtained",
            "feedback",
            "status",
            "graded_at",
        ]

    def validate(self, attrs):
        request = self.context["request"]

        if not hasattr(request.user, "student_profile"):
            raise serializers.ValidationError("Student profile not found.")
        
        student = request.user.student_profile
        assignment = attrs.get("assignment", getattr(self.instance,"assignment",None))
        
        if self.instance:
            if self.instance.status in ['graded']:
                raise serializers.ValidationError(
                    "Cannot edit a graded submission"
                )
        else:           
            if AssignmentSubmission.objects.filter(
                student = student, assignment = assignment
            ).exists():
                raise serializers.ValidationError(
                    "You have already submitted this assignment."
                )
        
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["student"] = request.user.student_profile
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Only allow updating description and attachment
        instance.description = validated_data.get('description', instance.description)
        if 'attachment' in validated_data:
            instance.attachment = validated_data['attachment']
        instance.save()
        return instance



class TeacherAssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_roll_number = serializers.CharField(source="student.roll_number", read_only = True)
    assignment_title = serializers.CharField(source = "assignment.title",read_only = True)
    total_marks = serializers.IntegerField(source="assignment.total_marks", read_only=True)
    percentage = serializers.ReadOnlyField()
    is_late = serializers.ReadOnlyField()
    attachment = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "student_name",
            "student_roll_number",
            "assignment_title",
            "description",
            "attachment",
            "marks_obtained",
            "feedback",
            "status",
            "submitted_at",
            "graded_at",
            "total_marks",
            "percentage",
            "is_late",
        ]
        read_only_fields = [
            "student_name",
            "student_roll_number",
            "assignment_title",
            "description",
            "attachment",
            "submitted_at",
            "status",
            "total_marks",
            "percentage",
            "is_late",
        ]

    def get_attachment(self, obj):
        if obj.attachment:
            try:
                return obj.attachment.url
            except Exception as e:
                print(f"Error getting attachment URL: {e}")
                return None
        return None

    def validate_marks_obtained(self, value):
        if value is not None:
            assignment = self.instance.assignment if self.instance else None
            if assignment and value > assignment.total_marks:
                raise serializers.ValidationError(
                    f"Marks cannot exceed {assignment.total_marks}"
                )
            if value < 0:
                raise serializers.ValidationError("Marks cannot be negative")
        return value
