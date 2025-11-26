from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions,status
from rest_framework.response import Response
from .serializers import LoginSerializer,UserSerializer,AdminSignupSerializer,AdminVerifyEmailSerializer
from django.conf import settings


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

        response = Response({"user":user_data},status=status.HTTP_200_OK)

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
        

class AdminVerifyEmailView(APIView):
    def post(self,request):
        serializer = AdminVerifyEmailSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Email verified. You can now login."})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)  
    
    
