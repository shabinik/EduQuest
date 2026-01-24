from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsTeacher,HasActiveSubscription
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer
from django.utils import timezone
from rest_framework.response import Response


# Create your views here.


class TeacherAssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get_queryset(self):
        return Assignment.objects.filter(
            teacher=self.request.user.teacher_profile,
            tenant=self.request.user.tenant
        )


    

class TeacherAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get_queryset(self):
        return Assignment.objects.filter(
            tenant = self.request.user.tenant, 
            teacher = self.request.user.teacher_profile
        )


class StudentAssignmentListView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get_queryset(self):
        student = self.request.user.teacher_profile
        return Assignment.objects.filter(
            tenant = self.request.user.tenant,
            classes = student.school_class
        )
    
class StudentAssignmentSubmissionCreateView(generics.CreateAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            student = self.request.user.student_profile
        )
    

class TeacherSubmissionListView(generics.ListAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            assignment__teacher = self.request.user.teacher_profile
        )
    

class TeacherSubmissionGradeView(generics.UpdateAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            assignment__teacher = self.request.user.teacher_profile
        )
    
    def perform_update(self, serializer):
        serializer.save(
            status = 'graded',
            graded_at = timezone.now()
        )
