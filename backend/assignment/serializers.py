from rest_framework import serializers
from . models import Assignment,AssignmentSubmission
from classroom.models import TimeTableEntry


class AssignmentSerializer(serializers.ModelSerializer):
    submission_count = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    attachment = serializers.FileField(required = False)

    class Meta:
        model = Assignment
        fields = [
            "id", 
            "subject", 
            "classes", 
            "title", 
            "description", 
            "attachment",                 
            "due_date", 
            "total_marks",
            "submission_count", 
            "is_overdue",
            "created_at"
        ]

    def validate(self, attrs):
        request = self.context["request"]
        

        if not hasattr(request.user, "teacher_profile"):
            raise serializers.ValidationError("Teacher profile not found.")


        teacher = request.user.teacher_profile
        subject = attrs.get("subject")
        classes = attrs.get("classes", [])

        if subject and not TimeTableEntry.objects.filter(
            teacher=teacher,
            subject=subject,
            timetable__school_class__in=classes
        ).exists():
            raise serializers.ValidationError(
                "You are not assigned to this subject for the selected classes."
            )
        
        invalid_classes = [
            c for c in classes
            if not TimeTableEntry.objects.filter(
                teacher = teacher,
                timetable__school_class = c
            ).exists()
        ]

        if invalid_classes:
            raise serializers.ValidationError(
                "You are not assigned to one or more selected classes."
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
    


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.user.full_name", read_only=True
    )
    percentage = serializers.ReadOnlyField()
    is_late = serializers.ReadOnlyField()

    class Meta:
        model = AssignmentSubmission
        fields = [
            "id",
            "assignment",
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
            "status",
            "graded_at",
        ]

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["student"] = request.user.student_profile
        return super().create(validated_data)
