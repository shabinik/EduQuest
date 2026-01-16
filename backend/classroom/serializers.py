from rest_framework import serializers
from . models import SchoolClass,TimeTable


class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = [
            "id",
            "name",
            "division",
            "class_teacher",
            "max_student",
            "academic_year",
        ]
    
    def validate_name(self,value):
        if not value.strip():
            raise serializers.ValidationError("Class name cannot be empty.")
        return value
    
    def validate_division(self, value):
        if not value.strip():
            raise serializers.ValidationError("Division cannot be empty.")
        return value
    
    def validate_max_student(self, value):
        if value <= 0:
            raise serializers.ValidationError("Max students must be positive.")
        return value
    
    def validate_class_teacher(self,teacher):
        tenant = self.context["request"].user.tenant

        if SchoolClass.objects.filter(
            tenant = tenant,
            class_teacher = teacher,
            academic_year = self.initial_data.get("academic_year"),
            is_active = True
        ).exists():
            raise serializers.ValidationError(
                "This teacher is already assigned as class teacher."
            )
        return teacher
    
    def create(self, validated_data):
        request = self.context["request"]
        tenant = request.user.tenant

        return SchoolClass.objects.create(
            tenant = tenant,
            **validated_data
        )