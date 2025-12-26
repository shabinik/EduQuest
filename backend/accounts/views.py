from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions,status
from rest_framework.response import Response
from .serializers import LoginSerializer,UserSerializer,AdminSignupSerializer,AdminVerifyEmailSerializer,ChangePasswordSerializer,AdminProfileSerializer,AdminResendOtpSerializer
from django.conf import settings
from . permissions import IsAdmin
import cloudinary.uploader
from rest_framework.parsers import MultiPartParser,FormParser
from accounts.models import User
from subscription.models import Subscription

# Create your views here.

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self,request):
        serializer = LoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        access_token = data["access"]
        refresh_token = data["refresh"]
        user_data = data["user"]
        user = User.objects.get(id=user_data["id"])

        has_active_subscription = False
        expiry_date = None

        if user.tenant:
            subscription = Subscription.objects.filter(tenant=user.tenant,is_active=True
                                                       ).order_by('-expiry_date').first()
            if subscription:
                has_active_subscription = True
                expiry_date = subscription.expiry_date
        
        response = Response(
            {
                "user": user_data,
                "has_active_subscription": has_active_subscription,
                "expiry_date": expiry_date,
            },
            status=status.HTTP_200_OK
        )

        #Set HTTP-only cookies (access short, refresh longer)
        # In production: secure=True, samesite='Strict' (and send over HTTPS)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            domain="localhost",
            path='/',
            max_age= 60 * 5, #5 min
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            domain="localhost",
            path='/',
            max_age= 60 * 60 * 24 * 7, # 7 days
        )

        return response
    

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request):
        resp = Response({"detail":"Logged out"}, status= status.HTTP_200_OK)
        resp.delete_cookie("access_token")
        resp.delete_cookie("refresh_token")
        return resp
    

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class ProfileImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self,request):
        image = request.FILES.get("image")

        if not image:
            return Response({"detail": "No image provided"},status=status.HTTP_400_BAD_REQUEST)
        
        #Upload to cloudinary
        result = cloudinary.uploader.upload(
            image,
            folder = "eduquest/profile_images",
            public_id = f"user_{request.user.id}",
            overwrite = True
        )

        #Save Url
        request.user.profile_image = result["secure_url"]
        request.user.save()

        return Response({"profile_image":result["secure_url"]},status=status.HTTP_200_OK)
    


class AdminSingupView(APIView):
    def post(self,request):
        serializer = AdminSignupSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message":"Signup successful. Please check your email for OTP."},
                status = status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminResendOtpView(APIView):
    def post(self, request):
        serializer = AdminResendOtpSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save() 
            return Response({"message":"OTP resent successfully"})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
          

class AdminVerifyEmailView(APIView):
    def post(self,request):
        serializer = AdminVerifyEmailSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Email verified. You can now login."})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)  
    

class AdminProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not an admin"}, status=403)

        serializer = AdminProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not an admin"}, status=403)

        serializer = AdminProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


   
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self,request):
        serializer = ChangePasswordSerializer(data = request.data, context={"request":request})

        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.must_change_password = False
            user.save()
            return Response({"detail": "Password changed successfully."})
        return Response(serializer.errors, status=400)