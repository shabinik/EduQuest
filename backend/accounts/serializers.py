from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.core.mail import send_mail
import random
from . models import Tenant, EmailOtp

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

        #GENEARTE OTP
        code = f"{random.randint(100000,999999)}"
        otp = EmailOtp.objects.create(
            user = user,
            email = email,
            code = code,
            expires_at = timezone.now() + timezone.timedelta(minutes=2)
        )

        #SEND OTP VIA EMAIL
        send_mail(
            subject="EduQuest Admin Email Verification",
            message=f"Your OTP code is {code}",
            from_email=None, 
            recipient_list=[email],
            fail_silently=True,
        )

        return user
    

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
        
