from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin,HasActiveSubscription
from . serializers import AnnouncementSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from . models import Announcement
from rest_framework import generics 


# Create your views here.

class CreateAnnouncement(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]
    
    def post(self,request):
        serializer = AnnouncementSerializer(data = request.data,context = {'request':request})
        if serializer.is_valid():
            announcement = serializer.save()
            return Response(
                {
                   "success":True,
                   "message":"Announcement Created Successfull",
                   "id" : announcement.id
                },status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class AnnouncementAudienceView(APIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get(self,request):
        user = request.user
        tenant = user.tenant
        now = timezone.now()

        qs = Announcement.objects.filter(
            tenant = tenant,
            expiry_date__gte = now
        ).order_by('-created_at')

        if user.role == 'teacher':
            qs = qs.filter(target_audience__in = ['all','teacher'])
        elif user.role == 'student':
            qs = qs.filter(target_audience__in = ['all','students'])
        
        data = [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "attachment": a.attachment,
                "audience": a.target_audience,
                "expiry_date": a.expiry_date,
                "created_at": a.created_at,
            }
            for a in qs
        ]

        return Response(data)
    

class AdminAnnouncementList(APIView):
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get(self, request):
        tenant = request.user.tenant
        announcements = (
            Announcement.objects.filter(tenant = tenant)
            .order_by("-created_at")
        )

        data = [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "attachment": a.attachment,
                "target_audience": a.target_audience,
                "expiry_date": a.expiry_date,
                "is_active": a.expiry_date > timezone.now(),
                "created_at": a.created_at,
            }
            for a in announcements
        ]

        return Response(data)


class AdminAnnouncementUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated,IsAdmin,HasActiveSubscription]

    def get_queryset(self):
        return Announcement.objects.filter(tenant = self.request.user.tenant)
    

    
    



