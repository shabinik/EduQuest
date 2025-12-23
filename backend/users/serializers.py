from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
import secrets
import string
from . models import Teacher,Student
from accounts.models import Tenant
import re

User = get_user_model()

def generate_random_password(length=10):
    alphabet = string.ascii_letters + string.digits + "!@#$%&"
    return ''.join(secrets.choice(alphabet) for _  in range(length))


class TeacherCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    qualification = serializers.CharField(required=False, allow_blank=True)
    joining_date = serializers.DateField(required=False, allow_null=True)
    salary = serializers.IntegerField(required=False, min_value=0)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate_full_name(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "Full name cannot contain only spaces."
            )
        return value.strip()

    def validate_qualification(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "Qualification cannot contain only spaces."
            )
        return value.strip()

    def validate_phone(self, value):
        if value:
            if not value.isdigit():
                raise serializers.ValidationError(
                    "Phone number must contain only digits."
                )
            if len(value) < 10 or len(value) > 15:
                raise serializers.ValidationError(
                    "Phone number must be between 10 and 15 digits."
                )
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        admin_user = request.user

        if not admin_user.tenant:
            raise serializers.ValidationError(
                "Admin user must belong to a tenant."
            )

        password = generate_random_password()

        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data["email"],
                email=validated_data["email"],
                full_name=validated_data.get("full_name", ""),
                phone=validated_data.get("phone", ""),
                tenant=admin_user.tenant,
                role="teacher",
                is_active=True,
            )

            user.set_password(password)
            user.must_change_password = True
            user.save()

            teacher = Teacher.objects.create(
                user=user,
                qualification=validated_data.get("qualification", ""),
                joining_date=validated_data.get("joining_date"),
                salary=validated_data.get("salary", 0),
            )

        try:
            send_mail(
                subject="Your EduQuest Teacher Account",
                message=(
                    f"Hello {user.full_name or user.email},\n\n"
                    f"You have been added as a teacher at "
                    f"{admin_user.tenant.institute_name}.\n\n"
                    f"Username: {user.email}\n"
                    f"Password: {password}\n\n"
                    "Please login and change your password."
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            pass

        return teacher



class TeacherProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email',read_only=True)
    full_name = serializers.CharField(source = 'user.full_name',required=False)
    phone = serializers.CharField(source='user.phone',required = False)
    gender = serializers.CharField(source='user.gender', required=False)
    DOB = serializers.DateField(source='user.DOB', required=False)
    profile_image = serializers.CharField(
        source='user.profile_image',
        read_only = True,
        allow_null=True
    )

    class Meta:
        model = Teacher
        fields = ['id', 'email', 'full_name', 'phone','gender','DOB','profile_image', 'qualification', 'joining_date', 'salary']
        read_only_fields = ['id','email','profile_image']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user',{})
        user = instance.user

        for k,v in user_data.items():
            setattr(user, k, v)
        user.save()
        
        return super().update(instance,validated_data)
    


class StudentCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=225)
    admission_number = serializers.CharField(max_length=50)
    class_id = serializers.CharField(max_length=100)
    roll_number = serializers.IntegerField(min_value=1)

    # ---------- FIELD VALIDATIONS ----------

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Full name cannot be empty or spaces only."
            )
        return value.strip()

    def validate_admission_number(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Admission number cannot be empty."
            )

        if not re.match(r"^[A-Za-z0-9\-]+$", value):
            raise serializers.ValidationError(
                "Admission number must be alphanumeric."
            )

        if Student.objects.filter(admission_number=value).exists():
            raise serializers.ValidationError(
                "Admission number already exists."
            )

        return value

    def validate_class_id(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Class cannot be empty."
            )
        return value.strip()

    def validate_roll_number(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Roll number must be a positive integer."
            )
        return value

    # ---------- CREATE ----------

    def create(self, validated_data):
        request = self.context.get("request")
        admin_user = request.user

        if not admin_user.tenant:
            raise serializers.ValidationError(
                "Admin must belong to a tenant."
            )

        password = generate_random_password()

        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data["email"],
                email=validated_data["email"],
                full_name=validated_data["full_name"],
                tenant=admin_user.tenant,
                role="student",
                is_active=True,
                must_change_password=True,
            )
            user.set_password(password)
            user.save()

            student = Student.objects.create(
                user=user,
                admission_number=validated_data["admission_number"],
                class_id=validated_data["class_id"],
                roll_number=validated_data["roll_number"],
            )

        try:
            send_mail(
                subject="EduQuest Student Account Created",
                message=(
                    f"Hello {user.full_name},\n\n"
                    "Your student account has been created.\n\n"
                    f"Username: {user.email}\n"
                    f"Password: {password}\n\n"
                    "You must change your password on first login.\n\n"
                    "Regards,\nEduQuest Team"
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:           
            pass

        return student


class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name")
    email = serializers.EmailField(source="user.email")
    phone = serializers.CharField(source="user.phone",allow_null=True)
    profile_image = serializers.CharField(source="user.profile_image", allow_null=True)

    class Meta:
        model = Student
        fields = ["id", "profile_image","full_name", "email", "phone", "admission_number", "class_id", "roll_number"]


class StudentDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name")
    email = serializers.EmailField(source="user.email")
    phone = serializers.CharField(source="user.phone", allow_null=True)
    gender = serializers.CharField(source="user.gender", allow_null=True)
    DOB = serializers.DateField(source="user.DOB", allow_null=True)
    profile_image = serializers.CharField(source="user.profile_image", allow_null=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "profile_image",
            "full_name",
            "email",
            "phone",
            "gender",
            "DOB",
            "admission_number",
            "class_id",
            "roll_number",
            "admission_date",
            "guardian_name",
            "guardian_contact",
        ]

       
class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", required=False)
    phone = serializers.CharField(source="user.phone", required=False)
    profile_image = serializers.CharField(source='user.profile_image',read_only=True,required=False)


    class Meta:
        model = Student
        fields = [
            "email",
            "full_name",
            "phone",
            "profile_image",
            "admission_number",
            "class_id",
            "roll_number",
            "guardian_name",
            "guardian_contact",
            "admission_date",
        ]
        read_only_fields = ["admission_number", "class_id", "roll_number","profile_image"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        user = instance.user

        for key, value in user_data.items():
            setattr(user, key, value)
        user.save()

        return super().update(instance, validated_data)




