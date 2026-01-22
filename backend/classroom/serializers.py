from rest_framework import serializers
from . models import SchoolClass,Subject,TimeSlot,TimeTable,TimeTableEntry


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
    

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id","name","code","is_active"]

    def validate_name(self,value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject Name cannot be empty")
        return value
    
    def validate(self, attrs):
        request = self.context["request"]
        tenant = request.user.tenant

        qs = Subject.objects.filter(
            tenant = tenant,
            name__iexact = attrs["name"]
        )

        if self.instance:
            qs = qs.exclude(id = self.instance.id)

        if qs.exists():
            raise serializers.ValidationError({"name":"Subject with this name already exists."})

        return attrs
    


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["id", "start_time", "end_time","is_break"] 

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")

        if self.instance:
            start = start or self.instance.start_time
            end = end or self.instance.end_time

        if start >= end:
            raise serializers.ValidationError(
                "End time must be after start time."
            )  

        tenant = self.context["request"].user.tenant

        qs = TimeSlot.objects.filter(
            tenant=tenant,
            start_time__lt = end,
            end_time__gt = start,
        )  

        if self.instance:
            qs = qs.exclude(id = self.instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                "This time slot overlaps with an existing slot."
            )
        
        return attrs


class TimeTableSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source = 'school_class.name',read_only = True)
    division = serializers.CharField(source = 'school_class.division', read_only = True)

    class Meta:
        model = TimeTable
        fields = ["id", "school_class", "class_name", "division"]
        read_only_fields = ["id", "created_at"]

    

class TimeTableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source = "subject.name",read_only = True)
    teacher_name = serializers.CharField(source= "teacher.user.full_name", read_only = True)
    slot_time = serializers.CharField(source = 'slot', read_only = True)

    class Meta:
        model = TimeTableEntry
        fields = [
            "id", "timetable", "day", "slot", "subject", "teacher",
            "subject_name", "teacher_name", "slot_time" 
        ]

    def validate(self, data):
        request = self.context["request"]
        tenant = request.user.tenant
        slot = data.get("slot")

        if slot.tenant != tenant:
            raise serializers.ValidationError("Invalid slot tenant.")
        
        if slot.is_break:
            if data.get("subject") or data.get("teacher"):
                raise serializers.ValidationError(
                    "Break slots cannot have subject or teacher."
                )
            return data
        
        if not data.get("subject"):
            raise serializers.ValidationError(
                "Subject is required for class slots."
            )

        if not data.get("teacher"):
            raise serializers.ValidationError("Teacher is required for class slots.")
        
        # Check Teacher Availability (Teacher cannot be in two places at once)
        teacher_overlap = TimeTableEntry.objects.filter(
            tenant = tenant,
            day = data["day"], 
            slot = slot, 
            teacher = data["teacher"]
        )

        if self.instance:
            teacher_overlap = teacher_overlap.exclude(id = self.instance.id)

        if teacher_overlap.exists():
            raise serializers.ValidationError(
                "This teacher is already assigned to another class at this time"
            )
        
        # Check Class Availability (Class cannot have two subjects at same time)
        class_overlap = TimeTableEntry.objects.filter(
            tenant = tenant,
            timetable = data["timetable"],
            day = data["day"],
            slot = data["slot"]
        )

        if self.instance:
            class_overlap = class_overlap.exclude(id = self.instance.id)

        if class_overlap.exists():
            raise serializers.ValidationError(
                "This class already has a subject assigned at this slot."
            )    
        
        return data
    