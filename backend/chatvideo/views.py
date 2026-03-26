from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import HasActiveSubscription
from . models import AIChatMessage
from django.conf import settings
from google import genai
from google.genai import errors as genai_errors

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Meeting
from .serializers import MeetingSerializer, MeetingListSerializer
from accounts.permissions import IsAdmin,IsTeacher, HasActiveSubscription

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Create your views here.

# -------AI ASSISTANCE FOR STUDENTS--------

class StudentAIChatView(APIView):

    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def post(self, request):
        user_message = request.data.get("message")

        if not user_message:
            return Response({"error":"Message required"},status=400)
        
        student = request.user.student_profile

        AIChatMessage.objects.create(
            student = student,
            role = "user",
            content = user_message
        )  

        history = AIChatMessage.objects.filter(
            student = student
        ).order_by("-created_at")[:10][::-1]

        chat_history = ""
        for msg in history:
            if msg.role == 'user':
                chat_history += f"Student:{msg.content}\n"
            else:
                chat_history += f"AI : {msg.content}\n"

        prompt = f"""
        You are a helpful AI tutor for students.

        Student Name: {request.user.full_name}

        Explain answers clearly and simply.
        If it's a math problem, solve step by step.

        Conversation:
        {chat_history}
        
        Student: {user_message}
        AI:
        """
        response = client.models.generate_content(
            model = "gemini-1.5-flash",
            contents = prompt
        )
        ai_reply = response.text

        AIChatMessage.objects.create(
            student = student,
            role = "assistant",
            content = ai_reply
        )

        return Response({"reply": ai_reply})



#--------------------Video Meeting ----------------------------------

def get_visible_meetings(user):
    tenant = getattr(user,"tenant",None)
    if not tenant:
        return Meeting.objects.none()
    
    qs = Meeting.objects.filter(tenant = tenant)

    if user.role in ("admin","teacher"):
        staff_qs = qs.filter(meeting_type = 'staff_meeting')

        if user.role == "teacher":
            class_qs = qs.filter(meeting_type = "class_meeting", created_by = user)
        else:
            class_qs = qs.filter(meeting_type = "class_meeting") # Now admin also can see class meetings

        return (staff_qs | class_qs).distinct()
    
    elif user.role == "student":
        try:
            student_class = user.student_profile.school_class
        except Exception:
            return Meeting.objects.none()
        
        if not student_class:
            return Meeting.objects.none()
        
        return qs.filter(meeting_type = "class_meeting", school_class = student_class)
    
    return Meeting.objects.none()



class MeetingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MeetingSerializer
        return MeetingListSerializer
    
    def get_queryset(self):
        return get_visible_meetings(self.request.user)
    
    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "student":
            raise PermissionDenied("Students cannot create meetings.")

        if user.role == "admin":
            serializer.save(
                created_by = user,
                tenant = user.tenant,
                meeting_type = "staff_meeting"
            )

        if user.role == "teacher":
            school_class = serializer.validated_data.get("school_class")
            teacher_profile = getattr(user, "teacher_profile", None)

            if not teacher_profile:
                raise PermissionDenied("No teacher profile found.")
            
            # Allow if they are the class_teacher of that class
            # OR if they appear in any timetable entry for that class
            is_class_teacher = (school_class.class_teacher == teacher_profile)
            teaches_in_class = teacher_profile.timetable_entries.filter(
                timetable__school_class = school_class
            ).exists()

            if not is_class_teacher and not teaches_in_class:
                raise PermissionDenied(
                    "You can only create meetings for classes you teach."
                )
            
            serializer.save(
                created_by = user,
                tenant = user.tenant,
                meeting_type = "class_meeting"
            )


# ─── 2. Retrieve, Update, Delete ────
class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]
    serializer_class = MeetingSerializer

    def get_queryset(self):
        return get_visible_meetings(self.request.user)
    
    def perform_update(self, serializer):
        if self.get_object().created_by != self.request.user:
            raise PermissionDenied("Only the meeting creator can edit this meeting.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise PermissionDenied("Only the meeting creator can cancel this meeting.")
        instance.status = "cancelled"
        instance.save(update_fields=["status", "updated_at"])


class StartMeetingView(APIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def post(self, request, pk):
        meeting = get_object_or_404(Meeting, pk=pk, tenant = request.user.tenant)

        if meeting.created_by != request.user:
            return Response(
                {"error": "Only the meeting creator can start this meeting."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if meeting.status == 'cancelled':
            return Response(
                {"error": "Cannot start a cancelled meeting."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if meeting.status == "ended":
            return Response(
                {"error": "This meeting has already ended."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        meeting.status = "live"
        meeting.save(update_fields = ["status","updated_at"])

        return Response({
            "message": "Meeting is now live.",
            "jitsi_url": meeting.jitsi_url,
            "room_name": meeting.room_name,
        })
    

class EndMeetingView(APIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def post(self, request, pk):
        meeting = get_object_or_404(Meeting, pk=pk, tenant=request.user.tenant)

        if meeting.created_by != request.user:
            return Response(
                {"error": "Only the meeting creator can end this meeting."},
                status=status.HTTP_403_FORBIDDEN,
            )

        meeting.status = "ended"
        meeting.save(update_fields=["status", "updated_at"])

        return Response({"message": "Meeting has ended."})


class JoinMeetingView(APIView):
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def post(self, request, pk):
        meeting = get_object_or_404(get_visible_meetings(request.user),pk=pk)

        if meeting.status == "cancelled":
            return Response(
                {"error": "This meeting has been cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if meeting.status == "ended":
            return Response(
                {"error": "This meeting has already ended."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "jitsi_url": meeting.jitsi_url,
            "room_name": meeting.room_name,
            "title": meeting.title,
        })  