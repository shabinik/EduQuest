from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model = User
        fields = [
            "id","username","full_name","email","role","tenant","tenant_name",
            "phone","gender","profile_image"
        ]
        read_only_fields = ["id","role","tenant_name"]

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
    

