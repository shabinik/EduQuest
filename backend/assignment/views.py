from django.shortcuts import render
from rest_framework import generics,status
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsTeacher,HasActiveSubscription
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, StudentAssignmentSubmissionSerializer,TeacherAssignmentSubmissionSerializer
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser


# Create your views here.


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class TeacherAssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]

    def get_queryset(self):
        return Assignment.objects.filter(
            teacher=self.request.user.teacher_profile,
            tenant=self.request.user.tenant
        ).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # Handle the classes[] format from FormData
        data = request.data.copy()
        
        # Convert classes[] to a list
        if 'classes[]' in data:
            classes_list = data.getlist('classes[]')
            data.setlist('classes', classes_list)
            # Remove the classes[] key
            del data['classes[]']
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TeacherAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated, IsTeacher, HasActiveSubscription]

    def get_queryset(self):
        return Assignment.objects.filter(
            tenant=self.request.user.tenant, 
            teacher=self.request.user.teacher_profile
        )
    
    def update(self, request, *args, **kwargs):
        # Handle the classes[] format from FormData
        data = request.data.copy()
        
        # Convert classes[] to a list
        if 'classes[]' in data:
            classes_list = data.getlist('classes[]')
            data.setlist('classes', classes_list)
            # Remove the classes[] key
            del data['classes[]']
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class StudentAssignmentListView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated,HasActiveSubscription]

    def get_queryset(self):
        student = self.request.user.student_profile
        return Assignment.objects.filter(
            tenant = self.request.user.tenant,
            classes = student.school_class
        ).select_related('subject','teacher__user').prefetch_related('submissions')
    
class StudentAssignmentSubmissionCreateView(generics.CreateAPIView):
    serializer_class = StudentAssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated,HasActiveSubscription]
    parser_classes = [MultiPartParser,FormParser,JSONParser]

    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            student = self.request.user.student_profile
        )
    

class StudentAssignmentSubmissionUpdateView(generics.UpdateAPIView):
    serializer_class = StudentAssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated, HasActiveSubscription]
    parser_classes = [MultiPartParser,FormParser,JSONParser]

    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            student = self.request.user.student_profile
        )
    

class TeacherSubmissionListView(generics.ListAPIView):
    serializer_class = TeacherAssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated,IsTeacher,HasActiveSubscription]

    def get_queryset(self):
        assignment_id = self.request.query_params.get("assignment")
        queryset =  AssignmentSubmission.objects.filter(
            assignment__id = assignment_id,
            assignment__teacher = self.request.user.teacher_profile
        ).select_related("student__user","assignment")
        return queryset
    

class TeacherSubmissionGradeView(generics.UpdateAPIView):
    serializer_class = TeacherAssignmentSubmissionSerializer
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
