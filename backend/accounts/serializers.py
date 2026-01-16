from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.core.mail import send_mail
import random
from . models import Tenant, EmailOtp
from . otp_utils import send_otp

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField(read_only = True)
    profile_image = serializers.CharField(read_only = True)

    class Meta:
        model = User
        fields = [
            "id","username","full_name","email","role","tenant","tenant_name",
            "phone","gender","profile_image"
        ]
        read_only_fields = ["id","role","tenant_name","profile_image"]

    def get_tenant_name(self,obj):
        return obj.tenant.institute_name if obj.tenant else None
    

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only = True)

    def validate(self,data):
        from django.contrib.auth import authenticate
        user = authenticate(username = data["username"], password = data["password"])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        
        #JWT Tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return {
            "refresh":str(refresh),
            "access":str(access),
            "user":UserSerializer(user).data
        }
    
class AdminSignupSerializer(serializers.Serializer):
    institute_name = serializers.CharField(max_length = 225)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    full_name = serializers.CharField(max_length=225)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if Tenant.objects.filter(email=value).exists():
            raise serializers.ValidationError("Institute email already registered.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value
    
    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(value) < 8:
            raise serializers.ValidationError("Phone number is too short.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        return value

    
    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self,validated_data):
        institute_name = validated_data["institute_name"]
        email = validated_data["email"]
        phone = validated_data["phone"]
        full_name = validated_data["full_name"]
        password = validated_data["password"]

        #CREATE TENANT

        tenant = Tenant.objects.create(
            institute_name = institute_name,
            email = email,
            phone = phone,
            status = 'inactive'
        )

        #CREATE ADMIN

        user = User.objects.create_user(
            username=email,
            email = email,
            full_name = full_name,
            tenant = tenant,
            role = "admin",
            is_active = False
        )
        user.set_password(password)
        user.save()
        
        #SEND OTP VIA EMAIL
        subject="EduQuest Admin Email Verification",
        message_template=(
            "Hello {name},\n\n"
            "We received a request to verify your email for EduQuest.\n\n"
            "Your One-Time Password (OTP) is:\n\n"
            "   {code}\n\n"
            "This OTP is valid for 2 minutes.\n"
            "If you did not request this, please ignore this email.\n\n"
            "Regards,\n"
            "EduQuest Team"
        ),
        send_otp(user,subject,message_template)

        return user
    

class AdminResendOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email = value,role = 'admin')
        except User.DoesNotExist:
            raise serializers.ValidationError("Admin Acount not found")
        
        if user.is_active:
            raise serializers.ValidationError("Email already verified")
        self.user = user

        return value
    
    def save(self):
        user = self.user       
        subject="EduQuest | Verify Your Email",
        message_template =(
            "Hello {name},\n\n"
            "We received a request to verify your email for EduQuest.\n\n"
            "Your One-Time Password (OTP) is:\n\n"
            "   {code}\n\n"
            "This OTP is valid for 2 minutes.\n"
            "If you did not request this, please ignore this email.\n\n"
            "Regards,\n"
            "EduQuest Team"
        ),
        send_otp(user,subject,message_template)


class AdminVerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length = 6)

    def validate(self, data):
        email = data["email"]
        otp_code = data["otp"]

        try:
            otp_obj = (
                EmailOtp.objects.filter(email=email,code=otp_code,is_used = False).latest("created_at")
            )
        except EmailOtp.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired OTP.")
        
        if not otp_obj.is_valid():
            raise serializers.ValidationError("OTP has expired or already Used")
        
        data["otp_obj"] = otp_obj
        return data
    
    def save(self, **kwargs):
        otp_obj = self.validated_data["otp_obj"]
        otp_obj.is_used = True
        otp_obj.save()

        user = otp_obj.user
        user.is_active = True
        user.save()

        tenant = user.tenant
        if tenant:
            tenant.status = "inactive"
            tenant.save()


        return user
    

class AdminProfileSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.institute_name", required=False)
    tenant_email = serializers.EmailField(source="tenant.email", required=False)
    tenant_phone = serializers.CharField(source="tenant.phone", required=False)
    tenant_status = serializers.CharField(source="tenant.status", read_only=True)

    profile_image = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "phone",
            "gender",
            "profile_image",
            "tenant_name",
            "tenant_email",
            "tenant_phone",
            "tenant_status",
        ]
        read_only_fields = ["email", "tenant_status", "profile_image"]

    def update(self, instance, validated_data):
        tenant_data = validated_data.pop("tenant", {})
        tenant = instance.tenant

        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        if tenant and tenant_data:
            for key, value in tenant_data.items():
                setattr(tenant, key, value)
            tenant.save()

        return instance

        

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required = False,write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        user = self.context['request'].user
        old_password = data.get("old_password")
        if old_password:
            if not user.check_password(old_password):
                raise serializers.ValidationError({"old_password": "Old password is incorrect."})
        return data
        


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")
        self.user = user
        return value
    
    def save(self):
        user = self.user
        code = f"{random.randint(100000, 999999)}"

        EmailOtp.objects.create(
            user = user,
            email = user.email,
            code = code,
            expires_at = timezone.now() + timezone.timedelta(minutes=5),
        )

        send_mail (
            subject="EduQuest Password Reset OTP",
            message=(
                f"Hello {user.full_name},\n\n"
                "We received a request to verify your email for EduQuest.\n\n"
                f"Your password reset One-Time Password (OTP) is:\n\n"
                f"   {code}\n\n"
                "This OTP is valid for 2 minutes.\n"
                "If you did not request this, please ignore this email.\n\n"
                "Regards,\n"
                "EduQuest Team"
            ),
            from_email= None,
            recipient_list=[user.email],
            fail_silently= False,
        )


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)

    def validate(self, data):
        try:
            otp_obj = EmailOtp.objects.filter(
                email=data["email"],
                code=data["otp"],
                is_used=False
            ).latest("created_at")
        except EmailOtp.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired OTP.")

        if not otp_obj.is_valid():
            raise serializers.ValidationError("OTP expired or already used.")

        data["otp_obj"] = otp_obj
        return data

    def save(self):
        otp_obj = self.validated_data["otp_obj"]
        user = otp_obj.user

        user.set_password(self.validated_data["new_password"])
        user.must_change_password = False
        user.save()

        otp_obj.is_used = True
        otp_obj.save()

        return user


class ForgotPasswordResendOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self,value):
        try:
            user = User.objects.get(email = value,is_active = True)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        self.user = user
        return value
    
    def save(self):
        user = self.user
        subject = "EduQuest | Reset Password OTP"
        message_template = (
            "Hello {name},\n\n"
            "We received a request to verify your email for EduQuest.\n\n"
            "Your password reset One-Time Password (OTP) is:\n\n"
            "   {code}\n\n"
            "This OTP is valid for 2 minutes.\n"
            "If you did not request this, please ignore this email.\n\n"
            "Regards,\n"
            "EduQuest Team"
        )
        send_otp(user,subject,message_template)